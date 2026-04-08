import { NextRequest, NextResponse } from "next/server"
import { 
  stripLocalePrefix, 
  handleLocaleRewrite,
  checkAuth,
  handleAuthAction 
} from "@/lib/proxy"

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  const { cleanPath, locale } = stripLocalePrefix(pathname)

  if (cleanPath.startsWith("/api/")) {
    return NextResponse.next()
  }

  const authAction = checkAuth(req, cleanPath, locale)
  const authResponse = handleAuthAction(authAction, req)
  if (authResponse) {
    return authResponse
  }

  return handleLocaleRewrite(req, cleanPath, locale)
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
