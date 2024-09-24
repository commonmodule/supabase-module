import { EventContainer } from "@common-module/ts";

export default abstract class AuthTokenManager extends EventContainer<{
  tokenChanged: (token: string | undefined) => void;
}> {
  public abstract get token(): string | undefined;
}
