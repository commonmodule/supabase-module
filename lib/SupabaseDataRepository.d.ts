import { PostgrestFilterBuilder } from "@supabase/postgrest-js";
export default class SupabaseDataRepository<DT> {
    private table;
    private defaultQuery;
    constructor(table: string, defaultQuery: string);
    protected fetch<T = DT>(build: (builder: PostgrestFilterBuilder<any, any, any, unknown>) => PostgrestFilterBuilder<any, any, any, unknown>, query?: string): Promise<T[]>;
    protected fetchSingle<T = DT>(build: (builder: PostgrestFilterBuilder<any, any, any, unknown>) => PostgrestFilterBuilder<any, any, any, unknown>, query?: string): Promise<T | undefined>;
    protected insert(data: Partial<DT>, query?: string): Promise<DT>;
    protected delete(build: (builder: PostgrestFilterBuilder<any, any, any, unknown>) => PostgrestFilterBuilder<any, any, any, unknown>): Promise<void>;
}
//# sourceMappingURL=SupabaseDataRepository.d.ts.map