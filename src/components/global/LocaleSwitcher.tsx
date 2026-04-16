"use client"

import { useEffect, useRef, useState } from "react"
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
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const handleChange = (newLocale: string) => {
    setIsOpen(false)
    const cleanPath = pathname.replace(/^\/pt/, "") || "/"

    if (newLocale === "pt") {
      window.location.href = `/pt${cleanPath}`
    } else {
      window.location.href = cleanPath
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div
      ref={wrapperRef}
      className={cn(
        "relative inline-flex h-9 items-center gap-1.5 rounded-md border border-transparent bg-transparent px-2.5 transition-colors hover:bg-accent/40",
        className
      )}
    >
      <Globe className="h-3.5 w-3.5 text-muted-foreground dark:text-white" />
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={cn(
          "h-full cursor-pointer bg-transparent pr-4 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus:outline-none dark:text-white",
          selectClassName
        )}
      >
        {t(locale)}
      </button>
      <ChevronDown className="pointer-events-none absolute right-2 h-3.5 w-3.5 dark:text-white text-muted-foreground" />

      {isOpen ? (
        <div className="absolute right-0 top-full z-90 mt-2 min-w-40 rounded-lg border border-border/80 bg-popover p-1.5 shadow-xl">
          <ul role="listbox" className="space-y-1">
            {locales.map((loc) => (
              <li key={loc}>
                <button
                  type="button"
                  onClick={() => handleChange(loc)}
                  className={cn(
                    "w-full rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent/60",
                    locale === loc ? "bg-accent text-accent-foreground" : "text-popover-foreground"
                  )}
                >
                  {t(loc)}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
