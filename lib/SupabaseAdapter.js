import { createClient } from "@supabase/supabase-js";
class SupabaseConnector {
    client;
    supabaseUrl;
    supabaseKey;
    tokenManager;
    init(options) {
        if (this.supabaseUrl) {
            throw new Error("SupabaseConnector already initialized");
        }
        this.supabaseUrl = options.supabaseUrl;
        this.supabaseKey = options.supabaseKey;
        this.tokenManager = options.tokenManager;
        this.reconnect();
        this.tokenManager?.on("tokenChanged", () => this.reconnect());
    }
    reconnect() {
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
//# sourceMappingURL=SupabaseAdapter.js.map