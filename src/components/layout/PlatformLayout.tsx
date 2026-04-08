"use client"

import { Header } from "./header"
import { Sidebar } from "./sidebar"
import { MobileNavbar } from "./header/MobileNavbar"
import { MobileDock } from "./sidebar/MobileDock"

interface PlatformLayoutProps {
  children: React.ReactNode
  user?: {
    name?: string | null
    email: string
  }
}

export function PlatformLayout({ children, user }: PlatformLayoutProps) {
  return (
    <>
      {/* Mobile Layout */}
      <div className="md:hidden min-h-screen bg-linear-to-br from-emerald-50/50 via-background to-emerald-100/30 dark:from-emerald-950/20 dark:via-background dark:to-emerald-900/10">
        <MobileNavbar user={user} />
        <main className="pt-20">
          {children}
        </main>
        <MobileDock />
      </div>

      {/* Tablet & Desktop Layout */}
      <div className="hidden md:flex min-h-screen bg-linear-to-br from-emerald-50/50 via-background to-emerald-100/30 dark:from-emerald-950/20 dark:via-background dark:to-emerald-900/10">
        <Sidebar user={user} />
        <div className="flex flex-col flex-1 md:ml-[104px] lg:ml-[296px]">
          <Header variant="platform" />
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </>
  )
}
