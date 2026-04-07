import { NextRequest, NextResponse } from "next/server"
import { getSessionCookie } from "better-auth/cookies"

const PUBLIC_ROUTES = ["/", "/auth/login", "/auth/register"]
const AUTH_ROUTES = ["/auth/login", "/auth/register"]

function stripLocalePrefix(pathname: string): { cleanPath: string; locale: string } {
  if (pathname.startsWith("/pt/") || pathname === "/pt") {
    return { cleanPath: pathname.replace("/pt", "") || "/", locale: "pt" }
  }
  return { cleanPath: pathname, locale: "en" }
}

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const { cleanPath, locale } = stripLocalePrefix(pathname)

  if (cleanPath.startsWith("/api/")) {
    return NextResponse.next()
  }

  const sessionCookie = getSessionCookie(req)
  const isLoggedIn = !!sessionCookie
  const isPublicRoute = PUBLIC_ROUTES.includes(cleanPath)
  const isAuthRoute = AUTH_ROUTES.includes(cleanPath)

  if ((isPublicRoute || isAuthRoute) && isLoggedIn) {
    const dashboardUrl = locale === "pt" ? "/pt/dashboard" : "/dashboard"
    return NextResponse.redirect(new URL(dashboardUrl, req.url))
  }

  if (!isLoggedIn && !isPublicRoute) {
    const callbackUrl = cleanPath + (req.nextUrl.search || "")
    const loginUrl = locale === "pt" ? "/pt/auth/login" : "/auth/login"
    return NextResponse.redirect(
      new URL(`${loginUrl}?callbackUrl=${encodeURIComponent(callbackUrl)}`, req.url)
    )
  }

  if (locale === "pt") {
    const headers = new Headers(req.headers)
    headers.set("x-locale", "pt")

    const response = NextResponse.rewrite(new URL(cleanPath, req.url), {
      request: { headers },
    })
    response.cookies.set("NEXT_LOCALE", "pt", { path: "/" })
    return response
  }

  const response = NextResponse.next()
  response.cookies.set("NEXT_LOCALE", "en", { path: "/" })
  return response
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
