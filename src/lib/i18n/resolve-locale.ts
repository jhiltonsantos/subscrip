import { defaultLocale, locales, Locale } from "./config"
import { localeFromPathname } from "./locale-path"

export { localeFromPathname } from "./locale-path"

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
