"use client"

import { ChevronRight, Home } from "lucide-react"
import { LocaleLink } from "@/components/global"
import { stripLocalePrefixFromPath } from "@/lib/i18n/locale-path"
import { useTranslations } from "next-intl"
import { usePathname } from "next/navigation"

const BREADCRUMB_LABEL_KEYS: Record<string, string> = {
  dashboard: "dashboard",
  subscriptions: "subscriptions",
  "finance-planner": "financePlanner",
  "card-invoice": "cardInvoice",
  "payment-methods": "paymentMethods",
  settings: "settings",
  profile: "profile",
  auth: "auth",
  login: "login",
  register: "register",
}

function formatSegmentFallback(segment: string) {
  return segment
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

export function Breadcrumb() {
  const t = useTranslations("header.breadcrumbs")
  const pathname = usePathname()
  
  const segments = stripLocalePrefixFromPath(pathname)
    .split("/")
    .filter(Boolean)

  if (segments.length === 0) return null

  return (
    <nav className="flex items-center gap-2 text-sm">
      <LocaleLink 
        href="/dashboard" 
        aria-label={t("dashboard")}
        className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
      >
        <Home className="h-4 w-4" />
      </LocaleLink>
      
      {segments.map((segment, index) => {
        const href = "/" + segments.slice(0, index + 1).join("/")
        const labelKey = BREADCRUMB_LABEL_KEYS[segment]
        const label = labelKey ? t(labelKey) : formatSegmentFallback(segment)

        return (
          <div key={href} className="flex items-center gap-2">
            <ChevronRight className="h-4 w-4 text-gray-400 hidden md:block" />
            <LocaleLink 
              href={href}
              className="font-medium text-gray-900 transition-colors hover:text-emerald-600 dark:text-gray-100 dark:hover:text-emerald-300 hidden md:inline"
            >
              {label}
            </LocaleLink>
          </div>
        )
      })}
    </nav>
  )
}
