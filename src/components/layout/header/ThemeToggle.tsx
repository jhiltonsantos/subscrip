"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils/helpers"
import { useTranslations } from "next-intl"

interface ThemeToggleProps {
  className?: string
  title?: string
}

export function ThemeToggle({ className, title }: ThemeToggleProps) {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  const t = useTranslations()
  useEffect(() => {
    setMounted(true)
  }, [])

  const buttonTitle = mounted
    ? title ?? (resolvedTheme === "dark" ? t("theme.lightMode") : t("theme.darkMode"))
    : title ?? t("theme.toggleTheme")

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className={cn(
        "h-9 w-9 text-gray-600 hover:text-gray-900 dark:text-white dark:hover:text-gray-200",
        className
      )}
      title={buttonTitle}
      aria-label={buttonTitle}
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  )
}
