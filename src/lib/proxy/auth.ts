import { NextRequest, NextResponse } from "next/server"
import { getSessionCookie } from "better-auth/cookies"

const PUBLIC_ROUTES = ["/", "/auth/login", "/auth/register"]
const AUTH_ROUTES = ["/auth/login", "/auth/register"]

export type AuthAction = 
  | { type: "redirect"; url: string }
  | { type: "next" }

export function checkAuth(
  req: NextRequest,
  cleanPath: string,
  locale: string
): AuthAction {
  const sessionCookie = getSessionCookie(req)
  const isLoggedIn = !!sessionCookie
  const isPublicRoute = PUBLIC_ROUTES.includes(cleanPath)
  const isAuthRoute = AUTH_ROUTES.includes(cleanPath)

  if ((isPublicRoute || isAuthRoute) && isLoggedIn) {
    const dashboardUrl = locale === "pt" ? "/pt/dashboard" : "/dashboard"
    return { type: "redirect", url: dashboardUrl }
  }

  if (!isLoggedIn && !isPublicRoute) {
    const callbackUrl = cleanPath + (req.nextUrl.search || "")
    const loginUrl = locale === "pt" ? "/pt/auth/login" : "/auth/login"
    return { 
      type: "redirect", 
      url: `${loginUrl}?callbackUrl=${encodeURIComponent(callbackUrl)}` 
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
