import { cookies } from "next/headers"
import { getLocalePrefix, resolveLocaleFromCookie } from "@/lib/i18n/locale-path"

/** Prefix to locale routes after sign-out. */
export async function getLocalePathPrefix(): Promise<string> {
  const cookieStore = await cookies()
  const locale = resolveLocaleFromCookie(cookieStore.get("NEXT_LOCALE")?.value)
  return getLocalePrefix(locale)
}
