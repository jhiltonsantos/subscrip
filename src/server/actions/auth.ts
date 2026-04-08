"use server"

import { auth } from "@/lib/auth"
import { headers, cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  return session
}

export async function signOut() {
  await auth.api.signOut({
    headers: await headers(),
  })

  const locale = (await cookies()).get("NEXT_LOCALE")?.value
  const prefix = locale === "pt" ? "/pt" : ""
  redirect(`${prefix}/auth/login`)
}
