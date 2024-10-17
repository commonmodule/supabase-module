import SupabaseConnector from "./SupabaseConnector.js";
export default class SupabaseDataRepository {
    table;
    defaultQuery;
    constructor(table, defaultQuery) {
        this.table = table;
        this.defaultQuery = defaultQuery;
    }
    async fetch(build, query = this.defaultQuery) {
        return await SupabaseConnector.safeFetch(this.table, (b) => build(b.select(query)));
    }
    async fetchSingle(build, query = this.defaultQuery) {
        return await SupabaseConnector.safeFetchSingle(this.table, (b) => build(b.select(query)));
    }
    async insert(data, query = this.defaultQuery) {
        return (await SupabaseConnector.safeFetchSingle(this.table, (b) => b.insert(data).select(query)));
    }
    async delete(build) {
        return await SupabaseConnector.safeStore(this.table, (b) => build(b.delete()));
    }
}
//# sourceMappingURL=SupabaseDataRepository.js.map