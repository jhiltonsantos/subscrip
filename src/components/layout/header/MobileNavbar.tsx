"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import {
  CreditCard,
  DollarSign,
  LayoutDashboard,
  LogOut,
  Menu,
  ReceiptText,
  Settings,
  WalletCards,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { NotificationButton } from "./NotificationButton"
import { ThemeToggle } from "./ThemeToggle"
import { LocaleLink, LocaleSwitcher } from "@/components/global"
import { signOut } from "@/server/actions/auth"

interface MobileNavbarProps {
  user?: {
    name?: string | null
    email: string
  }
}

export function MobileNavbar({ user }: MobileNavbarProps) {
  const t = useTranslations()
  const pathname = usePathname()
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navSections = [
    {
      label: t("header.sections.main"),
      items: [
        {
          label: t("header.dashboard"),
          href: "/dashboard",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      label: t("header.sections.management"),
      items: [
        {
          label: t("header.subscriptions"),
          href: "/subscriptions",
          icon: CreditCard,
        },
      ],
    },
    {
      label: t("header.sections.finance"),
      items: [
        {
          label: t("header.financePlanner"),
          href: "/finance-planner",
          icon: DollarSign,
        },
        {
          label: t("header.cardInvoice"),
          href: "/card-invoice",
          icon: ReceiptText,
        },
        {
          label: t("header.paymentMethods"),
          href: "/payment-methods",
          icon: WalletCards,
        },
      ],
    },
    {
      label: t("header.sections.system"),
      items: [
        {
          label: t("header.settings"),
          href: "/settings",
          icon: Settings,
        },
      ],
    },
  ]

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
          <div className="flex items-center justify-between px-4 py-3 bg-[var(--chrome-bg)] backdrop-blur-xl rounded-2xl border border-[var(--chrome-border)] shadow-lg">
            {/* User avatar */}
            <LocaleLink
              href="/settings"
              aria-label={t("header.settings")}
              className="w-10 h-10 rounded-full bg-linear-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-sm font-semibold shrink-0"
            >
              {user?.name?.[0]?.toUpperCase() || user?.email[0].toUpperCase()}
            </LocaleLink>
            
            {/* Centered logo */}
            <LocaleLink
              href="/dashboard"
              className="absolute left-1/2 -translate-x-1/2 text-lg font-bold text-gray-900 dark:text-gray-100"
            >
              {t("common.appName")}
            </LocaleLink>
            
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
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Menu Lateral */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-background z-50 transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        } lg:hidden shadow-2xl`}
      >
        <div className="flex flex-col h-full">
          {/* Menu header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
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

          {/* User Info */}
          {user ? (
            <div className="p-4">
              <LocaleLink
                href="/settings"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl bg-gray-50 p-3 dark:bg-gray-800"
              >
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
              </LocaleLink>
            </div>
          ) : null}

          {/* Navigation */}
          <nav className="flex-1 space-y-5 overflow-y-auto px-4 pb-4">
            {navSections.map((section) => (
              <div key={section.label} className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {section.label}
                </p>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon
                    const pathnameWithoutLocale = pathname.replace(/^\/pt/, '')
                    const isActive =
                      pathnameWithoutLocale === item.href ||
                      pathnameWithoutLocale.startsWith(`${item.href}/`)

                    return (
                      <LocaleLink
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className={[
                          "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/50 dark:hover:text-gray-100",
                        ].join(" ")}
                      >
                        <Icon className="h-5 w-5 shrink-0" strokeWidth={isActive ? 2.5 : 2} />
                        {item.label}
                      </LocaleLink>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>

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
