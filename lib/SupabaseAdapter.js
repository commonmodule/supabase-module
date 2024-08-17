import { createClient } from "@supabase/supabase-js";
class SupabaseAdapter {
    client;
    supabaseUrl;
    supabaseKey;
    init(supabaseUrl, supabaseKey, authorizationToken) {
        if (this.supabaseUrl) {
            throw new Error("SupabaseAdapter already initialized");
        }
        this.supabaseUrl = supabaseUrl;
        this.supabaseKey = supabaseKey;
        this.reconnect(authorizationToken);
    }
    reconnect(authorizationToken) {
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
    async callFunction(functionName, body) {
        if (!this.client)
            throw new Error("SupabaseAdapter not initialized");
        const { data, error } = await this.client.functions.invoke(functionName, {
            body,
        });
        if (error)
            throw error;
        return data;
    }
}
export default new SupabaseAdapter();
//# sourceMappingURL=SupabaseAdapter.js.map