import { Store } from "@common-module/app";
class SupabaseAuthManager {
    store = new Store("supabase-auth");
    token;
    constructor() {
        this.token = this.store.get("token");
    }
    async init() {
    }
    async signIn() {
    }
    async signOut() {
        this.store.delete("token");
        this.token = undefined;
    }
}
export default new SupabaseAuthManager();
//# sourceMappingURL=SupabaseAuthManager.js.map