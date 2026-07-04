import { NextRequest, NextResponse } from "next/server"

export function stripLocalePrefix(pathname: string): {
  cleanPath: string
  locale: string
} {
  if (pathname.startsWith("/pt/") || pathname === "/pt") {
    return { cleanPath: pathname.replace("/pt", "") || "/", locale: "pt" }
  }
  return { cleanPath: pathname, locale: "en" }
}

export function handleLocaleRewrite(
  req: NextRequest,
  cleanPath: string,
  locale: string
): NextResponse {
  const headers = new Headers(req.headers)
  headers.set("x-locale", locale)
  headers.set("x-url-pathname", req.nextUrl.pathname)

  if (locale === "pt") {
    const response = NextResponse.rewrite(new URL(cleanPath, req.url), {
      request: { headers },
    })
    response.cookies.set("NEXT_LOCALE", "pt", { path: "/" })
    return response
  }

  const response = NextResponse.next({ request: { headers } })
  response.cookies.set("NEXT_LOCALE", "en", { path: "/" })
  return response
}
