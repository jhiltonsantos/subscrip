import { Container } from "@/components/ui/container"
import { DashboardChartsSection } from "@/components/dashboard/dashboard-charts-section"
import { DashboardSubscriptionsSection } from "@/components/dashboard/dashboard-subscriptions-section"
import { DashboardSummaryCards } from "@/components/dashboard/dashboard-summary-cards"
import {
  DashboardUpcomingCarousel,
  type DashboardUpcomingBill,
  type DashboardUpcomingSubscription,
} from "@/components/dashboard/dashboard-upcoming-carousel"
import { format } from "date-fns"
import { resolveNextChargeDate } from "@/lib/subscription-billing"
import { auth } from "@/lib/auth"
import { localizedRedirect } from "@/lib/i18n/localized-redirect"
import { headers } from "next/headers"
import { getTranslations } from "next-intl/server"
import {
  getFinanceTrend,
  getMonthlyPlan,
  getMonthSummary,
} from "@/server/actions/finance-planner"
import { listSubscriptions } from "@/server/actions/subscriptions"
import type { SerializedMonthlyPlan } from "@/server/actions/finance-planner"

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
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  const [subscriptionsResult, summaryResult, trendResult, planResult] =
    await Promise.all([
      listSubscriptions(),
      getMonthSummary({ year, month }),
      getFinanceTrend({ year, month, count: 6 }),
      getMonthlyPlan({ year, month }),
    ])

  const subscriptions = subscriptionsResult.success ? subscriptionsResult.data : []
  const summary = summaryResult.success ? summaryResult.data : null
  const trendPoints = trendResult.success ? trendResult.data.points : []
  const plan = planResult.success ? planResult.data.plan : null
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
  const nextSubscriptionSource = subscriptionsWithNextCharge[0] ?? null
  const projectedBalanceFooter = nextSubscriptionSource
    ? t("cards.nextPaymentWithName", {
        name: nextSubscriptionSource.sub.name,
        date: format(nextSubscriptionSource.nextCharge, "dd/MM"),
      })
    : t("cards.noUpcoming")

  const nextSubscription: DashboardUpcomingSubscription | null =
    nextSubscriptionSource
      ? {
          id: nextSubscriptionSource.sub.id,
          name: nextSubscriptionSource.sub.name,
          price: Number(nextSubscriptionSource.sub.price),
          currency: nextSubscriptionSource.sub.currency,
          nextChargeIso: nextSubscriptionSource.nextCharge.toISOString(),
        }
      : null

  const nextBill = resolveNextUpcomingBill(plan, now)

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

  const userName = session.user.name || session.user.email

  return (
    <Container>
      <div className="space-y-6">
        <div className="flex min-h-[5.5rem] items-center justify-between gap-3 py-2 lg:hidden">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-muted-foreground">
              {t("welcomeLabel")}
            </p>
            <h1 className="truncate text-2xl font-bold tracking-tight">
              {userName}
            </h1>
          </div>
          <DashboardUpcomingCarousel
            nextBill={nextBill}
            nextSubscription={nextSubscription}
          />
        </div>

        <div className="hidden items-center justify-between lg:flex">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
            <p className="text-muted-foreground">
              {t("greeting", { name: userName })}
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

        <DashboardChartsSection points={trendPoints} />

        <DashboardSubscriptionsSection subscriptions={dashboardSubscriptions} />
      </div>
    </Container>
  )
}

function toNumber(value: string | null | undefined) {
  return value ? Number(value) : 0
}

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function resolveNextUpcomingBill(
  plan: SerializedMonthlyPlan | null,
  now: Date
): DashboardUpcomingBill | null {
  if (!plan) return null

  const today = startOfLocalDay(now)

  const candidates = plan.expenses
    .map((expense) => {
      if (expense.isPaid) return null

      const isCardInvoice = expense.expenseBucket === "CREDIT_CARD"
      const dueDateIso = isCardInvoice
        ? expense.creditCardInvoice?.dueDate ?? expense.dueDate
        : expense.dueDate

      if (!dueDateIso) return null

      const dueDate = startOfLocalDay(new Date(dueDateIso))
      if (dueDate < today) return null

      const name =
        isCardInvoice && expense.creditCardInvoice?.paymentCard?.nickname
          ? expense.creditCardInvoice.paymentCard.nickname
          : expense.name

      return {
        id: expense.id,
        name,
        amount: Number(expense.amount),
        currency: expense.currency,
        dueDateIso,
        dueTime: dueDate.getTime(),
        href: (isCardInvoice ? "/card-invoice" : "/finance-planner") as
          | "/finance-planner"
          | "/card-invoice",
      }
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .sort((a, b) => a.dueTime - b.dueTime)

  const first = candidates[0]
  if (!first) return null

  return {
    id: first.id,
    name: first.name,
    amount: first.amount,
    currency: first.currency,
    dueDateIso: first.dueDateIso,
    href: first.href,
  }
}
