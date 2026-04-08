"use client"

import { useState, useRef, useEffect } from "react"
import { usePathname } from "next/navigation"
import { LocaleLink } from "@/components/global"
import { Button } from "@/components/ui/button"
import { 
  LayoutDashboard, 
  CreditCard, 
  Settings, 
  ChevronLeft,
  LogOut
} from "lucide-react"
import { signOut } from "@/server/actions/auth"
import { useTranslations } from "next-intl"
import { gsap } from "gsap"

interface SidebarProps {
  user?: {
    name?: string | null
    email: string
  }
}

export function Sidebar({ user }: SidebarProps) {
  const t = useTranslations()
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024
    }
    return true
  })
  const sidebarRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const navItems = [
    {
      label: t("header.dashboard"),
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: t("header.subscriptions"),
      href: "/subscriptions",
      icon: CreditCard,
    },
    {
      label: t("header.settings"),
      href: "/settings",
      icon: Settings,
    },
  ]

  const toggleSidebar = () => {
    const sidebar = sidebarRef.current
    const content = contentRef.current
    
    if (!sidebar || !content) return

    if (isCollapsed) {
      gsap.to(sidebar, {
        width: 280,
        duration: 0.3,
        ease: "power2.out",
      })
      gsap.to(content, {
        opacity: 1,
        duration: 0.2,
        delay: 0.1,
      })
    } else {
      gsap.to(content, {
        opacity: 0,
        duration: 0.15,
      })
      gsap.to(sidebar, {
        width: 88,
        duration: 0.3,
        ease: "power2.out",
        delay: 0.1,
      })
    }
    
    setIsCollapsed(!isCollapsed)
  }

  useEffect(() => {
    if (sidebarRef.current) {
      const initialWidth = isCollapsed ? 88 : 280
      gsap.set(sidebarRef.current, { width: initialWidth })
      
      if (isCollapsed && contentRef.current) {
        gsap.set(contentRef.current, { opacity: 0 })
      }
    }
  }, [])

  return (
    <aside
      ref={sidebarRef}
      className="fixed left-4 top-4 bottom-4 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-gray-200/80 dark:border-gray-800/80 flex flex-col shadow-lg"
      style={{ width: 280 }}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200/30 dark:border-gray-800/30">
        <div ref={contentRef}>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {t("common.appName")}
          </h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-8 w-8 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ChevronLeft className={`h-4 w-4 transition-transform ${isCollapsed ? "rotate-180" : ""}`} />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          
          return (
            <LocaleLink
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group
                ${isActive 
                  ? "text-emerald-600 dark:text-emerald-400" 
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                }
              `}
            >
              <Icon className={`h-5 w-5 shrink-0 ${!isActive && "group-hover:scale-105 transition-transform"}`} />
              {!isCollapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </LocaleLink>
          )
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-200/30 dark:border-gray-800/30">
        {user && (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-linear-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-sm font-semibold shrink-0">
              {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
            </div>
            {!isCollapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {user.name || user.email.split('@')[0]}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user.email}
                  </p>
                </div>
                <form action={signOut}>
                  <Button
                    variant="ghost"
                    size="icon"
                    type="submit"
                    className="h-8 w-8 shrink-0 text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
                    title="Sign out"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </form>
              </>
            )}
            {isCollapsed && (
              <form action={signOut} className="flex justify-center mt-2">
                <Button
                  variant="ghost"
                  size="icon"
                  type="submit"
                  className="h-8 w-8 text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </form>
            )}
          </div>
        )}
      </div>
    </aside>
  )
}
