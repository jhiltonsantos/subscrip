"use client"

import { PlatformLayout } from "@/components/layout"

interface PlatformLayoutClientProps {
  children: React.ReactNode
  user: {
    name?: string | null
    email: string
  }
}

export function PlatformLayoutClient({ children, user }: PlatformLayoutClientProps) {
  return <PlatformLayout user={user}>{children}</PlatformLayout>
}
