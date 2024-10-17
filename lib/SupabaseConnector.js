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
    sessionUser = this.store.get("sessionUser");
    init(supabaseUrl, supabaseKey, authTokenManager) {
        if (this.supabaseUrl) {
            throw new Error("SupabaseConnector already initialized");
        }
        this.supabaseUrl = supabaseUrl;
        this.supabaseKey = supabaseKey;
        this.authTokenManager = authTokenManager;
        this.reconnect();
        authTokenManager?.on("tokenChanged", () => this.reconnect());
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
    convertNullToUndefined(obj) {
        Object.keys(obj).forEach((key) => {
            if (obj[key] === null)
                obj[key] = undefined;
            else if (typeof obj[key] === "object" && obj[key] !== null) {
                this.convertNullToUndefined(obj[key]);
            }
        });
    }
    safeResult(data) {
        if (Array.isArray(data)) {
            data.forEach((obj) => this.convertNullToUndefined(obj));
        }
        else
            this.convertNullToUndefined(data);
        return data;
    }
    async callFunction(functionName, body) {
        const { data, error } = await this.client.functions.invoke(functionName, {
            body,
        });
        if (error)
            throw error;
        return this.safeResult(data);
    }
    async callDbFunction(functionName, args) {
        const { data, error } = await this.client.rpc(functionName, args);
        if (error)
            throw error;
        return this.safeResult(data);
    }
    async safeFetch(table, build) {
        const { data, error } = await build(this.client.from(table));
        if (error)
            throw error;
        return this.safeResult(data);
    }
    async safeFetchSingle(table, build) {
        const { data, error } = await build(this.client.from(table)).limit(1);
        if (error)
            throw error;
        return data?.[0] ? this.safeResult(data[0]) : undefined;
    }
    async safeStore(table, build) {
        const { error } = await build(this.client.from(table));
        if (error)
            throw error;
    }
    subscribeToDataChanges(options) {
        return this.client.channel(options.channel).on("postgres_changes", {
            event: "*",
            schema: "public",
            table: options.table,
            filter: options.filter,
        }, (payload) => {
            if (payload.eventType === "INSERT") {
                options.onInsert?.(payload.new);
            }
            else if (payload.eventType === "UPDATE") {
                options.onUpdate?.(payload.new);
            }
            else if (payload.eventType === "DELETE") {
                options.onDelete?.(payload.old);
            }
        });
    }
}
export default new SupabaseConnector();
//# sourceMappingURL=SupabaseConnector.js.map