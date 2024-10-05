import { PostgrestFilterBuilder } from "@supabase/postgrest-js";
import SupabaseConnector from "./SupabaseConnector.js";

export default class SupabaseService<DT> {
  constructor(
    private table: string,
    private defaultQuery: string,
  ) {}

  protected async fetch<T = DT>(
    build: (
      builder: PostgrestFilterBuilder<any, any, any, unknown>,
    ) => PostgrestFilterBuilder<any, any, any, unknown>,
    query = this.defaultQuery,
  ) {
    return await SupabaseConnector.safeFetch<T>(
      this.table,
      (b) => build(b.select(query)),
    );
  }

  protected async fetchSingle<T = DT>(
    build: (
      builder: PostgrestFilterBuilder<any, any, any, unknown>,
    ) => PostgrestFilterBuilder<any, any, any, unknown>,
    query = this.defaultQuery,
  ) {
    return await SupabaseConnector.safeFetchSingle<T>(
      this.table,
      (b) => build(b.select(query)),
    );
  }

  protected async insert(
    data: Partial<DT>,
    query = this.defaultQuery,
  ): Promise<DT> {
    return (await SupabaseConnector.safeFetchSingle<DT>(
      this.table,
      (b) => b.insert(data).select(query),
    ))!;
  }

  protected async delete(
    build: (
      builder: PostgrestFilterBuilder<any, any, any, unknown>,
    ) => PostgrestFilterBuilder<any, any, any, unknown>,
  ) {
    return await SupabaseConnector.safeStore(
      this.table,
      (b) => build(b.delete()),
    );
  }
}
