import { Store } from "@common-module/app";
import { EventContainer, ObjectUtils } from "@common-module/ts";
import { createClient, } from "@supabase/supabase-js";
import SupabaseUtils from "./SupabaseUtils.js";
export default class SupabaseConnector extends EventContainer {
    supabaseUrl;
    supabaseKey;
    authTokenManager;
    client;
    store;
    sessionUser;
    constructor(supabaseUrl, supabaseKey, authTokenManager) {
        super();
        this.supabaseUrl = supabaseUrl;
        this.supabaseKey = supabaseKey;
        this.authTokenManager = authTokenManager;
        this.store = new Store(`supabase-connector-${supabaseUrl}`);
        this.sessionUser = this.store.get("sessionUser");
        this.reconnect();
        authTokenManager?.on("tokenChanged", () => this.reconnect());
        this.client.auth.onAuthStateChange((_, session) => {
            const newSessionUser = session?.user;
            if (ObjectUtils.isEqual(newSessionUser, this.sessionUser))
                return;
            if (newSessionUser) {
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
        this.client?.removeAllChannels();
        this.client = createClient(this.supabaseUrl, this.supabaseKey, {
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
    async signInWithOAuth(provider, scopes) {
        await this.client.auth.signInWithOAuth({
            provider,
            options: {
                scopes: scopes?.join(" "),
                redirectTo: window.location.origin,
            },
        });
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
    get signedUserId() {
        return this.sessionUser?.id;
    }
    async callEdgeFunction(functionName, body) {
        const { data, error } = await this.client.functions.invoke(functionName, {
            body,
        });
        if (error)
            throw error;
        return SupabaseUtils.safeResult(data);
    }
    async callDbFunction(functionName, args) {
        const { data, error } = await this.client.rpc(functionName, args);
        if (error)
            throw error;
        return SupabaseUtils.safeResult(data);
    }
    async safeFetch(table, build) {
        const { data, error } = await build(this.client.from(table));
        if (error)
            throw error;
        return SupabaseUtils.safeResult(data);
    }
    async safeFetchSingle(table, build) {
        const { data, error } = await build(this.client.from(table)).limit(1);
        if (error)
            throw error;
        return data?.[0] ? SupabaseUtils.safeResult(data[0]) : undefined;
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
//# sourceMappingURL=SupabaseConnector.js.map