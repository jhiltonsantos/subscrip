import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  pages: {
    signIn: '/auth/login',
    verifyRequest: '/auth/login/verify',
    error: '/error'
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isAuthRoute = nextUrl.pathname.startsWith('/auth/login')
      const isApiAuthRoute = nextUrl.pathname.startsWith('/api/auth')
      const isDashboardRoute = nextUrl.pathname.startsWith('/dashboard')
      const isPublicRoute = nextUrl.pathname === '/'

      if (isApiAuthRoute) return true

      if (isAuthRoute) {
        if (isLoggedIn) {
          return Response.redirect(new URL('/dashboard', nextUrl))
        }
        return true
      }

      if (isDashboardRoute && !isLoggedIn) {
        let callbackUrl = nextUrl.pathname
        if (nextUrl.search) {
          callbackUrl += nextUrl.search
        }
        const encodedCallbackUrl = encodeURIComponent(callbackUrl)
        return Response.redirect(new URL(`/auth/login?callbackUrl=${encodedCallbackUrl}`, nextUrl))
      }

      if (isPublicRoute) return true

      if (!isLoggedIn) {
        return Response.redirect(new URL('/auth/login', nextUrl))
      }

      return true
    }
  },
  providers: []
} satisfies NextAuthConfig

