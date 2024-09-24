import { TokenManager } from "@common-module/ts";
declare class SupabaseConnector {
    private client;
    private supabaseUrl;
    private supabaseKey;
    private tokenManager;
    init(options: {
        supabaseUrl: string;
        supabaseKey: string;
        tokenManager?: TokenManager;
    }): void;
    private reconnect;
}
declare const _default: SupabaseConnector;
export default _default;
//# sourceMappingURL=SupabaseAdapter.d.ts.map