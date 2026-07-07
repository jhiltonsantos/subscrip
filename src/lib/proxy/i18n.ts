import { NextRequest, NextResponse } from "next/server"
import {
  buildLocalizedPath,
  localeFromPathname,
  resolveLocaleFromCookie,
  stripLocalePrefixFromPath,
} from "@/lib/i18n/locale-path"
import { Locale } from "@/lib/i18n/config"

export function stripLocalePrefix(pathname: string): {
  cleanPath: string
  locale: Locale | null
} {
  const locale = localeFromPathname(pathname)

  if (!locale) {
    return { cleanPath: pathname, locale: null }
  }

  return {
    cleanPath: stripLocalePrefixFromPath(pathname),
    locale,
  }
}

function buildPrefixedRedirectPath(
  pathname: string,
  locale: Locale
): string {
  if (pathname === "/") {
    return buildLocalizedPath("/", locale)
  }

  return buildLocalizedPath(pathname, locale)
}

export function handleLocaleRewrite(
  req: NextRequest,
  cleanPath: string,
  locale: Locale | null
): NextResponse {
  if (!locale) {
    const cookieLocale = resolveLocaleFromCookie(
      req.cookies.get("NEXT_LOCALE")?.value
    )
    const redirectPath = buildPrefixedRedirectPath(req.nextUrl.pathname, cookieLocale)
    const redirectUrl = new URL(redirectPath, req.url)
    redirectUrl.search = req.nextUrl.search

    return NextResponse.redirect(redirectUrl, 307)
  }

  const headers = new Headers(req.headers)
  headers.set("x-locale", locale)
  headers.set("x-url-pathname", req.nextUrl.pathname)

  const response = NextResponse.rewrite(new URL(cleanPath, req.url), {
    request: { headers },
  })
  response.cookies.set("NEXT_LOCALE", locale, { path: "/" })
  return response
}
