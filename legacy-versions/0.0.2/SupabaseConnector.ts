import { TokenManager } from "@common-module/ts";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

class SupabaseConnector {
  private client: SupabaseClient | undefined;
  private supabaseUrl: string | undefined;
  private supabaseKey: string | undefined;
  private tokenManager: TokenManager | undefined;

  public init(options: {
    supabaseUrl: string;
    supabaseKey: string;
    tokenManager?: TokenManager;
  }) {
    if (this.supabaseUrl) {
      throw new Error("SupabaseConnector already initialized");
    }

    this.supabaseUrl = options.supabaseUrl;
    this.supabaseKey = options.supabaseKey;
    this.tokenManager = options.tokenManager;

    this.reconnect();
    this.tokenManager?.on("tokenChanged", () => this.reconnect());
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
      ...(this.tokenManager
        ? {
          global: {
            headers: {
              Authorization: `Bearer ${this.tokenManager.token}`,
            },
          },
        }
        : {}),
    });
  }
}

export default new SupabaseConnector();
