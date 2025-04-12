import { AuthTokenManager, Store } from "@common-module/app";
import { EventContainer, ObjectUtils } from "@common-module/ts";
import {
  PostgrestBuilder,
  PostgrestFilterBuilder,
  PostgrestQueryBuilder,
  PostgrestTransformBuilder,
} from "@supabase/postgrest-js";
import {
  createClient,
  Provider,
  RealtimeChannel,
  SupabaseClient,
  User as SupabaseUser,
} from "@supabase/supabase-js";
import SubscribeToDataChangesOptions from "./SubscribeToDataChangesOptions.js";
import SubscribeToPresenceOptions from "./SubscribeToPresenceOptions.js";
import SupabaseUtils from "./SupabaseUtils.js";

export default class SupabaseConnector extends EventContainer<{
  sessionUserChanged: (user: SupabaseUser | undefined) => void;
}> {
  private client!: SupabaseClient;
  private store: Store;
  private sessionUser: SupabaseUser | undefined;

  constructor(
    private supabaseUrl: string,
    private supabaseKey: string,
    private authTokenManager?: AuthTokenManager,
  ) {
    super();

    const supabaseId = new URL(supabaseUrl).hostname.split(".")[0] as Lowercase<
      string
    >;
    this.store = new Store(`supabase-connector-${supabaseId}`);
    this.sessionUser = this.store.get<SupabaseUser>("sessionUser");

    this.reconnect();
    authTokenManager?.on("tokenChanged", () => this.reconnect());
  }

  private reconnect() {
    this.client?.removeAllChannels();

    this.client = createClient(this.supabaseUrl, this.supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
      },
      ...(this.authTokenManager?.token
        ? {
          global: {
            headers: {
              Authorization: `Bearer ${this.authTokenManager.token}`,
            },
          },
        }
        : {}),
    });

    this.client.auth.onAuthStateChange((_, session) => {
      const newSessionUser = session?.user;
      if (ObjectUtils.isEqual(newSessionUser, this.sessionUser)) return;

      if (newSessionUser) {
        this.store.setPermanent("sessionUser", session.user);
        this.sessionUser = session.user;
        this.emit("sessionUserChanged", session.user);
      } else {
        this.store.remove("sessionUser");
        if (this.sessionUser) {
          this.sessionUser = undefined;
          this.emit("sessionUserChanged", undefined);
        }
      }
    });
  }

  public async signInWithOAuth(provider: Provider, scopes?: string[]) {
    await this.client.auth.signInWithOAuth({
      provider,
      options: {
        scopes: scopes?.join(" "),
        redirectTo: window.location.origin,
      },
    });
  }

  public async signOut() {
    this.store.remove("sessionUser");
    this.sessionUser = undefined;
    this.emit("sessionUserChanged", undefined);

    await this.client.auth.signOut();
  }

  public get isSignedIn() {
    return !!this.sessionUser;
  }

  public get signedUserId() {
    return this.sessionUser?.id;
  }

  private async checkInvalidJwtError(error: any) {
    if (this.authTokenManager && error.context?.body) {
      try {
        const response = new Response(error.context.body);
        const result = await response.json();
        if (result.code === 401 && result.message === "Invalid JWT") {
          this.authTokenManager.token = undefined;
        }
      } catch (e) {
        console.error("Error parsing response body", e);
      }
    }
  }

  public async callEdgeFunction<T>(
    functionName: string,
    body?: Record<string, any> | FormData,
  ): Promise<T> {
    const { data, error } = await this.client.functions.invoke(functionName, {
      body,
    });
    if (error) {
      await this.checkInvalidJwtError(error);
      throw error;
    }
    return SupabaseUtils.safeResult<T>(data);
  }

  public async callDbFunction<T>(
    functionName: string,
    args?: Record<string, any>,
  ): Promise<T> {
    const { data, error } = await this.client.rpc(functionName, args);
    if (error) {
      await this.checkInvalidJwtError(error);
      throw error;
    }
    return SupabaseUtils.safeResult<T>(data);
  }

  public async safeFetch<T>(
    table: string,
    build: (
      builder: PostgrestQueryBuilder<any, any, unknown>,
    ) => PostgrestFilterBuilder<any, any, any, unknown> | PostgrestBuilder<any>,
  ) {
    const { data, error } = await build(this.client.from(table));
    if (error) {
      await this.checkInvalidJwtError(error);
      throw error;
    }
    return SupabaseUtils.safeResult<T[]>(data);
  }

  public async safeFetchSingle<T>(
    table: string,
    build: (
      builder: PostgrestQueryBuilder<any, any, unknown>,
    ) => PostgrestTransformBuilder<any, any, any, unknown>,
  ) {
    const { data, error } = await build(this.client.from(table))
      .maybeSingle<T>();
    if (error) {
      await this.checkInvalidJwtError(error);
      throw error;
    }
    return data ? SupabaseUtils.safeResult<T>(data) : undefined;
  }

  public async safeStore(
    table: string,
    build: (
      builder: PostgrestQueryBuilder<any, any, unknown>,
    ) => PostgrestFilterBuilder<any, any, any, unknown> | PostgrestBuilder<any>,
  ) {
    const { error } = await build(this.client.from(table));
    if (error) {
      await this.checkInvalidJwtError(error);
      throw error;
    }
  }

  public subscribeToBroadcast(
    channelName: string,
    listeners: { [event: string]: (message: any) => void },
  ) {
    const channel = this.client.channel(channelName);

    for (const [event, listener] of Object.entries(listeners)) {
      channel.on("broadcast", { event }, (p) => listener(p.payload));
    }

    channel.subscribe();

    return channel;
  }

  public subscribeToPresence<T extends { [key: string]: any }>(
    channelName: string,
    options: SubscribeToPresenceOptions<T>,
    initialState: T,
  ) {
    const channel = this.client.channel(channelName);

    channel.on(
      "presence",
      { event: "sync" },
      () => options.onSync(channel.presenceState()),
    );

    if (options.onJoin) {
      channel.on<T>(
        "presence",
        { event: "join" },
        ({ key, newPresences }) => options.onJoin!(key, newPresences),
      );
    }

    if (options.onLeave) {
      channel.on<T>(
        "presence",
        { event: "leave" },
        ({ key, leftPresences }) => options.onLeave!(key, leftPresences),
      );
    }

    channel.subscribe(async (status, error) => {
      if (status === "SUBSCRIBED") {
        await channel.track(initialState);
      }
      if (error) console.error(status, error);
    });

    return channel;
  }

  public subscribeToDataChanges<T extends { [key: string]: any }>(
    channelName: string,
    options: SubscribeToDataChangesOptions<T>,
  ): RealtimeChannel {
    return this.client.channel(channelName).on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: options.table,
        filter: options.filter,
      },
      (payload) => {
        if (payload.eventType === "INSERT") {
          options.onInsert?.(payload.new as T);
        } else if (payload.eventType === "UPDATE") {
          options.onUpdate?.(payload.new as T);
        } else if (payload.eventType === "DELETE") {
          options.onDelete?.(payload.old as T);
        }
      },
    ).subscribe((status, error) => {
      if (status === "SUBSCRIBED") {
        options.onSubscribe();
      }
      if (error) console.error(status, error);
    });
  }
}
