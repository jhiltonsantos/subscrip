"use client"

import { useLocale, useTranslations } from "next-intl"
import { usePathname } from "next/navigation"
import { locales } from "@/lib/i18n/config"
import { ChevronDown, Globe } from "lucide-react"
import { cn } from "@/lib/utils/helpers"

interface LocaleSwitcherProps {
  className?: string
  selectClassName?: string
}

export function LocaleSwitcher({ className, selectClassName }: LocaleSwitcherProps) {
  const t = useTranslations("locale")
  const locale = useLocale()
  const pathname = usePathname()

  const handleChange = (newLocale: string) => {
    const cleanPath = pathname.replace(/^\/pt/, "") || "/"

    if (newLocale === "pt") {
      window.location.href = `/pt${cleanPath}`
    } else {
      window.location.href = cleanPath
    }
  }

  return (
    <div
      className={cn(
        "relative inline-flex h-9 items-center gap-1.5 rounded-md border border-transparent bg-transparent px-2.5 transition-colors hover:bg-accent/40",
        className
      )}
    >
      <Globe className="h-3.5 w-3.5 text-muted-foreground" />
      <select
        value={locale}
        onChange={(e) => handleChange(e.target.value)}
        className={cn(
          "h-full cursor-pointer appearance-none bg-transparent pr-4 text-sm font-medium text-muted-foreground hover:text-foreground focus:outline-none",
          selectClassName
        )}
      >
        {locales.map((loc) => (
          <option key={loc} value={loc} className="bg-background text-foreground">
            {t(loc)}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 h-3.5 w-3.5 text-muted-foreground" />
    </div>
  )
}
