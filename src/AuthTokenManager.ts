import { Store } from "@common-module/app";
import { EventContainer } from "@common-module/ts";

export default abstract class AuthTokenManager<
  ET extends Record<string, (...args: any[]) => any> = Record<
    string,
    (...args: any[]) => any
  >,
> extends EventContainer<
  ET & { tokenChanged: (token: string | undefined) => void }
> {
  protected abstract store: Store<string>;

  public get token(): string | undefined {
    return this.store.get("token");
  }

  public set token(value: string | undefined) {
    value
      ? this.store.setPermanent("token", value)
      : this.store.remove("token");

    this.emit(
      "tokenChanged",
      ...([value] as Parameters<
        (ET & { tokenChanged: (token: string | undefined) => void })[
          "tokenChanged"
        ]
      >),
    );
  }
}
