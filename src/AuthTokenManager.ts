import { Store } from "@common-module/app";
import { EventContainer, KebabCase } from "@common-module/ts";

export default class AuthTokenManager<
  ET extends Record<string, (...args: any[]) => any> = Record<
    string,
    (...args: any[]) => any
  >,
> extends EventContainer<
  ET & { tokenChanged: (token: string | undefined) => void }
> {
  protected store: Store<string>;

  constructor(storeName: string) {
    super();
    this.store = new Store(storeName as KebabCase<string>);
  }

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
