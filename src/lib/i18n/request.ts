import { getRequestConfig } from "next-intl/server"
import { cookies, headers } from "next/headers"
import { locales, defaultLocale, Locale } from "./config"

export default getRequestConfig(async () => {
  const headerLocale = (await headers()).get("x-locale")
  const cookieLocale = (await cookies()).get("NEXT_LOCALE")?.value
  const raw = headerLocale || cookieLocale || defaultLocale
  const locale = locales.includes(raw as Locale) ? raw : defaultLocale

  const [clientMessages, serverMessages] = await Promise.all([
    import(`@/translations/client/${locale}.json`).then((m) => m.default),
    import(`@/translations/server/${locale}.json`).then((m) => m.default),
  ])

  return {
    locale,
    // Server messages (email templates, server actions) overlay client UI strings.
    messages: { ...serverMessages, ...clientMessages },
  }
})
