"use client"

import { useCallback, useState, useTransition } from "react"
import { useLocale, useTranslations } from "next-intl"
import { LocaleLink } from "@/components/global"
import { BalanceLineChart } from "@/components/charts/balance-line-chart"
import { CashFlowBarChart } from "@/components/charts/cash-flow-bar-chart"
import { ComparisonBarChart } from "@/components/charts/comparison-bar-chart"
import { ExpenseStackBarChart } from "@/components/charts/expense-stack-bar-chart"
import {
  createBalanceChartConfig,
  createCashFlowChartConfig,
  createComparisonChartConfig,
  createExpenseBucketChartConfig,
} from "@/components/charts/finance-chart-config"
import { formatChartCurrency, formatChartPercent } from "@/components/charts/format-chart-currency"
import {
  formatTrendMonthLongLabel,
  toBalanceChartData,
  toCashFlowChartData,
  toExpenseStackChartData,
  trendHasData,
} from "@/components/charts/trend-chart-data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils/helpers"
import {
  getFinanceTrend,
  getMonthComparison,
  type FinanceTrendPoint,
  type MonthComparisonResult,
} from "@/server/actions/finance-planner"
import type { ExpenseBucket } from "@prisma/client"

type ReportsMode = "trend" | "compare"
type TrendPeriod = 6 | 12

type ReportsBoardProps = {
  initialPoints: FinanceTrendPoint[]
  initialYear: number
  initialMonth: number
}

export function ReportsBoard({
  initialPoints,
  initialYear,
  initialMonth,
}: ReportsBoardProps) {
  const t = useTranslations("reportsPage")
  const tSummary = useTranslations("financePlannerPage.summary")
  const tBuckets = useTranslations("financePlannerPage.buckets")
  const locale = useLocale()

  const [mode, setMode] = useState<ReportsMode>("trend")
  const [period, setPeriod] = useState<TrendPeriod>(6)
  const [points, setPoints] = useState(initialPoints)
  const [comparison, setComparison] = useState<MonthComparisonResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const [monthA, setMonthA] = useState(String(initialMonth === 1 ? 12 : initialMonth - 1))
  const [yearA, setYearA] = useState(
    String(initialMonth === 1 ? initialYear - 1 : initialYear)
  )
  const [monthB, setMonthB] = useState(String(initialMonth))
  const [yearB, setYearB] = useState(String(initialYear))

  const bucketLabels = {
    MONTHLY_BILLS: tBuckets("MONTHLY_BILLS"),
    FIXED_CARD: tBuckets("FIXED_CARD"),
    CREDIT_CARD: tBuckets("CREDIT_CARD"),
    OTHER: tBuckets("OTHER"),
  } satisfies Record<ExpenseBucket, string>

  const cashFlowConfig = createCashFlowChartConfig({
    income: tSummary("incomeTotal"),
    expense: tSummary("expenseTotal"),
  })
  const balanceConfig = createBalanceChartConfig(tSummary("balance"))
  const bucketConfig = createExpenseBucketChartConfig(bucketLabels)
  const comparisonConfig = createComparisonChartConfig({
    income: tSummary("incomeTotal"),
    expense: tSummary("expenseTotal"),
    balance: tSummary("balance"),
    subscriptions: tSummary("subscriptionTotal"),
    creditCard: tSummary("creditCardTotal"),
  })

  const loadTrend = useCallback(
    (nextPeriod: TrendPeriod) => {
      startTransition(async () => {
        setError(null)
        const result = await getFinanceTrend({
          year: initialYear,
          month: initialMonth,
          count: nextPeriod,
        })
        if (!result.success) {
          setError(result.error)
          return
        }
        setPoints(result.data.points)
        setPeriod(nextPeriod)
      })
    },
    [initialMonth, initialYear]
  )

  const loadComparison = () => {
    const parsedMonthA = Number(monthA)
    const parsedYearA = Number(yearA)
    const parsedMonthB = Number(monthB)
    const parsedYearB = Number(yearB)

    if (
      Number.isNaN(parsedMonthA) ||
      Number.isNaN(parsedYearA) ||
      Number.isNaN(parsedMonthB) ||
      Number.isNaN(parsedYearB) ||
      parsedMonthA < 1 ||
      parsedMonthA > 12 ||
      parsedMonthB < 1 ||
      parsedMonthB > 12
    ) {
      setError(t("errors.invalidMonth"))
      return
    }

    startTransition(async () => {
      setError(null)
      const result = await getMonthComparison({
        yearA: parsedYearA,
        monthA: parsedMonthA,
        yearB: parsedYearB,
        monthB: parsedMonthB,
      })
      if (!result.success) {
        setError(result.error)
        return
      }
      setComparison(result.data)
    })
  }

  const hasTrendData = trendHasData(points)
  const cashFlowData = toCashFlowChartData(points, locale)
  const balanceData = toBalanceChartData(points, locale)
  const stackData = toExpenseStackChartData(points, locale)

  const comparisonChartData = comparison
    ? comparison.metrics.map((metric) => ({
        metric: t(`metrics.${metric.key}`),
        monthA: Number(metric.valueA),
        monthB: Number(metric.valueB),
      }))
    : []

  const monthALabel = comparison
    ? formatTrendMonthLongLabel(
        comparison.monthA.year,
        comparison.monthA.month,
        locale
      )
    : ""
  const monthBLabel = comparison
    ? formatTrendMonthLongLabel(
        comparison.monthB.year,
        comparison.monthB.month,
        locale
      )
    : ""

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <div className="flex rounded-lg border p-1">
          <ModeButton
            active={mode === "trend"}
            onClick={() => setMode("trend")}
            label={t("modes.trend")}
          />
          <ModeButton
            active={mode === "compare"}
            onClick={() => setMode("compare")}
            label={t("modes.compare")}
          />
        </div>
      </div>

      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {mode === "trend" ? (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">{t("period.label")}</span>
            <Button
              size="sm"
              variant={period === 6 ? "default" : "outline"}
              onClick={() => loadTrend(6)}
              disabled={isPending}
            >
              {t("period.sixMonths")}
            </Button>
            <Button
              size="sm"
              variant={period === 12 ? "default" : "outline"}
              onClick={() => loadTrend(12)}
              disabled={isPending}
            >
              {t("period.twelveMonths")}
            </Button>
          </div>

          {!hasTrendData ? (
            <Card>
              <CardContent className="py-12 text-center text-sm text-muted-foreground">
                {t("empty")}
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">{t("charts.cashFlow")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CashFlowBarChart data={cashFlowData} config={cashFlowConfig} />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">{t("charts.balance")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <BalanceLineChart data={balanceData} config={balanceConfig} />
                  </CardContent>
                </Card>
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-base">
                      {t("charts.expenseBuckets")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ExpenseStackBarChart data={stackData} config={bucketConfig} />
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t("table.title")}</CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="pb-3 pr-4 font-medium">{t("table.month")}</th>
                        <th className="pb-3 pr-4 font-medium">{tSummary("incomeTotal")}</th>
                        <th className="pb-3 pr-4 font-medium">{tSummary("expenseTotal")}</th>
                        <th className="pb-3 pr-4 font-medium">
                          {tSummary("subscriptionTotal")}
                        </th>
                        <th className="pb-3 pr-4 font-medium">
                          {tSummary("creditCardTotal")}
                        </th>
                        <th className="pb-3 pr-4 font-medium">{tSummary("balance")}</th>
                        <th className="pb-3 font-medium">{t("table.actions")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...points].reverse().map((point) => (
                        <tr key={`${point.year}-${point.month}`} className="border-b last:border-0">
                          <td className="py-3 pr-4 font-medium">
                            {formatTrendMonthLongLabel(point.year, point.month, locale)}
                          </td>
                          <td className="py-3 pr-4">
                            {formatChartCurrency(Number(point.summary.incomeTotal), locale)}
                          </td>
                          <td className="py-3 pr-4">
                            {formatChartCurrency(Number(point.summary.expenseTotal), locale)}
                          </td>
                          <td className="py-3 pr-4">
                            {formatChartCurrency(
                              Number(point.summary.subscriptionTotal),
                              locale
                            )}
                          </td>
                          <td className="py-3 pr-4">
                            {formatChartCurrency(
                              Number(point.summary.creditCardTotal),
                              locale
                            )}
                          </td>
                          <td className="py-3 pr-4">
                            {formatChartCurrency(Number(point.summary.balance), locale)}
                          </td>
                          <td className="py-3">
                            <Button variant="link" size="sm" className="h-auto p-0" asChild>
                              <LocaleLink href="/finance-planner">
                                {t("table.openPlanner")}
                              </LocaleLink>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </>
          )}
        </>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("compare.selectMonths")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <MonthPickerGroup
                  label={t("compare.monthA")}
                  month={monthA}
                  year={yearA}
                  onMonthChange={setMonthA}
                  onYearChange={setYearA}
                  monthLabel={t("compare.month")}
                  yearLabel={t("compare.year")}
                />
                <MonthPickerGroup
                  label={t("compare.monthB")}
                  month={monthB}
                  year={yearB}
                  onMonthChange={setMonthB}
                  onYearChange={setYearB}
                  monthLabel={t("compare.month")}
                  yearLabel={t("compare.year")}
                />
              </div>
              <Button onClick={loadComparison} disabled={isPending}>
                {isPending ? t("compare.loading") : t("compare.apply")}
              </Button>
            </CardContent>
          </Card>

          {comparison ? (
            <>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {comparison.metrics.map((metric) => (
                  <Card key={metric.key}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {t(`metrics.${metric.key}`)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-end justify-between gap-3">
                        <div>
                          <p className="text-xs text-muted-foreground">{monthALabel}</p>
                          <p className="text-lg font-semibold">
                            {formatChartCurrency(Number(metric.valueA), locale)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">{monthBLabel}</p>
                          <p className="text-lg font-semibold">
                            {formatChartCurrency(Number(metric.valueB), locale)}
                          </p>
                        </div>
                      </div>
                      <p
                        className={cn(
                          "text-sm font-medium",
                          Number(metric.delta) > 0
                            ? "text-emerald-600 dark:text-emerald-400"
                            : Number(metric.delta) < 0
                              ? "text-red-600 dark:text-red-400"
                              : "text-muted-foreground"
                        )}
                      >
                        {t("compare.delta", {
                          value: formatChartCurrency(Number(metric.delta), locale),
                          percent:
                            metric.deltaPercent === null
                              ? "—"
                              : formatChartPercent(metric.deltaPercent, locale),
                        })}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t("charts.comparison")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ComparisonBarChart
                    data={comparisonChartData}
                    config={comparisonConfig}
                    monthALabel={monthALabel}
                    monthBLabel={monthBLabel}
                  />
                </CardContent>
              </Card>
            </>
          ) : null}
        </>
      )}
    </div>
  )
}

function ModeButton({
  active,
  onClick,
  label,
}: {
  active: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {label}
    </button>
  )
}

function MonthPickerGroup({
  label,
  month,
  year,
  onMonthChange,
  onYearChange,
  monthLabel,
  yearLabel,
}: {
  label: string
  month: string
  year: string
  onMonthChange: (value: string) => void
  onYearChange: (value: string) => void
  monthLabel: string
  yearLabel: string
}) {
  return (
    <div className="space-y-2 rounded-lg border p-4">
      <p className="text-sm font-medium">{label}</p>
      <div className="grid grid-cols-2 gap-3">
        <label className="space-y-1 text-sm">
          <span className="text-muted-foreground">{monthLabel}</span>
          <Input
            type="number"
            min={1}
            max={12}
            value={month}
            onChange={(event) => onMonthChange(event.target.value)}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-muted-foreground">{yearLabel}</span>
          <Input
            type="number"
            min={2000}
            max={2100}
            value={year}
            onChange={(event) => onYearChange(event.target.value)}
          />
        </label>
      </div>
    </div>
  )
}
