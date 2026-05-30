import { auth } from "@/lib/auth"
import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"
import { RegisterForm } from "./register-form"

async function getDashboardPath(): Promise<string> {
  const requestHeaders = await headers()
  const locale =
    requestHeaders.get("x-locale") ?? (await cookies()).get("NEXT_LOCALE")?.value

  return locale === "pt" ? "/pt/dashboard" : "/dashboard"
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
