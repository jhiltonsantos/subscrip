import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"
import { Locale } from "./config"

export function stripLocalePrefixFromPath(pathname: string): string {
  return pathname.replace(/^\/pt(?=\/|$)/, "") || "/"
}

export function buildLocalizedPath(pathname: string, locale: Locale): string {
  const cleanPath = stripLocalePrefixFromPath(pathname)

  if (locale === "pt") {
    return cleanPath === "/" ? "/pt" : `/pt${cleanPath}`
  }

  return cleanPath
}

export function setLocaleCookie(locale: Locale): void {
  document.cookie = `NEXT_LOCALE=${locale};path=/;SameSite=Lax`
}

export function navigateToLocale(
  router: AppRouterInstance,
  pathname: string,
  newLocale: Locale
): void {
  const nextPath = buildLocalizedPath(pathname, newLocale)

  setLocaleCookie(newLocale)
  router.push(nextPath)
  router.refresh()
}
