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
        this.client.auth.onAuthStateChange((_, session) => {
            if (session?.user) {
                this.store.setPermanent("sessionUser", session.user);
                this.sessionUser = session.user;
                this.emit("sessionUserChanged", session.user);
            }
            else {
                this.store.remove("sessionUser");
                if (this.sessionUser) {
                    this.sessionUser = undefined;
                    this.emit("sessionUserChanged", undefined);
                }
            }
        });
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
        const options = {
            scopes: scopes?.join(" "),
        };
        if (this.isDevMode) {
            options.redirectTo = window.location.origin;
        }
        await this.client.auth.signInWithOAuth({ provider, options });
    }
    async signOut() {
        this.store.remove("sessionUser");
        this.sessionUser = undefined;
        this.emit("sessionUserChanged", undefined);
        await this.client.auth.signOut();
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