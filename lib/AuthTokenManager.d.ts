import { EventContainer } from "@common-module/ts";
export default abstract class AuthTokenManager extends EventContainer<{
    tokenChanged: (token: string | undefined) => void;
}> {
    abstract get token(): string | undefined;
}
//# sourceMappingURL=AuthTokenManager.d.ts.map