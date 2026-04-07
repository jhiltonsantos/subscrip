import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { PlatformLayoutClient } from "./layout-client"

export default async function PlatformRouteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/auth/login")
  }

  return (
    <PlatformLayoutClient user={session.user}>
      {children}
    </PlatformLayoutClient>
  )
}
