import type { ChartConfig } from "@/components/ui/chart"
import type { ExpenseBucket } from "@prisma/client"

const CHART_COLORS = {
  income: "var(--chart-1)",
  expense: "var(--chart-5)",
  balance: "var(--chart-3)",
  subscriptions: "var(--chart-2)",
  creditCard: "var(--chart-4)",
} as const

const BUCKET_COLORS: Record<ExpenseBucket, string> = {
  MONTHLY_BILLS: "var(--chart-1)",
  FIXED_CARD: "var(--chart-2)",
  CREDIT_CARD: "var(--chart-4)",
  OTHER: "var(--chart-5)",
}

export function createCashFlowChartConfig(labels: {
  income: string
  expense: string
}): ChartConfig {
  return {
    income: { label: labels.income, color: CHART_COLORS.income },
    expense: { label: labels.expense, color: CHART_COLORS.expense },
  }
}

export function createBalanceChartConfig(label: string): ChartConfig {
  return {
    balance: { label, color: CHART_COLORS.balance },
  }
}

export function createExpenseBucketChartConfig(
  labels: Record<ExpenseBucket, string>
): ChartConfig {
  return {
    MONTHLY_BILLS: {
      label: labels.MONTHLY_BILLS,
      color: BUCKET_COLORS.MONTHLY_BILLS,
    },
    FIXED_CARD: { label: labels.FIXED_CARD, color: BUCKET_COLORS.FIXED_CARD },
    CREDIT_CARD: { label: labels.CREDIT_CARD, color: BUCKET_COLORS.CREDIT_CARD },
    OTHER: { label: labels.OTHER, color: BUCKET_COLORS.OTHER },
  }
}

export function createComparisonChartConfig(labels: {
  income: string
  expense: string
  balance: string
  subscriptions: string
  creditCard: string
}): ChartConfig {
  return {
    income: { label: labels.income, color: CHART_COLORS.income },
    expense: { label: labels.expense, color: CHART_COLORS.expense },
    balance: { label: labels.balance, color: CHART_COLORS.balance },
    subscriptions: {
      label: labels.subscriptions,
      color: CHART_COLORS.subscriptions,
    },
    creditCard: { label: labels.creditCard, color: CHART_COLORS.creditCard },
  }
}
