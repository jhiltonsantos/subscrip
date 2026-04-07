import { NextRequest, NextResponse } from "next/server"
import { getSessionCookie } from "better-auth/cookies"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionCookie = getSessionCookie(request)
  const isLoggedIn = !!sessionCookie

  const isAuthRoute = pathname.startsWith("/auth")
  const isApiAuthRoute = pathname.startsWith("/api/auth")
  const isDashboardRoute = pathname.startsWith("/dashboard")
  const isPublicRoute = pathname === "/"

  if (isApiAuthRoute) {
    return NextResponse.next()
  }

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  if (isDashboardRoute && !isLoggedIn) {
    const callbackUrl = pathname + (request.nextUrl.search || "")
    const encodedCallbackUrl = encodeURIComponent(callbackUrl)
    return NextResponse.redirect(
      new URL(`/auth/login?callbackUrl=${encodedCallbackUrl}`, request.url)
    )
  }

  if (isPublicRoute || isAuthRoute) {
    return NextResponse.next()
  }

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}