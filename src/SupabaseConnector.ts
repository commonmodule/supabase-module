import { Store } from "@common-module/app";
import { EventContainer } from "@common-module/ts";
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
    this.fetchSessionUser();
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
    await this.client.auth.signInWithOAuth({
      provider,
      options: this.isDevMode
        ? { redirectTo: window.location.origin, scopes: scopes?.join(" ") }
        : (scopes ? { scopes: scopes?.join(" ") } : undefined),
    });
  }

  private async fetchSessionUser() {
    const { data, error } = await this.client.auth.getSession();
    if (error) throw error;

    const sessionUser = data?.session?.user;
    if (sessionUser) {
      this.store.setPermanent("sessionUser", sessionUser);
      this.sessionUser = sessionUser;
      this.emit("sessionUserChanged", sessionUser);
    } else {
      this.store.remove("sessionUser");
      if (this.sessionUser) {
        this.sessionUser = undefined;
        this.emit("sessionUserChanged", undefined);
      }
    }
  }

  public async signOut() {
    this.store.remove("sessionUser");
    this.sessionUser = undefined;
    this.emit("sessionUserChanged", undefined);

    await this.client.auth.signOut();
    await this.client.auth.refreshSession();
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
}

export default new SupabaseConnector();
