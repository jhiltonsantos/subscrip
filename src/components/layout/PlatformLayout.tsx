"use client"

import { Header } from "./Header"

interface PlatformLayoutProps {
  children: React.ReactNode
  user?: {
    name?: string | null
    email: string
  }
}

export function PlatformLayout({ children, user }: PlatformLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-linear-to-br from-emerald-50/50 via-background to-emerald-100/30 dark:from-emerald-950/20 dark:via-background dark:to-emerald-900/10">
      <Header variant="platform" user={user} />
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
