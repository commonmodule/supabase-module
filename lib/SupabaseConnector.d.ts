import { Provider } from "@supabase/supabase-js";
import AuthTokenManager from "./AuthTokenManager.js";
declare class SupabaseConnector {
    private supabaseUrl;
    private supabaseKey;
    private _client;
    private authTokenManager;
    isDevMode: boolean;
    init(supabaseUrl: string, supabaseKey: string, authTokenManager?: AuthTokenManager): void;
    private reconnect;
    private get client();
    signInWithOAuth(provider: Provider, scopes?: string[]): Promise<void>;
    callFunction(functionName: string, body?: Record<string, any>): Promise<any>;
}
declare const _default: SupabaseConnector;
export default _default;
//# sourceMappingURL=SupabaseConnector.d.ts.map