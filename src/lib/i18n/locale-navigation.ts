import { Locale } from "./config"
import { buildLocalizedPath } from "./locale-path"

export { buildLocalizedPath, stripLocalePrefixFromPath } from "./locale-path"

export function setLocaleCookie(locale: Locale): void {
  document.cookie = `NEXT_LOCALE=${locale};path=/;SameSite=Lax`
}

export function navigateToLocale(pathname: string, newLocale: Locale): void {
  const nextPath = buildLocalizedPath(pathname, newLocale)
  if (nextPath === pathname) return

  setLocaleCookie(newLocale)
  window.location.assign(nextPath)
}
