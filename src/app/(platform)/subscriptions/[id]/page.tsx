import { Container } from "@/components/ui/container"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LocaleLink } from "@/components/global"
import { formatCurrency } from "@/lib/utils/formatters"
import { getSubscription } from "@/server/actions/subscriptions"
import { format } from "date-fns"
import { enUS, ptBR } from "date-fns/locale"
import { ArrowLeft } from "lucide-react"
import { getLocale, getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"

type PageProps = {
  params: Promise<{ id: string }>
}

export const revalidate = 0

export default async function SubscriptionDetailPage({ params }: PageProps) {
  const { id } = await params
  const tDetail = await getTranslations("subscriptionsPage.detail")
  const tPage = await getTranslations("subscriptionsPage")
  const tCommon = await getTranslations("common")
  const locale = await getLocale()
  const dateLocale = locale === "pt" ? ptBR : enUS

  const result = await getSubscription(id)

  if (!result.success) {
    if (result.error === tCommon("notFound")) {
      notFound()
    }
    return (
      <Container>
        <p className="text-destructive py-8">{tDetail("loadError")}</p>
      </Container>
    )
  }

  const sub = result.data

  return (
    <Container>
      <div className="space-y-6">
        <Button variant="ghost" className="gap-2 -ml-2" asChild>
          <LocaleLink href="/subscriptions">
            <ArrowLeft className="size-4" />
            {tDetail("back")}
          </LocaleLink>
        </Button>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">{sub.name}</h1>
          <p className="text-muted-foreground">
            {sub.active ? tPage("status.active") : tPage("status.inactive")}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{tDetail("overview")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <DetailRow
                label={tPage("form.planLabel")}
                value={sub.planLabel?.trim() ? sub.planLabel : "—"}
              />
              <DetailRow
                label={tPage("table.price")}
                value={formatCurrency(Number(sub.price), sub.currency)}
              />
              <DetailRow label={tPage("form.billingCycle")} value={sub.billingCycle} />
              <DetailRow label={tPage("form.category")} value={sub.category} />
              <DetailRow
                label={tPage("form.startDate")}
                value={format(new Date(sub.startDate), "PPP", { locale: dateLocale })}
              />
              <DetailRow
                label={tPage("form.nextBillingDate")}
                value={format(new Date(sub.nextBillingDate), "PPP", { locale: dateLocale })}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{tDetail("relations")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">{tDetail("serviceTemplate")}</p>
                <p className="font-medium">
                  {sub.serviceTemplate?.name ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">{tDetail("paymentMethod")}</p>
                <p className="font-medium">
                  {sub.paymentMethod?.name ?? "—"}
                </p>
              </div>
              {sub.serviceTemplate &&
                (sub.serviceTemplate.pricingUrl || sub.serviceTemplate.cancelUrl) && (
                  <div>
                    <p className="text-muted-foreground mb-2">{tDetail("links")}</p>
                    <ul className="space-y-2">
                      {sub.serviceTemplate.pricingUrl ? (
                        <li>
                          <a
                            href={sub.serviceTemplate.pricingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {tDetail("pricingPage")}
                          </a>
                        </li>
                      ) : null}
                      {sub.serviceTemplate.cancelUrl ? (
                        <li>
                          <a
                            href={sub.serviceTemplate.cancelUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {tDetail("cancelPage")}
                          </a>
                        </li>
                      ) : null}
                    </ul>
                  </div>
                )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{tDetail("reminders")}</CardTitle>
          </CardHeader>
          <CardContent>
            {sub.reminders.length === 0 ? (
              <p className="text-muted-foreground text-sm">{tDetail("noReminders")}</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {sub.reminders.map((r) => (
                  <li
                    key={r.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3"
                  >
                    <span>
                      {tDetail("daysBefore", { days: r.daysBefore })} · {r.channel}
                    </span>
                    <span className="text-muted-foreground">
                      {r.enabled ? tDetail("enabled") : tDetail("disabled")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </Container>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium sm:text-right">{value}</span>
    </div>
  )
}
