import { createClient } from "@supabase/supabase-js";
class SupabaseConnector {
    supabaseUrl;
    supabaseKey;
    client;
    authTokenManager;
    isDevMode = false;
    init(supabaseUrl, supabaseKey, authTokenManager) {
        if (this.supabaseUrl) {
            throw new Error("SupabaseConnector already initialized");
        }
        this.supabaseUrl = supabaseUrl;
        this.supabaseKey = supabaseKey;
        this.authTokenManager = authTokenManager;
        this.reconnect();
        authTokenManager?.on("tokenChanged", () => this.reconnect());
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
    async signInWithOAuth(provider, scopes) {
        if (!this.client)
            throw new Error("SupabaseConnector not initialized");
        await this.client.auth.signInWithOAuth({
            provider,
            options: this.isDevMode
                ? { redirectTo: window.location.origin, scopes: scopes?.join(" ") }
                : (scopes ? { scopes: scopes?.join(" ") } : undefined),
        });
    }
}
export default new SupabaseConnector();
//# sourceMappingURL=SupabaseConnector.js.map