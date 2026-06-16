import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Container } from "@/components/ui/container"
import { CalendarDays, CreditCard, DollarSign, TrendingDown, TrendingUp } from "lucide-react"
import { format } from "date-fns"
import { ptBR, enUS } from "date-fns/locale"
import { formatCurrency } from "@/lib/utils/formatters"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { getTranslations, getLocale } from "next-intl/server"
import { getMonthSummary } from "@/server/actions/finance-planner"
import { listSubscriptions } from "@/server/actions/subscriptions"

export const revalidate = 0

export default async function DashboardPage() {
  const locale = await getLocale()
  const t = await getTranslations("dashboard")

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/auth/login")
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
  const nextSubscription = activeSubscriptions[0]
  const dateLocale = locale === "pt" ? ptBR : enUS

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
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("cards.plannedIncome")}</CardTitle>
            <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(plannedIncomeTotal, "BRL")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("cards.currentMonth")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("cards.plannedExpenses")}</CardTitle>
            <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
              <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {formatCurrency(plannedExpenseTotal, "BRL")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("cards.currentMonth")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("cards.activeSubscriptions")}</CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
              <CreditCard className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("cards.subscriptionCount", { count: activeCount })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("cards.totalOutflow")}</CardTitle>
            <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {formatCurrency(totalOutflow, "BRL")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("cards.plannedPlusSubscriptions")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("cards.projectedBalance")}</CardTitle>
            <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-900/50 flex items-center justify-center">
              <CalendarDays className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${projectedBalance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
              {formatCurrency(projectedBalance, "BRL")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {nextSubscription
                ? t("cards.nextPaymentWithName", {
                    name: nextSubscription.name,
                    date: format(new Date(nextSubscription.nextBillingDate), "dd/MM"),
                  })
                : t("cards.noUpcoming")}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("subscriptions.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {subscriptions.map((sub) => (
              <div 
                key={sub.id} 
                className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{sub.name}</span>
                  <span className="text-xs text-muted-foreground capitalize">
                    {sub.category.toLowerCase()} • {sub.billingCycle.toLowerCase()}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(Number(sub.price), sub.currency)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {t("subscriptions.due", {
                        date: format(new Date(sub.nextBillingDate), "dd 'de' MMMM", { locale: dateLocale })
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {subscriptions.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">{t("subscriptions.empty")}</p>
                <Button variant="link" className="text-primary mt-2">
                  {t("subscriptions.addFirst")}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      </div>
    </Container>
  )
}

function toNumber(value: string | null | undefined) {
  return value ? Number(value) : 0
}
