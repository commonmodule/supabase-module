import SupabaseConnector from "./SupabaseConnector.js";
export default class SupabaseService {
    table;
    defaultQuery;
    defaultLimit;
    constructor(table, defaultQuery, defaultLimit) {
        this.table = table;
        this.defaultQuery = defaultQuery;
        this.defaultLimit = defaultLimit;
    }
    async fetchSingle(build) {
        return await SupabaseConnector.safeFetchSingle(this.table, (b) => build(b.select(this.defaultQuery)));
    }
}
//# sourceMappingURL=SupabaseService.js.map