"use client"

import { useMemo } from "react"
import { useLocale, useTranslations } from "next-intl"
import type { ExpenseBucket } from "@prisma/client"
import {
  CashFlowBarChart,
  type CashFlowChartPoint,
} from "@/components/charts/cash-flow-bar-chart"
import {
  ExpenseDonutChart,
  type ExpenseDonutPoint,
} from "@/components/charts/expense-donut-chart"
import {
  createCashFlowChartConfig,
  createExpenseBucketChartConfig,
} from "@/components/charts/finance-chart-config"

const DEMO_CASH_FLOW_VALUES = [
  { income: 11800, expense: 9200 },
  { income: 12500, expense: 10100 },
  { income: 13100, expense: 9800 },
  { income: 12800, expense: 11200 },
  { income: 13500, expense: 10800 },
  { income: 13177, expense: 12877 },
] as const

const DEMO_DONUT_VALUES: { key: ExpenseBucket; value: number }[] = [
  { key: "MONTHLY_BILLS", value: 4500 },
  { key: "CREDIT_CARD", value: 8200 },
  { key: "FIXED_CARD", value: 3100 },
]

function monthLabel(locale: string, monthIndex: number) {
  return new Intl.DateTimeFormat(locale, { month: "short" }).format(
    new Date(2025, monthIndex, 1)
  )
}

export function LandingHeroCharts() {
  const t = useTranslations("landing.hero.charts")
  const tBuckets = useTranslations("financePlannerPage.buckets")
  const locale = useLocale()

  const cashFlowConfig = createCashFlowChartConfig({
    income: t("legend.income"),
    expense: t("legend.expense"),
  })

  const bucketLabels = {
    MONTHLY_BILLS: tBuckets("MONTHLY_BILLS"),
    FIXED_CARD: tBuckets("FIXED_CARD"),
    CREDIT_CARD: tBuckets("CREDIT_CARD"),
    OTHER: tBuckets("OTHER"),
  } satisfies Record<ExpenseBucket, string>

  const bucketConfig = createExpenseBucketChartConfig(bucketLabels)

  const cashFlowData = useMemo<CashFlowChartPoint[]>(
    () =>
      DEMO_CASH_FLOW_VALUES.map((point, index) => ({
        label: monthLabel(locale, index),
        income: point.income,
        expense: point.expense,
      })),
    [locale]
  )

  const donutData: ExpenseDonutPoint[] = DEMO_DONUT_VALUES.map((item) => ({
    key: item.key,
    label: bucketLabels[item.key],
    value: item.value,
    fill: `var(--color-${item.key})`,
  }))

  return (
    <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
      <div className="glass-card animate-in fade-in-0 slide-in-from-bottom-4 duration-700 rounded-2xl p-4 sm:p-5">
        <h2 className="mb-3 text-left text-sm font-semibold tracking-tight sm:text-base">
          {t("cashFlowTitle")}
        </h2>
        <CashFlowBarChart
          data={cashFlowData}
          config={cashFlowConfig}
          className="aspect-auto h-[220px] w-full"
        />
      </div>

      <div className="glass-card animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-150 rounded-2xl p-4 sm:p-5">
        <h2 className="mb-3 text-left text-sm font-semibold tracking-tight sm:text-base">
          {t("expenseBreakdownTitle")}
        </h2>
        <ExpenseDonutChart data={donutData} config={bucketConfig} compact />
      </div>
    </div>
  )
}
