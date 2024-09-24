import { EventContainer } from "@common-module/ts";
export default class AuthTokenManager extends EventContainer {
    get token() {
        return this.store.get("token");
    }
    set token(value) {
        value ? this.store.set("token", value) : this.store.remove("token");
        this.emit("tokenChanged", ...[value]);
    }
}
//# sourceMappingURL=AuthTokenManager.js.map