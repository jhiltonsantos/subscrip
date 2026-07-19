"use client"

import { useEffect, useRef, useState } from "react"
import { Ellipsis } from "lucide-react"
import { useTranslations } from "next-intl"
import { LocaleSwitcher } from "@/components/global/LocaleSwitcher"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "./ThemeToggle"

export function LandingHeaderPrefsMenu() {
  const t = useTranslations()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null
      if (containerRef.current && target && !containerRef.current.contains(target)) {
        setOpen(false)
      }
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", onPointerDown)
    document.addEventListener("touchstart", onPointerDown)
    document.addEventListener("keydown", onKeyDown)

    return () => {
      document.removeEventListener("mousedown", onPointerDown)
      document.removeEventListener("touchstart", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open])

  return (
    <div ref={containerRef} className="relative">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-9 w-9 text-gray-600 hover:text-gray-900 dark:text-white dark:hover:text-gray-200"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={t("landing.openPreferences")}
        onClick={() => setOpen((current) => !current)}
      >
        <Ellipsis className="h-5 w-5" />
      </Button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 min-w-[11rem] rounded-xl border border-gray-200/80 bg-white/95 p-2 shadow-lg backdrop-blur-xl dark:border-gray-800/80 dark:bg-gray-900/95"
        >
          <div className="flex flex-col gap-1">
            <div className="px-1 py-1">
              <LocaleSwitcher className="w-full px-2.5" selectClassName="text-sm" />
            </div>
            <div className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5">
              <span className="text-sm text-muted-foreground">{t("header.theme")}</span>
              <ThemeToggle title={t("header.theme")} className="h-9 w-9" />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
