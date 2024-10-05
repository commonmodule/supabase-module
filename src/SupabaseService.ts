import {
  PostgrestFilterBuilder
} from "@supabase/postgrest-js";
import SupabaseConnector from "./SupabaseConnector.js";

export default class SupabaseService<T> {
  constructor(
    private table: string,
    private defaultQuery: string,
    private defaultLimit: number,
  ) {}

  protected async fetchSingle(
    build: (
      builder: PostgrestFilterBuilder<any, any, any, unknown>,
    ) => PostgrestFilterBuilder<any, any, any, unknown>,
  ) {
    return await SupabaseConnector.safeFetchSingle<T>(
      this.table,
      (b) => build(b.select(this.defaultQuery)),
    );
  }
}
