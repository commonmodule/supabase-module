import { EventContainer } from "@common-module/ts";
import { PostgrestBuilder, PostgrestFilterBuilder, PostgrestQueryBuilder, PostgrestTransformBuilder } from "@supabase/postgrest-js";
import { Provider, RealtimeChannel, User as SupabaseUser } from "@supabase/supabase-js";
import AuthTokenManager from "./AuthTokenManager.js";
import SubscribeToDataChangesOptions from "./SubscribeToDataChangesOptions.js";
export default class SupabaseConnector extends EventContainer<{
    sessionUserChanged: (user: SupabaseUser | undefined) => void;
}> {
    private supabaseUrl;
    private supabaseKey;
    private authTokenManager?;
    private client;
    private store;
    private sessionUser;
    constructor(supabaseUrl: string, supabaseKey: string, authTokenManager?: AuthTokenManager<Record<string, (...args: any[]) => any>> | undefined);
    private reconnect;
    signInWithOAuth(provider: Provider, scopes?: string[]): Promise<void>;
    signOut(): Promise<void>;
    get isSignedIn(): boolean;
    get signedUserId(): string | undefined;
    callEdgeFunction<T>(functionName: string, body?: Record<string, any> | FormData): Promise<T>;
    callDbFunction<T>(functionName: string, args?: Record<string, any>): Promise<T>;
    safeFetch<T>(table: string, build: (builder: PostgrestQueryBuilder<any, any, unknown>) => PostgrestFilterBuilder<any, any, any, unknown> | PostgrestBuilder<any>): Promise<T[]>;
    safeFetchSingle<T>(table: string, build: (builder: PostgrestQueryBuilder<any, any, unknown>) => PostgrestTransformBuilder<any, any, any, unknown>): Promise<T | undefined>;
    safeStore(table: string, build: (builder: PostgrestQueryBuilder<any, any, unknown>) => PostgrestFilterBuilder<any, any, any, unknown> | PostgrestBuilder<any>): Promise<void>;
    subscribeToDataChanges<T>(options: SubscribeToDataChangesOptions<T>): RealtimeChannel;
    uploadPublicFile(bucket: string, path: string, file: File): Promise<string>;
}
//# sourceMappingURL=SupabaseConnector.d.ts.map