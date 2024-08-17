declare class AuthManager {
    private store;
    private token;
    constructor();
    init(): Promise<void>;
    signIn(): Promise<void>;
    signOut(): Promise<void>;
}
declare const _default: AuthManager;
export default _default;
//# sourceMappingURL=SupabaseAuthManager.d.ts.map