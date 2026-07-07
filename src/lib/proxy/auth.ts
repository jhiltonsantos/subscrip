import { NextRequest, NextResponse } from "next/server"
import { getSessionCookie } from "better-auth/cookies"
import {
  buildLocalizedPath,
  resolveLocaleFromCookie,
} from "@/lib/i18n/locale-path"
import { Locale } from "@/lib/i18n/config"

const PUBLIC_ROUTES = ["/", "/auth/login", "/auth/register"]

export type AuthAction =
  | { type: "redirect"; url: string }
  | { type: "next" }

export function checkAuth(
  req: NextRequest,
  cleanPath: string,
  locale: Locale | null
): AuthAction {
  const sessionCookie = getSessionCookie(req)
  const isLoggedIn = !!sessionCookie
  const isPublicRoute = PUBLIC_ROUTES.includes(cleanPath)

  if (!isLoggedIn && !isPublicRoute) {
    const callbackUrl = cleanPath + (req.nextUrl.search || "")
    const effectiveLocale =
      locale ?? resolveLocaleFromCookie(req.cookies.get("NEXT_LOCALE")?.value)
    const loginUrl = buildLocalizedPath("/auth/login", effectiveLocale)
    return {
      type: "redirect",
      url: `${loginUrl}?callbackUrl=${encodeURIComponent(callbackUrl)}`,
    }
  }

  return { type: "next" }
}

export function handleAuthAction(
  action: AuthAction,
  req: NextRequest
): NextResponse | null {
  if (action.type === "redirect") {
    return NextResponse.redirect(new URL(action.url, req.url))
  }
  return null
}
