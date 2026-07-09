"use server"

import {
  financeTrendParamsSchema,
  monthComparisonParamsSchema,
} from "@/lib/validations/finance-planner"
import { prisma } from "@/lib/prisma"
import type { ExpenseBucket } from "@prisma/client"
import { getTranslations } from "next-intl/server"
import {
  buildExpenseBreakdown,
  buildMonthSummary,
  emptyMonthSummary,
  formatZodError,
  getUserIdOrNull,
  monthlyPlanInclude,
  type FinancePlannerActionResult,
  type MonthlyPlanWithRelations,
  type SerializedMonthSummary,
} from "./shared"

export type FinanceTrendPoint = {
  year: number
  month: number
  summary: SerializedMonthSummary
  expenseByBucket: Record<ExpenseBucket, string>
  subscriptionByCategory: { category: string; total: string }[]
}

export type FinanceTrendResult = {
  points: FinanceTrendPoint[]
}

export type MonthComparisonMetric = {
  key: "income" | "expense" | "balance" | "subscriptions" | "creditCard"
  valueA: string
  valueB: string
  delta: string
  deltaPercent: number | null
}

export type MonthComparisonResult = {
  monthA: FinanceTrendPoint
  monthB: FinanceTrendPoint
  metrics: MonthComparisonMetric[]
}

export async function getFinanceTrend(
  raw: unknown
): Promise<FinancePlannerActionResult<FinanceTrendResult>> {
  const t = await getTranslations()

  const userId = await getUserIdOrNull()
  if (!userId) {
    return { success: false, error: t("common.unauthorized") }
  }

  const parsed = financeTrendParamsSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      success: false,
      error: t("common.invalidData"),
      fieldErrors: formatZodError(parsed.error),
    }
  }

  const { year, month, count } = parsed.data
  const monthRange = getMonthRange(year, month, count)

  const plans = await prisma.monthlyPlan.findMany({
    where: {
      userId,
      OR: monthRange.map((item) => ({ year: item.year, month: item.month })),
    },
    include: monthlyPlanInclude,
  })

  const planByKey = new Map(
    plans.map((plan) => [`${plan.year}-${plan.month}`, plan])
  )

  const points = monthRange.map(({ year: y, month: m }) =>
    serializeTrendPoint(planByKey.get(`${y}-${m}`) ?? null, y, m)
  )

  return { success: true, data: { points } }
}

export async function getMonthComparison(
  raw: unknown
): Promise<FinancePlannerActionResult<MonthComparisonResult>> {
  const t = await getTranslations()

  const userId = await getUserIdOrNull()
  if (!userId) {
    return { success: false, error: t("common.unauthorized") }
  }

  const parsed = monthComparisonParamsSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      success: false,
      error: t("common.invalidData"),
      fieldErrors: formatZodError(parsed.error),
    }
  }

  const { yearA, monthA, yearB, monthB } = parsed.data

  const plans = await prisma.monthlyPlan.findMany({
    where: {
      userId,
      OR: [
        { year: yearA, month: monthA },
        { year: yearB, month: monthB },
      ],
    },
    include: monthlyPlanInclude,
  })

  const planByKey = new Map(
    plans.map((plan) => [`${plan.year}-${plan.month}`, plan])
  )

  const monthAPoint = serializeTrendPoint(
    planByKey.get(`${yearA}-${monthA}`) ?? null,
    yearA,
    monthA
  )
  const monthBPoint = serializeTrendPoint(
    planByKey.get(`${yearB}-${monthB}`) ?? null,
    yearB,
    monthB
  )

  const metrics: MonthComparisonMetric[] = [
    buildComparisonMetric("income", monthAPoint, monthBPoint),
    buildComparisonMetric("expense", monthAPoint, monthBPoint),
    buildComparisonMetric("balance", monthAPoint, monthBPoint),
    buildComparisonMetric("subscriptions", monthAPoint, monthBPoint),
    buildComparisonMetric("creditCard", monthAPoint, monthBPoint),
  ]

  return {
    success: true,
    data: {
      monthA: monthAPoint,
      monthB: monthBPoint,
      metrics,
    },
  }
}

function serializeTrendPoint(
  plan: MonthlyPlanWithRelations | null,
  year: number,
  month: number
): FinanceTrendPoint {
  if (!plan) {
    const emptyBreakdown = buildExpenseBreakdownFromEmpty()
    return {
      year,
      month,
      summary: emptyMonthSummary(),
      expenseByBucket: emptyBreakdown.expenseByBucket,
      subscriptionByCategory: emptyBreakdown.subscriptionByCategory,
    }
  }

  const breakdown = buildExpenseBreakdown(plan)
  return {
    year,
    month,
    summary: buildMonthSummary(plan),
    expenseByBucket: breakdown.expenseByBucket,
    subscriptionByCategory: breakdown.subscriptionByCategory,
  }
}

function buildExpenseBreakdownFromEmpty() {
  return {
    expenseByBucket: {
      MONTHLY_BILLS: "0",
      CREDIT_CARD: "0",
      FIXED_CARD: "0",
      OTHER: "0",
    } satisfies Record<ExpenseBucket, string>,
    subscriptionByCategory: [] as { category: string; total: string }[],
  }
}

function getMonthRange(endYear: number, endMonth: number, count: number) {
  const months: { year: number; month: number }[] = []
  let year = endYear
  let month = endMonth

  for (let index = 0; index < count; index++) {
    months.unshift({ year, month })
    month -= 1
    if (month < 1) {
      month = 12
      year -= 1
    }
  }

  return months
}

function buildComparisonMetric(
  key: MonthComparisonMetric["key"],
  monthA: FinanceTrendPoint,
  monthB: FinanceTrendPoint
): MonthComparisonMetric {
  const valueA = getMetricValue(key, monthA.summary)
  const valueB = getMetricValue(key, monthB.summary)
  const numA = Number(valueA)
  const numB = Number(valueB)
  const delta = (numB - numA).toString()

  let deltaPercent: number | null = null
  if (numA !== 0) {
    deltaPercent = ((numB - numA) / Math.abs(numA)) * 100
  }

  return { key, valueA, valueB, delta, deltaPercent }
}

function getMetricValue(
  key: MonthComparisonMetric["key"],
  summary: SerializedMonthSummary
) {
  switch (key) {
    case "income":
      return summary.incomeTotal
    case "expense":
      return summary.expenseTotal
    case "balance":
      return summary.balance
    case "subscriptions":
      return summary.subscriptionTotal
    case "creditCard":
      return summary.creditCardTotal
  }
}
