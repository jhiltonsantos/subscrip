import { auth } from "@/lib/auth"
import { buildLocalizedPath } from "@/lib/i18n/locale-path"
import { resolveLocale } from "@/lib/i18n/resolve-locale"
import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"
import { RegisterForm } from "./register-form"

async function getDashboardPath(): Promise<string> {
  const requestHeaders = await headers()
  const cookieStore = await cookies()

  const locale = resolveLocale({
    headerLocale: requestHeaders.get("x-locale"),
    pathname: requestHeaders.get("x-url-pathname"),
    cookieLocale: cookieStore.get("NEXT_LOCALE")?.value,
  })

  return buildLocalizedPath("/dashboard", locale)
}

export default async function RegisterPage() {
  const requestHeaders = await headers()
  const session = await auth.api.getSession({
    headers: requestHeaders,
  })

  if (session) {
    redirect(await getDashboardPath())
  }

  return <RegisterForm />
}
