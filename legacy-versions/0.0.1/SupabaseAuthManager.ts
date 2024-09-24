import { Store } from "@common-module/app";

class SupabaseAuthManager {
  private store = new Store("supabase-auth");
  private token: string | undefined;

  constructor() {
    this.token = this.store.get("token");
  }

  public async init() {
  }

  public async signIn() {
  }

  public async signOut() {
    this.store.delete("token");
    this.token = undefined;
  }
}

export default new SupabaseAuthManager();
