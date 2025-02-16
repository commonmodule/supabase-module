import { Store } from "@common-module/app";
import { EventContainer } from "@common-module/ts";

export default class AuthTokenManager<
  E extends Record<string, (...args: any[]) => any> = Record<
    string,
    (...args: any[]) => any
  >,
> extends EventContainer<
  E & { tokenChanged: (token: string | undefined) => void }
> {
  protected store: Store;

  constructor(storeName: string) {
    super();
    this.store = new Store(storeName);
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
        (E & { tokenChanged: (token: string | undefined) => void })[
          "tokenChanged"
        ]
      >),
    );
  }
}
