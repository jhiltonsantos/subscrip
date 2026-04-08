"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { LocaleLink } from "@/components/global"
import { useTranslations } from "next-intl"
import { LayoutDashboard, CreditCard, Settings } from "lucide-react"

export function MobileDock() {
  const t = useTranslations()
  const pathname = usePathname()
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

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

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }
      
      setLastScrollY(currentScrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY])

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-40 transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="mx-3 mb-3">
        <div className="flex items-center justify-around px-2 py-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/80 dark:border-gray-800/80 shadow-lg">
          {navItems.map((item) => {
            const Icon = item.icon
            const pathnameWithoutLocale = pathname.replace(/^\/pt/, '')
            const isActive = pathnameWithoutLocale === item.href || pathnameWithoutLocale.startsWith(`${item.href}/`)
            
            return (
              <LocaleLink
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-colors"
              >
                <div
                  className={`p-1.5 rounded-xl transition-all ${
                    isActive
                      ? "bg-emerald-500 text-white"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span
                  className={`text-xs font-medium ${
                    isActive
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {item.label}
                </span>
              </LocaleLink>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
