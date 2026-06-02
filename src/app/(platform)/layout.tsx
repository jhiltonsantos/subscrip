import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
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

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      darkThemeVariant: true,
    },
  })

  return (
    <PlatformLayoutClient
      user={{
        name: user?.name ?? session.user.name,
        email: user?.email ?? session.user.email,
        darkThemeVariant: user?.darkThemeVariant ?? "BLUE",
      }}
    >
      {children}
    </PlatformLayoutClient>
  )
}
