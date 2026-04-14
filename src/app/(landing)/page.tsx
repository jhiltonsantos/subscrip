import { Button } from "@/components/ui/button"
import { LocaleLink } from "@/components/global"
import { getTranslations } from "next-intl/server"

export default async function LandingPage() {
  const t = await getTranslations()

  return (
    <section className="relative flex h-full min-h-full items-start justify-center overflow-y-auto bg-linear-to-br from-emerald-50/50 via-background to-emerald-100/30 px-4 pb-10 pt-8 dark:from-emerald-950/20 dark:via-background dark:to-emerald-900/10 sm:px-8 lg:items-center lg:overflow-hidden lg:py-8">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -left-20 top-16 h-56 w-56 animate-pulse rounded-full bg-emerald-300/40 blur-3xl dark:bg-emerald-700/30" />
        <div className="absolute -right-20 bottom-16 h-64 w-64 animate-pulse rounded-full bg-cyan-300/30 blur-3xl delay-700 dark:bg-cyan-700/20" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center gap-10 lg:grid lg:grid-cols-2 lg:items-center lg:gap-12">
        <div className="text-center lg:text-left">
          <h1 className="whitespace-pre-line text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            {t("landing.hero.title")}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg lg:mx-0">
            {t("landing.hero.description")}
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Button
              asChild
              size="lg"
              className="h-12 w-full max-w-64 px-8 text-base bg-gradient-primary transition-opacity hover:opacity-90"
            >
              <LocaleLink href="/auth/register">{t("landing.hero.cta")}</LocaleLink>
            </Button>
          </div>
        </div>

        <div className="mx-auto grid w-full max-w-md gap-4 lg:max-w-none">
          <div className="glass-card animate-in fade-in-0 slide-in-from-right-8 duration-700 rounded-2xl p-5">
            <p className="text-sm text-muted-foreground">{t("landing.hero.metrics.monthlySpend")}</p>
            <p className="mt-2 text-3xl font-semibold">R$ 1.284,00</p>
            <p className="mt-1 text-sm text-emerald-600 dark:text-emerald-400">+12% {t("landing.hero.metrics.savings")}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-150 rounded-2xl p-4">
              <p className="text-xs text-muted-foreground">{t("landing.hero.metrics.activeSubscriptions")}</p>
              <p className="mt-2 text-2xl font-semibold">18</p>
            </div>
            <div className="glass-card animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-300 rounded-2xl p-4">
              <p className="text-xs text-muted-foreground">{t("landing.hero.metrics.gains")}</p>
              <p className="mt-2 text-2xl font-semibold text-emerald-600 dark:text-emerald-400">R$ 420</p>
            </div>
          </div>

          <div className="glass-card animate-in fade-in-0 slide-in-from-right-6 duration-700 delay-500 rounded-2xl p-4">
            <p className="text-sm font-medium">{t("landing.hero.metrics.controlMessage")}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
