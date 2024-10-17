import { EventContainer } from "@common-module/ts";
import { PostgrestBuilder, PostgrestFilterBuilder, PostgrestQueryBuilder, PostgrestTransformBuilder } from "@supabase/postgrest-js";
import { Provider, RealtimeChannel, User as SupabaseUser } from "@supabase/supabase-js";
import AuthTokenManager from "./AuthTokenManager.js";
import SubscribeToDataChangesOptions from "./SubscribeToDataChangesOptions.js";
declare class SupabaseConnector extends EventContainer<{
    sessionUserChanged: (user: SupabaseUser | undefined) => void;
}> {
    isDevMode: boolean;
    private supabaseUrl;
    private supabaseKey;
    private _client;
    private authTokenManager;
    private store;
    private sessionUser;
    init(supabaseUrl: string, supabaseKey: string, authTokenManager?: AuthTokenManager): void;
    private reconnect;
    private get client();
    signInWithOAuth(provider: Provider, scopes?: string[]): Promise<void>;
    signOut(): Promise<void>;
    get isSignedIn(): boolean;
    private convertNullToUndefined;
    private safeResult;
    callFunction<T>(functionName: string, body?: Record<string, any>): Promise<T>;
    callDbFunction<T>(functionName: string, args?: Record<string, any>): Promise<T>;
    safeFetch<T>(table: string, build: (builder: PostgrestQueryBuilder<any, any, unknown>) => PostgrestFilterBuilder<any, any, any, unknown> | PostgrestBuilder<any>): Promise<T[]>;
    safeFetchSingle<T>(table: string, build: (builder: PostgrestQueryBuilder<any, any, unknown>) => PostgrestTransformBuilder<any, any, any, unknown>): Promise<T | undefined>;
    safeStore(table: string, build: (builder: PostgrestQueryBuilder<any, any, unknown>) => PostgrestFilterBuilder<any, any, any, unknown> | PostgrestBuilder<any>): Promise<void>;
    subscribeToDataChanges<T>(options: SubscribeToDataChangesOptions<T>): RealtimeChannel;
}
declare const _default: SupabaseConnector;
export default _default;
//# sourceMappingURL=SupabaseConnector.d.ts.map