"use client"

import { ArrowRight } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { LocaleLink } from "@/components/global"
import { BalanceLineChart } from "@/components/charts/balance-line-chart"
import { CashFlowBarChart } from "@/components/charts/cash-flow-bar-chart"
import { ExpenseDonutChart } from "@/components/charts/expense-donut-chart"
import {
  createBalanceChartConfig,
  createCashFlowChartConfig,
  createExpenseBucketChartConfig,
} from "@/components/charts/finance-chart-config"
import {
  getCurrentMonthPoint,
  toBalanceChartData,
  toCashFlowChartData,
  toExpenseDonutData,
  trendHasData,
} from "@/components/charts/trend-chart-data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { FinanceTrendPoint } from "@/server/actions/finance-planner/trend"
import type { ExpenseBucket } from "@prisma/client"

type DashboardChartsSectionProps = {
  points: FinanceTrendPoint[]
}

export function DashboardChartsSection({ points }: DashboardChartsSectionProps) {
  const t = useTranslations("dashboard.charts")
  const tBuckets = useTranslations("financePlannerPage.buckets")
  const locale = useLocale()

  const bucketLabels = {
    MONTHLY_BILLS: tBuckets("MONTHLY_BILLS"),
    FIXED_CARD: tBuckets("FIXED_CARD"),
    CREDIT_CARD: tBuckets("CREDIT_CARD"),
    OTHER: tBuckets("OTHER"),
  } satisfies Record<ExpenseBucket, string>

  const cashFlowConfig = createCashFlowChartConfig({
    income: t("legend.income"),
    expense: t("legend.expense"),
  })
  const balanceConfig = createBalanceChartConfig(t("legend.balance"))
  const bucketConfig = createExpenseBucketChartConfig(bucketLabels)

  const hasData = trendHasData(points)
  const currentMonth = getCurrentMonthPoint(points)

  if (!hasData) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>{t("title")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <p className="max-w-md text-sm text-muted-foreground">{t("empty")}</p>
          <Button asChild>
            <LocaleLink href="/finance-planner">{t("emptyCta")}</LocaleLink>
          </Button>
        </CardContent>
      </Card>
    )
  }

  const cashFlowData = toCashFlowChartData(points, locale)
  const balanceData = toBalanceChartData(points, locale)
  const donutData = currentMonth
    ? toExpenseDonutData(currentMonth, bucketLabels)
    : []

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{t("title")}</h2>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <LocaleLink href="/reports" className="gap-2">
            {t("viewReports")}
            <ArrowRight className="h-4 w-4" />
          </LocaleLink>
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("cashFlowTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <CashFlowBarChart data={cashFlowData} config={cashFlowConfig} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("expenseBreakdownTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            {donutData.length > 0 ? (
              <ExpenseDonutChart data={donutData} config={bucketConfig} />
            ) : (
              <p className="py-16 text-sm text-muted-foreground">
                {t("noExpenses")}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">{t("balanceTrendTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <BalanceLineChart data={balanceData} config={balanceConfig} />
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
