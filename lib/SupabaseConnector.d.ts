import { Provider } from "@supabase/supabase-js";
import AuthTokenManager from "./AuthTokenManager.js";
declare class SupabaseConnector {
    private supabaseUrl;
    private supabaseKey;
    private client;
    private authTokenManager;
    isDevMode: boolean;
    init(supabaseUrl: string, supabaseKey: string, authTokenManager?: AuthTokenManager): void;
    private reconnect;
    signInWithOAuth(provider: Provider, scopes?: string[]): Promise<void>;
}
declare const _default: SupabaseConnector;
export default _default;
//# sourceMappingURL=SupabaseConnector.d.ts.map