"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { getLocalePathPrefix } from "./shared"

export async function signOut() {
  await auth.api.signOut({
    headers: await headers(),
  })

  const prefix = await getLocalePathPrefix()
  redirect(`${prefix}/auth/login`)
}
