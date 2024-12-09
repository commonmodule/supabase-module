import { PostgrestFilterBuilder } from "@supabase/postgrest-js";
import SupabaseConnector from "./SupabaseConnector.js";
export default class SupabaseDataRepository<DT> {
    private table;
    private defaultQuery;
    constructor(table: string, defaultQuery: string);
    private _supabaseConnector;
    set supabaseConnector(connector: SupabaseConnector);
    get supabaseConnector(): SupabaseConnector;
    protected fetch<T = DT>(build: (builder: PostgrestFilterBuilder<any, any, any, unknown>) => PostgrestFilterBuilder<any, any, any, unknown>, query?: string): Promise<T[]>;
    protected fetchSingle<T = DT>(build: (builder: PostgrestFilterBuilder<any, any, any, unknown>) => PostgrestFilterBuilder<any, any, any, unknown>, query?: string): Promise<T | undefined>;
    protected safeInsert(data: Partial<DT>, query?: string): Promise<DT>;
    protected safeUpdate(build: (builder: PostgrestFilterBuilder<any, any, any, unknown>) => PostgrestFilterBuilder<any, any, any, unknown>, data: Partial<DT>, query?: string): Promise<DT>;
    protected delete(build: (builder: PostgrestFilterBuilder<any, any, any, unknown>) => PostgrestFilterBuilder<any, any, any, unknown>): Promise<void>;
}
//# sourceMappingURL=SupabaseDataRepository.d.ts.map