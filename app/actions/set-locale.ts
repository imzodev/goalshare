"use server";

import { cookies } from "next/headers";
import { LOCALE_COOKIE_NAME, ONE_YEAR_SECONDS, SUPPORTED_LOCALES } from "@/i18n/config";

export async function setLocaleCookie(locale: string) {
  const value = (SUPPORTED_LOCALES as readonly string[]).includes(locale) ? locale : SUPPORTED_LOCALES[0];
  const store = await cookies();
  store.set(LOCALE_COOKIE_NAME, value, {
    httpOnly: false,
    path: "/",
    maxAge: ONE_YEAR_SECONDS,
  });
}
