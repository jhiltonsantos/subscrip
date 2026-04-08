"use client"

import { Header } from "./header"
import { Sidebar } from "./sidebar"

interface PlatformLayoutProps {
  children: React.ReactNode
  user?: {
    name?: string | null
    email: string
  }
}

export function PlatformLayout({ children, user }: PlatformLayoutProps) {
  return (
    <div className="flex min-h-screen bg-linear-to-br from-emerald-50/50 via-background to-emerald-100/30 dark:from-emerald-950/20 dark:via-background dark:to-emerald-900/10">
      <Sidebar user={user} />
      <div className="flex flex-col flex-1 ml-[280px]">
        <Header variant="platform" />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
