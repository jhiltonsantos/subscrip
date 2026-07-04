import { defaultLocale, locales, Locale } from "./config"

export function localeFromPathname(pathname: string | null | undefined): Locale | null {
  if (!pathname) return null

  if (pathname === "/pt" || pathname.startsWith("/pt/")) {
    return "pt"
  }

  return "en"
}

export function resolveLocale(input: {
  headerLocale?: string | null
  pathname?: string | null
  cookieLocale?: string | null
}): Locale {
  const { headerLocale, pathname, cookieLocale } = input

  if (headerLocale && locales.includes(headerLocale as Locale)) {
    return headerLocale as Locale
  }

  const pathLocale = localeFromPathname(pathname)
  if (pathLocale) {
    return pathLocale
  }

  if (cookieLocale && locales.includes(cookieLocale as Locale)) {
    return cookieLocale as Locale
  }

  return defaultLocale
}
