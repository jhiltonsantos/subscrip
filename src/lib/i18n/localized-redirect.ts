import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"
import { buildLocalizedPath } from "./locale-path"
import { resolveLocale } from "./resolve-locale"

export async function localizedRedirect(cleanPath: string): Promise<never> {
  const requestHeaders = await headers()
  const cookieStore = await cookies()

  const locale = resolveLocale({
    headerLocale: requestHeaders.get("x-locale"),
    pathname: requestHeaders.get("x-url-pathname"),
    cookieLocale: cookieStore.get("NEXT_LOCALE")?.value,
  })

  redirect(buildLocalizedPath(cleanPath, locale))
}
