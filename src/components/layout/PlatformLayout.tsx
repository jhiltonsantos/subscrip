"use client"

import { useEffect } from "react"
import { useTheme } from "next-themes"
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
    darkThemeVariant?: "BLUE" | "BLACK"
  }
}

function PlatformLayoutContent({ children, user }: PlatformLayoutProps) {
  const { isCollapsed } = useSidebar()
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    const root = document.documentElement
    const useBlackDarkTheme =
      resolvedTheme === "dark" && user?.darkThemeVariant === "BLACK"

    root.classList.toggle("dark-black", useBlackDarkTheme)

    return () => {
      root.classList.remove("dark-black")
    }
  }, [resolvedTheme, user?.darkThemeVariant])

  return (
    <>
      {/* Mobile Layout */}
      <div className="min-h-screen bg-linear-to-br from-(--shell-gradient-from) via-background to-(--shell-gradient-to) lg:hidden">
        <MobileNavbar user={user} />
        <main className="pt-20">
          {children}
        </main>
        <MobileDock />
      </div>

      {/* Desktop Layout */}
      <div className="hidden min-h-screen bg-linear-to-br from-(--shell-gradient-from) via-background to-(--shell-gradient-to) lg:flex">
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
