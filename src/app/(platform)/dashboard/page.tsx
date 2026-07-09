import { Container } from "@/components/ui/container"
import { DashboardSubscriptionsSection } from "@/components/dashboard/dashboard-subscriptions-section"
import { DashboardSummaryCards } from "@/components/dashboard/dashboard-summary-cards"
import { format } from "date-fns"
import { resolveNextChargeDate } from "@/lib/subscription-billing"
import { auth } from "@/lib/auth"
import { localizedRedirect } from "@/lib/i18n/localized-redirect"
import { headers } from "next/headers"
import { getTranslations } from "next-intl/server"
import { getMonthSummary } from "@/server/actions/finance-planner"
import { listSubscriptions } from "@/server/actions/subscriptions"

export const revalidate = 0

export default async function DashboardPage() {
  const t = await getTranslations("dashboard")

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return localizedRedirect("/auth/login")
  }

  const now = new Date()
  const [subscriptionsResult, summaryResult] = await Promise.all([
    listSubscriptions(),
    getMonthSummary({ year: now.getFullYear(), month: now.getMonth() + 1 }),
  ])

  const subscriptions = subscriptionsResult.success ? subscriptionsResult.data : []
  const summary = summaryResult.success ? summaryResult.data : null
  const activeSubscriptions = subscriptions.filter((subscription) => subscription.active)

  const estimatedSubscriptionTotal = activeSubscriptions.reduce((acc, sub) => {
    const multiplier = sub.currency === "USD" ? 6 : 1
    const price = Number(sub.price) * multiplier
    return acc + (sub.billingCycle === "YEARLY" ? price / 12 : price)
  }, 0)

  const plannedIncomeTotal = toNumber(summary?.incomeTotal)
  const plannedExpenseTotal = toNumber(summary?.expenseTotal)
  const summarySubscriptionTotal = toNumber(summary?.subscriptionTotal)
  const subscriptionTotal =
    summarySubscriptionTotal > 0 ? summarySubscriptionTotal : estimatedSubscriptionTotal
  const totalOutflow =
    plannedExpenseTotal > 0 ? plannedExpenseTotal : subscriptionTotal
  const projectedBalance = plannedIncomeTotal - totalOutflow
  const activeCount = activeSubscriptions.length
  const subscriptionsWithNextCharge = activeSubscriptions
    .map((sub) => ({
      sub,
      nextCharge: resolveNextChargeDate(sub),
    }))
    .filter(
      (item): item is { sub: (typeof activeSubscriptions)[number]; nextCharge: Date } =>
        Boolean(item.nextCharge)
    )
    .sort((a, b) => a.nextCharge.getTime() - b.nextCharge.getTime())
  const nextSubscription = subscriptionsWithNextCharge[0] ?? null
  const projectedBalanceFooter = nextSubscription
    ? t("cards.nextPaymentWithName", {
        name: nextSubscription.sub.name,
        date: format(nextSubscription.nextCharge, "dd/MM"),
      })
    : t("cards.noUpcoming")

  const dashboardSubscriptions = activeSubscriptions.map((sub) => {
    const nextCharge = resolveNextChargeDate(sub)
    return {
      id: sub.id,
      name: sub.name,
      category: sub.category,
      billingCycle: sub.billingCycle,
      price: Number(sub.price),
      currency: sub.currency,
      nextChargeIso: nextCharge?.toISOString() ?? null,
    }
  })

  return (
    <Container>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
            <p className="text-muted-foreground">
              {t("greeting", { name: session.user.name || session.user.email })}
            </p>
          </div>
        </div>

        <DashboardSummaryCards
          plannedIncomeTotal={plannedIncomeTotal}
          plannedExpenseTotal={plannedExpenseTotal}
          activeCount={activeCount}
          totalOutflow={totalOutflow}
          projectedBalance={projectedBalance}
          projectedBalanceFooter={projectedBalanceFooter}
        />

        <DashboardSubscriptionsSection subscriptions={dashboardSubscriptions} />
      </div>
    </Container>
  )
}

function toNumber(value: string | null | undefined) {
  return value ? Number(value) : 0
}
