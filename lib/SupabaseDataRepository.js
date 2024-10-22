export default class SupabaseDataRepository {
    connector;
    table;
    defaultQuery;
    constructor(connector, table, defaultQuery) {
        this.connector = connector;
        this.table = table;
        this.defaultQuery = defaultQuery;
    }
    async fetch(build, query = this.defaultQuery) {
        return await this.connector.safeFetch(this.table, (b) => build(b.select(query)));
    }
    async fetchSingle(build, query = this.defaultQuery) {
        return await this.connector.safeFetchSingle(this.table, (b) => build(b.select(query)));
    }
    async insert(data, query = this.defaultQuery) {
        return (await this.connector.safeFetchSingle(this.table, (b) => b.insert(data).select(query)));
    }
    async delete(build) {
        return await this.connector.safeStore(this.table, (b) => build(b.delete()));
    }
}
//# sourceMappingURL=SupabaseDataRepository.js.map