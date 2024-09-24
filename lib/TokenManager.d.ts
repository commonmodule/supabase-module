import { EventContainer } from "@common-module/ts";
export default abstract class TokenManager extends EventContainer<{
    tokenChanged: (token: string | undefined) => void;
}> {
    abstract get token(): string | undefined;
}
//# sourceMappingURL=TokenManager.d.ts.map