import { getRequestConfig } from "next-intl/server"
import { cookies, headers } from "next/headers"
import { locales, defaultLocale, Locale } from "./config"

export default getRequestConfig(async () => {
  const headerLocale = (await headers()).get("x-locale")
  const cookieLocale = (await cookies()).get("NEXT_LOCALE")?.value
  const raw = headerLocale || cookieLocale || defaultLocale
  const locale = locales.includes(raw as Locale) ? raw : defaultLocale

  return {
    locale,
    messages: (await import(`@/translations/client/${locale}.json`)).default,
  }
})
