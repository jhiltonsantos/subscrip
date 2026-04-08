"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Menu, X, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NotificationButton } from "./NotificationButton"
import { ThemeToggle } from "./ThemeToggle"
import { LocaleSwitcher } from "@/components/global"
import { signOut } from "@/server/actions/auth"

interface MobileNavbarProps {
  user?: {
    name?: string | null
    email: string
  }
}

export function MobileNavbar({ user }: MobileNavbarProps) {
  const t = useTranslations()
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false)
        setIsMenuOpen(false)
      } else {
        setIsVisible(true)
      }
      
      setLastScrollY(currentScrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY])

  // Prevent scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMenuOpen])

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="mx-4 mt-4">
          <div className="flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/80 dark:border-gray-800/80 shadow-lg">
            {/* User avatar */}
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-sm font-semibold shrink-0">
              {user?.name?.[0]?.toUpperCase() || user?.email[0].toUpperCase()}
            </div>
            
            {/* Centered logo */}
            <h1 className="absolute left-1/2 -translate-x-1/2 text-lg font-bold text-gray-900 dark:text-gray-100">
              {t("common.appName")}
            </h1>
            
            {/* Hamburger Menu */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="shrink-0"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Menu Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Menu Lateral */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-white dark:bg-gray-900 z-50 transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        } md:hidden shadow-2xl`}
      >
        <div className="flex flex-col h-full">
          {/* Menu header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Menu
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Menu Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* User Info */}
            {user && (
              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-linear-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                    {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {user.name || user.email.split('@')[0]}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2 mb-4">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                {t("header.profile")}
              </p>
            </div>
          </div>

          {/* Menu footer - Actions */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("header.language")}
              </span>
              <LocaleSwitcher />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("header.theme")}
              </span>
              <ThemeToggle />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("header.notifications")}
              </span>
              <NotificationButton />
            </div>
            
            {/* Logout Button */}
            <form action={signOut} className="pt-2">
              <Button
                type="submit"
                variant="ghost"
                className="w-full justify-start text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                <LogOut className="h-4 w-4 mr-2" />
                {t("header.logout")}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
