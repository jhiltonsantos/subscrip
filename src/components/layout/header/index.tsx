"use client"

import { Button } from "@/components/ui/button"
import { LocaleLink } from "@/components/global/LocaleLink"
import { LocaleSwitcher } from "@/components/global/LocaleSwitcher"
import { useTranslations } from "next-intl"
import { HeaderDock } from "./HeaderDock"

interface HeaderProps {
  variant: "landing" | "auth" | "platform"
}

export function Header({ variant }: HeaderProps) {
  const t = useTranslations()

  if (variant === "auth") {
    return (
      <header className="flex items-center justify-between px-6 py-4">
        <LocaleLink href="/" className="text-xl font-bold">
          {t("common.appName")}
        </LocaleLink>
        <LocaleSwitcher />
      </header>
    )
  }

  if (variant === "platform") {
    return (
      <HeaderDock showBreadcrumb={true} />
    )
  }

  // Landing variant
  return (
    <header className="border-b border-gray-200/50 dark:border-gray-800/50 bg-background/50 py-2">
      <div className="w-full max-w-5xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between gap-4 px-6 py-3 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-full border border-gray-200/80 dark:border-gray-800/80 shadow-lg">
          <LocaleLink href="/" className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {t("common.appName")}
          </LocaleLink>
          
          <div className="flex items-center gap-2">
            <LocaleSwitcher />
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />
            <Button asChild variant="ghost" size="sm">
              <LocaleLink href="/auth/login">{t("landing.signIn")}</LocaleLink>
            </Button>
            <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <LocaleLink href="/auth/register">{t("landing.getStarted")}</LocaleLink>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
