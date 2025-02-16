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
        const supabaseId = new URL(supabaseUrl).hostname.split(".")[0];
        this.store = new Store(`supabase-connector-${supabaseId}`);
        this.sessionUser = this.store.get("sessionUser");
        this.reconnect();
        authTokenManager?.on("tokenChanged", () => this.reconnect());
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
    async checkInvalidJwtError(error) {
        if (this.authTokenManager && error.context?.body) {
            try {
                const response = new Response(error.context.body);
                const result = await response.json();
                if (result.code === 401 && result.message === "Invalid JWT") {
                    this.authTokenManager.token = undefined;
                }
            }
            catch (e) {
                console.error("Error parsing response body", e);
            }
        }
    }
    async callEdgeFunction(functionName, body) {
        const { data, error } = await this.client.functions.invoke(functionName, {
            body,
        });
        if (error) {
            await this.checkInvalidJwtError(error);
            throw error;
        }
        return SupabaseUtils.safeResult(data);
    }
    async callDbFunction(functionName, args) {
        const { data, error } = await this.client.rpc(functionName, args);
        if (error) {
            await this.checkInvalidJwtError(error);
            throw error;
        }
        return SupabaseUtils.safeResult(data);
    }
    async safeFetch(table, build) {
        const { data, error } = await build(this.client.from(table));
        if (error) {
            await this.checkInvalidJwtError(error);
            throw error;
        }
        return SupabaseUtils.safeResult(data);
    }
    async safeFetchSingle(table, build) {
        const { data, error } = await build(this.client.from(table))
            .maybeSingle();
        if (error) {
            await this.checkInvalidJwtError(error);
            throw error;
        }
        return data ? SupabaseUtils.safeResult(data) : undefined;
    }
    async safeStore(table, build) {
        const { error } = await build(this.client.from(table));
        if (error) {
            await this.checkInvalidJwtError(error);
            throw error;
        }
    }
    subscribeToBroadcast(channelName, listeners) {
        const channel = this.client.channel(channelName);
        for (const [event, listener] of Object.entries(listeners)) {
            channel.on("broadcast", { event }, (p) => listener(p.payload));
        }
        channel.subscribe();
        return channel;
    }
    subscribeToPresence(channelName, options, initialState) {
        const channel = this.client.channel(channelName);
        channel.on("presence", { event: "sync" }, () => options.onSync(channel.presenceState()));
        if (options.onJoin) {
            channel.on("presence", { event: "join" }, ({ key, newPresences }) => options.onJoin(key, newPresences));
        }
        if (options.onLeave) {
            channel.on("presence", { event: "leave" }, ({ key, leftPresences }) => options.onLeave(key, leftPresences));
        }
        channel.subscribe(async (status, error) => {
            if (status === "SUBSCRIBED") {
                await channel.track(initialState);
            }
            if (error)
                console.error(status, error);
        });
        return channel;
    }
    subscribeToDataChanges(channelName, options) {
        return this.client.channel(channelName).on("postgres_changes", {
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
        }).subscribe((status, error) => {
            if (status === "SUBSCRIBED") {
                options.onSubscribe();
            }
            if (error)
                console.error(status, error);
        });
    }
}
//# sourceMappingURL=SupabaseConnector.js.map