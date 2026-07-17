"use client"

import { Button } from "@/components/ui/button"
import { LocaleLink } from "@/components/global/LocaleLink"
import { LocaleSwitcher } from "@/components/global/LocaleSwitcher"
import { useTranslations } from "next-intl"
import { HeaderDock } from "./HeaderDock"
import { LandingHeaderPrefsMenu } from "./LandingHeaderPrefsMenu"
import { ThemeToggle } from "./ThemeToggle"

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

  // Landing variant — floating pill over the shared hero gradient
  return (
    <header className="relative z-40 shrink-0 px-4 pt-4 sm:px-6 sm:pt-5">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 rounded-full border border-gray-200/80 bg-white/60 px-3 py-2 shadow-lg backdrop-blur-xl sm:px-5 dark:border-gray-800/80 dark:bg-gray-900/60">
        <LocaleLink href="/" className="text-lg font-bold text-gray-900 dark:text-gray-100">
          {t("common.appName")}
        </LocaleLink>

        {/* Mobile: Sign In + preferences menu */}
        <div className="flex items-center gap-0.5 sm:hidden">
          <Button asChild variant="ghost" size="sm" className="px-3">
            <LocaleLink href="/auth/login">{t("landing.signIn")}</LocaleLink>
          </Button>
          <LandingHeaderPrefsMenu />
        </div>

        {/* Desktop: full controls */}
        <div className="hidden items-center gap-1.5 sm:flex">
          <LocaleSwitcher className="px-2.5" selectClassName="text-xs sm:text-sm" />
          <ThemeToggle title={t("header.theme")} className="h-9 w-9" />
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />
          <Button asChild variant="ghost" size="sm" className="px-3">
            <LocaleLink href="/auth/login">{t("landing.signIn")}</LocaleLink>
          </Button>
          <Button asChild size="sm" className="bg-emerald-600 px-3 text-white hover:bg-emerald-700">
            <LocaleLink href="/auth/register">{t("landing.getStarted")}</LocaleLink>
          </Button>
        </div>
      </div>
    </header>
  )
}
