declare class SupabaseAdapter {
    private client;
    private supabaseUrl;
    private supabaseKey;
    init(supabaseUrl: string, supabaseKey: string, authorizationToken?: string): void;
    private reconnect;
    callFunction(functionName: string, body?: Record<string, any>): Promise<any>;
}
declare const _default: SupabaseAdapter;
export default _default;
//# sourceMappingURL=SupabaseAdapter.d.ts.map