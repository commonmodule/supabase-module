import { AuthTokenManager } from "@common-module/app";
import { EventContainer } from "@common-module/ts";
import { PostgrestBuilder, PostgrestFilterBuilder, PostgrestQueryBuilder, PostgrestTransformBuilder } from "@supabase/postgrest-js";
import { Provider, RealtimeChannel, User as SupabaseUser } from "@supabase/supabase-js";
import SubscribeToDataChangesOptions from "./SubscribeToDataChangesOptions.js";
import SubscribeToPresenceOptions from "./SubscribeToPresenceOptions.js";
export default class SupabaseConnector extends EventContainer<{
    sessionUserChanged: (user: SupabaseUser | undefined) => void;
}> {
    private supabaseUrl;
    private supabaseKey;
    private authTokenManager?;
    private client;
    private store;
    private sessionUser;
    constructor(supabaseUrl: string, supabaseKey: string, authTokenManager?: AuthTokenManager | undefined);
    private reconnect;
    signInWithOAuth(provider: Provider, scopes?: string[]): Promise<void>;
    signOut(): Promise<void>;
    get isSignedIn(): boolean;
    get signedUserId(): string | undefined;
    private checkInvalidJwtError;
    callEdgeFunction<T>(functionName: string, body?: Record<string, any> | FormData): Promise<T>;
    callDbFunction<T>(functionName: string, args?: Record<string, any>): Promise<T>;
    safeFetch<T>(table: string, build: (builder: PostgrestQueryBuilder<any, any, unknown>) => PostgrestFilterBuilder<any, any, any, unknown> | PostgrestBuilder<any>): Promise<T[]>;
    safeFetchSingle<T>(table: string, build: (builder: PostgrestQueryBuilder<any, any, unknown>) => PostgrestTransformBuilder<any, any, any, unknown>): Promise<T | undefined>;
    safeStore(table: string, build: (builder: PostgrestQueryBuilder<any, any, unknown>) => PostgrestFilterBuilder<any, any, any, unknown> | PostgrestBuilder<any>): Promise<void>;
    subscribeToBroadcast(channelName: string, listeners: {
        [event: string]: (message: any) => void;
    }): RealtimeChannel;
    subscribeToPresence<T extends {
        [key: string]: any;
    }>(channelName: string, options: SubscribeToPresenceOptions<T>, initialState: T): RealtimeChannel;
    subscribeToDataChanges<T extends {
        [key: string]: any;
    }>(channelName: string, options: SubscribeToDataChangesOptions<T>): RealtimeChannel;
}
//# sourceMappingURL=SupabaseConnector.d.ts.map