"use client"

import { Button } from "@/components/ui/button"
import { LocaleLink } from "@/components/global/LocaleLink"
import { LocaleSwitcher } from "@/components/global/LocaleSwitcher"
import { LogOut } from "lucide-react"
import { signOut } from "@/server/actions/auth"
import { useTranslations } from "next-intl"

interface HeaderProps {
  variant: "landing" | "auth" | "platform"
  user?: {
    name?: string | null
    email: string
  }
}

export function Header({ variant, user }: HeaderProps) {
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
      <header className="flex items-center justify-between px-6 py-4 border-b bg-background/95 backdrop-blur">
        <LocaleLink href="/dashboard" className="text-xl font-bold">
          {t("common.appName")}
        </LocaleLink>
        <div className="flex items-center gap-4">
          <LocaleSwitcher />
          {user && (
            <span className="text-sm text-muted-foreground">
              {user.name || user.email}
            </span>
          )}
          <form action={signOut}>
            <Button variant="ghost" size="icon" type="submit">
              <LogOut className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </header>
    )
  }

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <LocaleLink href="/" className="text-xl font-bold">
        {t("common.appName")}
      </LocaleLink>
      <div className="flex items-center gap-4">
        <LocaleSwitcher />
        <Button asChild variant="ghost">
          <LocaleLink href="/auth/login">{t("landing.signIn")}</LocaleLink>
        </Button>
        <Button asChild>
          <LocaleLink href="/auth/register">{t("landing.getStarted")}</LocaleLink>
        </Button>
      </div>
    </header>
  )
}
