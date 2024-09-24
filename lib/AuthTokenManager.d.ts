import { Store } from "@common-module/app";
import { EventContainer } from "@common-module/ts";
export default abstract class AuthTokenManager<ET extends Record<string, (...args: any[]) => any> = Record<string, (...args: any[]) => any>> extends EventContainer<ET & {
    tokenChanged: (token: string | undefined) => void;
}> {
    protected abstract store: Store<string>;
    get token(): string | undefined;
    set token(value: string | undefined);
}
//# sourceMappingURL=AuthTokenManager.d.ts.map