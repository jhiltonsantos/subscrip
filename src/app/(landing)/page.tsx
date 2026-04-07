import { Button } from "@/components/ui/button"
import { LocaleLink } from "@/components/global"
import { getTranslations } from "next-intl/server"

export default async function LandingPage() {
  const t = await getTranslations()

  return (
    <section className="flex-1 flex flex-col items-center justify-center space-y-8 p-8 text-center bg-linear-to-br from-emerald-50/50 via-background to-emerald-100/30 dark:from-emerald-950/20 dark:via-background dark:to-emerald-900/10">
      <h1 className="text-5xl font-bold tracking-tight whitespace-pre-line">
        {t("landing.hero.title")}
      </h1>
      <p className="text-lg text-muted-foreground max-w-2xl">
        {t("landing.hero.description")}
      </p>
      <Button asChild size="lg" className="h-12 px-8 text-lg bg-gradient-primary hover:opacity-90 transition-opacity">
        <LocaleLink href="/auth/register">{t("landing.hero.cta")}</LocaleLink>
      </Button>
    </section>
  )
}
