import { auth } from "@/auth"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { nextUrl } = req

  const isAuthRoute = nextUrl.pathname.startsWith('/login')
  const isApiAuthRoute = nextUrl.pathname.startsWith('/api/auth')
  const isDashboardRoute = nextUrl.pathname.startsWith('/dashboard')
  const isPublicRoute = nextUrl.pathname === '/'

  if (isApiAuthRoute) return

  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL('/dashboard', nextUrl))
    }
    return
  }

  if (isDashboardRoute && !isLoggedIn) {
    let callbackUrl = nextUrl.pathname
    if (nextUrl.search) {
      callbackUrl += nextUrl.search
    }

    const encodedCallbackUrl = encodeURIComponent(callbackUrl)

    return Response.redirect(new URL(`/login?callbackUrl=${encodedCallbackUrl}`, nextUrl))
  }

  if (isPublicRoute) {
    return
  }

  if (!isLoggedIn) {
    return Response.redirect(new URL('/login', nextUrl))
  }

  return
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"]
}