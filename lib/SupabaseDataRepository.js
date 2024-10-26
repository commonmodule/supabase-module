export default class SupabaseDataRepository {
    table;
    defaultQuery;
    constructor(table, defaultQuery) {
        this.table = table;
        this.defaultQuery = defaultQuery;
    }
    _supabaseConnector;
    set supabaseConnector(connector) {
        this._supabaseConnector = connector;
    }
    get supabaseConnector() {
        if (!this._supabaseConnector)
            throw new Error("Supabase connector not set");
        return this._supabaseConnector;
    }
    async fetch(build, query = this.defaultQuery) {
        return await this.supabaseConnector.safeFetch(this.table, (b) => build(b.select(query)));
    }
    async fetchSingle(build, query = this.defaultQuery) {
        return await this.supabaseConnector.safeFetchSingle(this.table, (b) => build(b.select(query)));
    }
    async insert(data, query = this.defaultQuery) {
        return (await this.supabaseConnector.safeFetchSingle(this.table, (b) => b.insert(data).select(query)));
    }
    async delete(build) {
        return await this.supabaseConnector.safeStore(this.table, (b) => build(b.delete()));
    }
}
//# sourceMappingURL=SupabaseDataRepository.js.map