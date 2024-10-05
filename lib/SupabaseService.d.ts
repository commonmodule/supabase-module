import { PostgrestFilterBuilder } from "@supabase/postgrest-js";
export default class SupabaseService<T> {
    private table;
    private defaultQuery;
    private defaultLimit;
    constructor(table: string, defaultQuery: string, defaultLimit: number);
    protected fetchSingle(build: (builder: PostgrestFilterBuilder<any, any, any, unknown>) => PostgrestFilterBuilder<any, any, any, unknown>): Promise<T | undefined>;
}
//# sourceMappingURL=SupabaseService.d.ts.map