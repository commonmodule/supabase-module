import { Store } from "@common-module/app";
import { EventContainer } from "@common-module/ts";
export default class AuthTokenManager<E extends Record<string, (...args: any[]) => any> = Record<string, (...args: any[]) => any>> extends EventContainer<E & {
    tokenChanged: (token: string | undefined) => void;
}> {
    protected store: Store;
    constructor(storeName: string);
    get token(): string | undefined;
    set token(value: string | undefined);
}
//# sourceMappingURL=AuthTokenManager.d.ts.map