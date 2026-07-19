import { Button } from "@/components/ui/button"
import { LocaleLink } from "@/components/global"
import { LandingHeroCharts } from "@/components/landing/LandingHeroCharts"
import { getTranslations } from "next-intl/server"

export default async function LandingPage() {
  const t = await getTranslations()

  return (
    <section className="relative flex min-h-full flex-1 flex-col items-center px-4 py-8 sm:px-8 md:justify-center md:overflow-hidden md:py-6 lg:py-8">
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center gap-8 text-center md:gap-10">
        <div className="flex max-w-4xl flex-col items-center">
          <h1 className="whitespace-pre-line text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            {t("landing.hero.title")}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:mt-5 sm:text-lg">
            {t("landing.hero.description")}
          </p>

          <div className="mt-7 flex justify-center sm:mt-8">
            <Button
              asChild
              size="lg"
              className="h-12 w-full max-w-64 bg-gradient-primary px-8 text-base transition-opacity hover:opacity-90"
            >
              <LocaleLink href="/auth/register">{t("landing.hero.cta")}</LocaleLink>
            </Button>
          </div>
        </div>

        <LandingHeroCharts />
      </div>
    </section>
  )
}
