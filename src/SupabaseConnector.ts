import { Store } from "@common-module/app";
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
import { v4 as uuidv4 } from "uuid";
import AuthTokenManager from "./AuthTokenManager.js";
import SubscribeToDataChangesOptions from "./SubscribeToDataChangesOptions.js";
import SupabaseUtils from "./SupabaseUtils.js";

export default class SupabaseConnector extends EventContainer<{
  sessionUserChanged: (user: SupabaseUser | undefined) => void;
}> {
  private client!: SupabaseClient;
  private store: Store<string>;
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

  public async callEdgeFunction<T>(
    functionName: string,
    body?: Record<string, any> | FormData,
  ): Promise<T> {
    const { data, error } = await this.client.functions.invoke(functionName, {
      body,
    });
    if (error) throw error;
    return SupabaseUtils.safeResult<T>(data);
  }

  public async callDbFunction<T>(
    functionName: string,
    args?: Record<string, any>,
  ): Promise<T> {
    const { data, error } = await this.client.rpc(functionName, args);
    if (error) throw error;
    return SupabaseUtils.safeResult<T>(data);
  }

  public async safeFetch<T>(
    table: string,
    build: (
      builder: PostgrestQueryBuilder<any, any, unknown>,
    ) => PostgrestFilterBuilder<any, any, any, unknown> | PostgrestBuilder<any>,
  ) {
    const { data, error } = await build(this.client.from(table));
    if (error) throw error;
    return SupabaseUtils.safeResult<T[]>(data);
  }

  public async safeFetchSingle<T>(
    table: string,
    build: (
      builder: PostgrestQueryBuilder<any, any, unknown>,
    ) => PostgrestTransformBuilder<any, any, any, unknown>,
  ) {
    const { data, error } = await build(this.client.from(table)).limit(1);
    if (error) throw error;
    return data?.[0] ? SupabaseUtils.safeResult<T>(data[0]) : undefined;
  }

  public async safeStore(
    table: string,
    build: (
      builder: PostgrestQueryBuilder<any, any, unknown>,
    ) => PostgrestFilterBuilder<any, any, any, unknown> | PostgrestBuilder<any>,
  ) {
    const { error } = await build(this.client.from(table));
    if (error) throw error;
  }

  public subscribeToDataChanges<T>(
    options: SubscribeToDataChangesOptions<T>,
  ): RealtimeChannel {
    return this.client.channel(options.channel).on(
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
    );
  }

  public async uploadPublicFile(
    bucket: string,
    path: string,
    file: File,
  ): Promise<string> {
    const fileExt = file.name.split(".").pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    const { error: uploadError } = await this.client.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: "31536000",
        contentType: file.type,
      });
    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = this.client.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrl;
  }
}
