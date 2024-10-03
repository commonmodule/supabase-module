import { EventContainer } from "@common-module/ts";
import { Provider, User as SupabaseUser } from "@supabase/supabase-js";
import AuthTokenManager from "./AuthTokenManager.js";
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
    callFunction(functionName: string, body?: Record<string, any>): Promise<any>;
}
declare const _default: SupabaseConnector;
export default _default;
//# sourceMappingURL=SupabaseConnector.d.ts.map