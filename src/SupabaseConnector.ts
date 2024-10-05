import { Store } from "@common-module/app";
import { EventContainer } from "@common-module/ts";
import {
  PostgrestBuilder,
  PostgrestFilterBuilder,
  PostgrestQueryBuilder,
  PostgrestTransformBuilder,
} from "@supabase/postgrest-js";
import {
  createClient,
  Provider,
  SupabaseClient,
  User as SupabaseUser,
} from "@supabase/supabase-js";
import AuthTokenManager from "./AuthTokenManager.js";

class SupabaseConnector extends EventContainer<{
  sessionUserChanged: (user: SupabaseUser | undefined) => void;
}> {
  public isDevMode = false;

  private supabaseUrl: string | undefined;
  private supabaseKey: string | undefined;

  private _client: SupabaseClient | undefined;
  private authTokenManager: AuthTokenManager | undefined;
  private store = new Store("supabase-connector");

  private sessionUser: SupabaseUser | undefined;

  public init(
    supabaseUrl: string,
    supabaseKey: string,
    authTokenManager?: AuthTokenManager,
  ) {
    if (this.supabaseUrl) {
      throw new Error("SupabaseConnector already initialized");
    }

    this.supabaseUrl = supabaseUrl;
    this.supabaseKey = supabaseKey;
    this.authTokenManager = authTokenManager;

    this.reconnect();
    authTokenManager?.on("tokenChanged", () => this.reconnect());

    this.sessionUser = this.store.get<SupabaseUser>("sessionUser");

    this.client.auth.onAuthStateChange((_, session) => {
      if (session?.user) {
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
    this._client?.removeAllChannels();

    if (!this.supabaseUrl || !this.supabaseKey) {
      throw new Error("SupabaseConnector not initialized");
    }

    this._client = createClient(this.supabaseUrl, this.supabaseKey, {
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

  private get client() {
    if (!this._client) throw new Error("SupabaseConnector not initialized");
    return this._client;
  }

  public async signInWithOAuth(provider: Provider, scopes?: string[]) {
    const options: any = {
      scopes: scopes?.join(" "),
    };
    if (this.isDevMode) {
      options.redirectTo = window.location.origin;
    }
    await this.client.auth.signInWithOAuth({ provider, options });
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

  public async callFunction(functionName: string, body?: Record<string, any>) {
    const { data, error } = await this.client.functions.invoke(functionName, {
      body,
    });
    if (error) throw error;
    return data;
  }

  private convertNullToUndefined(obj: any) {
    Object.keys(obj).forEach((key) => {
      if (obj[key] === null) obj[key] = undefined;
      else if (typeof obj[key] === "object" && obj[key] !== null) {
        this.convertNullToUndefined(obj[key]);
      }
    });
  }

  private safeResult<T>(data: T): T {
    if (Array.isArray(data)) {
      data.forEach((obj) => this.convertNullToUndefined(obj));
    } else this.convertNullToUndefined(data);
    return data;
  }

  public async safeFetch<T>(
    table: string,
    build: (
      builder: PostgrestQueryBuilder<any, any, unknown>,
    ) => PostgrestFilterBuilder<any, any, any, unknown> | PostgrestBuilder<any>,
  ) {
    const { data, error } = await build(this.client.from(table));
    if (error) throw error;
    return this.safeResult<T[]>(data);
  }

  public async safeFetchSingle<T>(
    table: string,
    build: (
      builder: PostgrestQueryBuilder<any, any, unknown>,
    ) => PostgrestTransformBuilder<any, any, any, unknown>,
  ) {
    const { data, error } = await build(this.client.from(table)).limit(1);
    if (error) throw error;
    return data?.[0] ? this.safeResult<T>(data[0]) : undefined;
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
}

export default new SupabaseConnector();
