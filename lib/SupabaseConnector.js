import { createClient } from "@supabase/supabase-js";
class SupabaseConnector {
    supabaseUrl;
    supabaseKey;
    _client;
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
        this._client?.removeAllChannels();
        if (!this.supabaseUrl || !this.supabaseKey) {
            throw new Error("SupabaseConnector not initialized");
        }
        this._client = createClient(this.supabaseUrl, this.supabaseKey, {
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
    get client() {
        if (!this._client)
            throw new Error("SupabaseConnector not initialized");
        return this._client;
    }
    async signInWithOAuth(provider, scopes) {
        await this.client.auth.signInWithOAuth({
            provider,
            options: this.isDevMode
                ? { redirectTo: window.location.origin, scopes: scopes?.join(" ") }
                : (scopes ? { scopes: scopes?.join(" ") } : undefined),
        });
    }
    async callFunction(functionName, body) {
        const { data, error } = await this.client.functions.invoke(functionName, {
            body,
        });
        if (error)
            throw error;
        return data;
    }
}
export default new SupabaseConnector();
//# sourceMappingURL=SupabaseConnector.js.map