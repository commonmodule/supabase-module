import { createClient, SupabaseClient } from "@supabase/supabase-js";

class SupabaseAdapter {
  private client: SupabaseClient | undefined;
  private supabaseUrl: string | undefined;
  private supabaseKey: string | undefined;

  public init(
    supabaseUrl: string,
    supabaseKey: string,
    authorizationToken?: string,
  ) {
    if (this.supabaseUrl) {
      throw new Error("SupabaseAdapter already initialized");
    }

    this.supabaseUrl = supabaseUrl;
    this.supabaseKey = supabaseKey;
    this.reconnect(authorizationToken);
  }

  private reconnect(authorizationToken?: string) {
    this.client?.removeAllChannels();

    if (!this.supabaseUrl || !this.supabaseKey) {
      throw new Error("SupabaseAdapter not initialized");
    }

    this.client = createClient(this.supabaseUrl, this.supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
      },
      ...(authorizationToken
        ? {
          global: {
            headers: { Authorization: `Bearer ${authorizationToken}` },
          },
        }
        : {}),
    });
  }

  public async callFunction(functionName: string, body?: Record<string, any>) {
    if (!this.client) throw new Error("SupabaseAdapter not initialized");
    const { data, error } = await this.client.functions.invoke(functionName, {
      body,
    });
    if (error) throw error;
    return data;
  }
}

export default new SupabaseAdapter();
