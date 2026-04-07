"use client"

import { useLocale, useTranslations } from "next-intl"
import { usePathname } from "next/navigation"
import { locales } from "@/lib/i18n/config"
import { Globe } from "lucide-react"

export function LocaleSwitcher() {
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
    <div className="relative inline-flex items-center gap-1.5">
      <Globe className="h-4 w-4 text-muted-foreground" />
      <select
        value={locale}
        onChange={(e) => handleChange(e.target.value)}
        className="appearance-none bg-transparent text-sm text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none pr-4"
      >
        {locales.map((loc) => (
          <option key={loc} value={loc}>
            {t(loc)}
          </option>
        ))}
      </select>
    </div>
  )
}
