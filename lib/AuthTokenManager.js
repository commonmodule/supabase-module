import { Store } from "@common-module/app";
import { EventContainer } from "@common-module/ts";
export default class AuthTokenManager extends EventContainer {
    store;
    constructor(storeName) {
        super();
        this.store = new Store(storeName);
    }
    get token() {
        return this.store.get("token");
    }
    set token(value) {
        value
            ? this.store.setPermanent("token", value)
            : this.store.remove("token");
        this.emit("tokenChanged", ...[value]);
    }
}
//# sourceMappingURL=AuthTokenManager.js.map