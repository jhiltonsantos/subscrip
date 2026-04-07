import { Button } from "@/components/ui/button"
import { LocaleLink } from "@/components/locale-link"
import { LocaleSwitcher } from "@/components/locale-switcher"
import { useTranslations } from "next-intl"

export default function LandingPage() {
  const t = useTranslations()

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between px-6 py-4 border-b">
        <h1 className="text-xl font-bold">{t("common.appName")}</h1>
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

      <main className="flex-1 flex flex-col items-center justify-center space-y-8 p-8 text-center bg-gradient-to-br from-emerald-50/50 via-background to-emerald-100/30 dark:from-emerald-950/20 dark:via-background dark:to-emerald-900/10">
        <h2 className="text-5xl font-bold tracking-tight whitespace-pre-line">
          {t("landing.hero.title")}
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl">
          {t("landing.hero.description")}
        </p>
        <Button asChild size="lg" className="h-12 px-8 text-lg bg-gradient-primary hover:opacity-90 transition-opacity">
          <LocaleLink href="/auth/register">{t("landing.hero.cta")}</LocaleLink>
        </Button>
      </main>
    </div>
  )
}
