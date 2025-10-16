import type messages from "./messages/es.json";

type Messages = typeof messages;

declare global {
  // Use type safe message keys with `next-intl`
  interface IntlMessages extends Messages {
    _intlBrand?: never;
  }
}
