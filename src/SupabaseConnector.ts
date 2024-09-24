import { createClient, Provider, SupabaseClient } from "@supabase/supabase-js";
import AuthTokenManager from "./AuthTokenManager.js";

class SupabaseConnector {
  private supabaseUrl: string | undefined;
  private supabaseKey: string | undefined;

  private client: SupabaseClient | undefined;
  private authTokenManager: AuthTokenManager | undefined;

  public isDevMode = false;

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
  }

  private reconnect() {
    this.client?.removeAllChannels();

    if (!this.supabaseUrl || !this.supabaseKey) {
      throw new Error("SupabaseConnector not initialized");
    }

    this.client = createClient(this.supabaseUrl, this.supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
      },
      ...(this.authTokenManager
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
    if (!this.client) throw new Error("SupabaseConnector not initialized");

    await this.client.auth.signInWithOAuth({
      provider,
      options: this.isDevMode
        ? { redirectTo: window.location.origin, scopes: scopes?.join(" ") }
        : (scopes ? { scopes: scopes?.join(" ") } : undefined),
    });
  }
}

export default new SupabaseConnector();
