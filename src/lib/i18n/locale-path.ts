import { defaultLocale, locales, Locale } from "./config"

export const LOCALE_PREFIX_PATTERN = /^\/(en|pt)(?=\/|$)/

export function getLocalePrefix(locale: Locale): string {
  return `/${locale}`
}

export function stripLocalePrefixFromPath(pathname: string): string {
  return pathname.replace(LOCALE_PREFIX_PATTERN, "") || "/"
}

export function localeFromPathname(pathname: string | null | undefined): Locale | null {
  if (!pathname) return null

  const match = pathname.match(LOCALE_PREFIX_PATTERN)
  if (!match) return null

  const locale = match[1]
  return locales.includes(locale as Locale) ? (locale as Locale) : null
}

export function buildLocalizedPath(pathname: string, locale: Locale): string {
  const cleanPath = stripLocalePrefixFromPath(pathname)
  const prefix = getLocalePrefix(locale)

  if (cleanPath === "/") {
    return prefix
  }

  return `${prefix}${cleanPath}`
}

export function resolveLocaleFromCookie(
  cookieLocale: string | null | undefined
): Locale {
  if (cookieLocale && locales.includes(cookieLocale as Locale)) {
    return cookieLocale as Locale
  }

  return defaultLocale
}
