import { format } from "date-fns"
import { enUS, ptBR } from "date-fns/locale"
import type { ExpenseBucket } from "@prisma/client"
import type { FinanceTrendPoint } from "@/server/actions/finance-planner/trend"

export function formatTrendMonthLabel(
  year: number,
  month: number,
  locale: string
) {
  const dateLocale = locale === "pt" ? ptBR : enUS
  return format(new Date(year, month - 1, 1), "MMM yy", { locale: dateLocale })
}

export function formatTrendMonthLongLabel(
  year: number,
  month: number,
  locale: string
) {
  const dateLocale = locale === "pt" ? ptBR : enUS
  return format(new Date(year, month - 1, 1), "MMMM yyyy", { locale: dateLocale })
}

export function trendHasData(points: FinanceTrendPoint[]) {
  return points.some((point) => {
    const summary = point.summary
    return (
      Number(summary.incomeTotal) > 0 ||
      Number(summary.expenseTotal) > 0 ||
      Number(summary.creditCardTotal) > 0
    )
  })
}

export function getCurrentMonthPoint(points: FinanceTrendPoint[]) {
  return points.at(-1) ?? null
}

export function toCashFlowChartData(
  points: FinanceTrendPoint[],
  locale: string
) {
  return points.map((point) => ({
    label: formatTrendMonthLabel(point.year, point.month, locale),
    income: Number(point.summary.incomeTotal),
    expense: Number(point.summary.expenseTotal),
  }))
}

export function toBalanceChartData(points: FinanceTrendPoint[], locale: string) {
  return points.map((point) => ({
    label: formatTrendMonthLabel(point.year, point.month, locale),
    balance: Number(point.summary.balance),
  }))
}

export function toExpenseDonutData(
  point: FinanceTrendPoint,
  bucketLabels: Record<ExpenseBucket, string>
) {
  return (Object.keys(point.expenseByBucket) as ExpenseBucket[]).map(
    (bucket) => ({
      key: bucket,
      label: bucketLabels[bucket],
      value: Number(point.expenseByBucket[bucket]),
      fill: `var(--color-${bucket})`,
    })
  )
}

export function toExpenseStackChartData(
  points: FinanceTrendPoint[],
  locale: string
) {
  return points.map((point) => ({
    label: formatTrendMonthLabel(point.year, point.month, locale),
    MONTHLY_BILLS: Number(point.expenseByBucket.MONTHLY_BILLS),
    FIXED_CARD: Number(point.expenseByBucket.FIXED_CARD),
    CREDIT_CARD: Number(point.expenseByBucket.CREDIT_CARD),
    OTHER: Number(point.expenseByBucket.OTHER),
  }))
}
