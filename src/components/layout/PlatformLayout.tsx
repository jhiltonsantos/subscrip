"use client"

import { Header } from "./header"
import { Sidebar } from "./sidebar"
import { MobileNavbar } from "./header/MobileNavbar"
import { MobileDock } from "./sidebar/MobileDock"
import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext"

interface PlatformLayoutProps {
  children: React.ReactNode
  user?: {
    name?: string | null
    email: string
  }
}

function PlatformLayoutContent({ children, user }: PlatformLayoutProps) {
  const { isCollapsed } = useSidebar()

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
        <div 
          className="flex flex-col flex-1 transition-all duration-300"
          style={{
            marginLeft: isCollapsed ? '120px' : '312px'
          }}
        >
          <Header variant="platform" />
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </>
  )
}

export function PlatformLayout({ children, user }: PlatformLayoutProps) {
  return (
    <SidebarProvider>
      <PlatformLayoutContent user={user}>
        {children}
      </PlatformLayoutContent>
    </SidebarProvider>
  )
}
