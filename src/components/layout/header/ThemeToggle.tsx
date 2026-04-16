"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils/helpers"

interface ThemeToggleProps {
  className?: string
  title?: string
}

export function ThemeToggle({ className, title }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const buttonTitle = title ?? (resolvedTheme === "dark" ? "Light mode" : "Dark mode")

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
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
