import { PostgrestFilterBuilder } from "@supabase/postgrest-js";
import SupabaseConnector from "./SupabaseConnector.js";

export default class SupabaseDataRepository<DT> {
  constructor(
    private table: string,
    private defaultQuery: string,
  ) {}

  private _supabaseConnector: SupabaseConnector | undefined;

  public set supabaseConnector(connector: SupabaseConnector) {
    this._supabaseConnector = connector;
  }

  public get supabaseConnector() {
    if (!this._supabaseConnector) throw new Error("Supabase connector not set");
    return this._supabaseConnector;
  }

  protected async fetch<T = DT>(
    build: (
      builder: PostgrestFilterBuilder<any, any, any, unknown>,
    ) => PostgrestFilterBuilder<any, any, any, unknown>,
    query = this.defaultQuery,
  ) {
    return await this.supabaseConnector.safeFetch<T>(
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
    return await this.supabaseConnector.safeFetchSingle<T>(
      this.table,
      (b) => build(b.select(query)),
    );
  }

  protected async safeInsert(
    data: Partial<DT>,
    query = this.defaultQuery,
  ): Promise<DT> {
    return (await this.supabaseConnector.safeFetchSingle<DT>(
      this.table,
      (b) => b.insert(data).select(query),
    ))!;
  }

  protected async safeUpdate(
    build: (
      builder: PostgrestFilterBuilder<any, any, any, unknown>,
    ) => PostgrestFilterBuilder<any, any, any, unknown>,
    data: Partial<DT>,
    query = this.defaultQuery,
  ): Promise<DT> {
    return (await this.supabaseConnector.safeFetchSingle<DT>(
      this.table,
      (b) => build(b.update(data)).select(query),
    ))!;
  }

  protected async delete(
    build: (
      builder: PostgrestFilterBuilder<any, any, any, unknown>,
    ) => PostgrestFilterBuilder<any, any, any, unknown>,
  ) {
    return await this.supabaseConnector.safeStore(
      this.table,
      (b) => build(b.delete()),
    );
  }
}
