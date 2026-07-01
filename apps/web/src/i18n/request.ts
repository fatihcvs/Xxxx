import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import en from "@fameworld/i18n/messages/en";
import tr from "@fameworld/i18n/messages/tr";

const messagesByLocale = { en, tr } as const;

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = (routing.locales as readonly string[]).includes(requested ?? "")
    ? (requested as string)
    : routing.defaultLocale;

  const messages = messagesByLocale[locale as keyof typeof messagesByLocale] ?? en;
  return { locale, messages };
});
