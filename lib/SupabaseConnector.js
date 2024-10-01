import { Store } from "@common-module/app";
import { EventContainer } from "@common-module/ts";
import { createClient, } from "@supabase/supabase-js";
class SupabaseConnector extends EventContainer {
    isDevMode = false;
    supabaseUrl;
    supabaseKey;
    _client;
    authTokenManager;
    store = new Store("supabase-connector");
    sessionUser;
    init(supabaseUrl, supabaseKey, authTokenManager) {
        if (this.supabaseUrl) {
            throw new Error("SupabaseConnector already initialized");
        }
        this.supabaseUrl = supabaseUrl;
        this.supabaseKey = supabaseKey;
        this.authTokenManager = authTokenManager;
        this.reconnect();
        authTokenManager?.on("tokenChanged", () => this.reconnect());
        this.sessionUser = this.store.get("sessionUser");
        this.fetchSessionUser();
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
    async fetchSessionUser() {
        const { data, error } = await this.client.auth.getSession();
        if (error)
            throw error;
        const sessionUser = data?.session?.user;
        if (sessionUser) {
            this.store.setPermanent("sessionUser", sessionUser);
            this.sessionUser = sessionUser;
            this.emit("sessionUserChanged", sessionUser);
        }
        else {
            this.store.remove("sessionUser");
            if (this.sessionUser) {
                this.sessionUser = undefined;
                this.emit("sessionUserChanged", undefined);
            }
        }
    }
    async signOut() {
        this.store.remove("sessionUser");
        this.sessionUser = undefined;
        this.emit("sessionUserChanged", undefined);
        await this.client.auth.signOut();
        await this.client.auth.refreshSession();
    }
    get isSignedIn() {
        return !!this.sessionUser;
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