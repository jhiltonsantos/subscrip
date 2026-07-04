import { getRequestConfig } from "next-intl/server"
import { cookies, headers } from "next/headers"
import { mergeMessages } from "./merge-messages"
import { resolveLocale } from "./resolve-locale"

export default getRequestConfig(async () => {
  const requestHeaders = await headers()
  const cookieStore = await cookies()

  const locale = resolveLocale({
    headerLocale: requestHeaders.get("x-locale"),
    pathname: requestHeaders.get("x-url-pathname"),
    cookieLocale: cookieStore.get("NEXT_LOCALE")?.value,
  })

  const [clientMessages, serverMessages] = await Promise.all([
    import(`@/translations/client/${locale}.json`).then((m) => m.default),
    import(`@/translations/server/${locale}.json`).then((m) => m.default),
  ])

  return {
    locale,
    messages: mergeMessages(
      serverMessages as Record<string, unknown>,
      clientMessages as Record<string, unknown>
    ),
  }
})
