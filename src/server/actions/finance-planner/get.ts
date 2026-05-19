"use server"

import { monthPlanParamsSchema } from "@/lib/validations/finance-planner"
import { getTranslations } from "next-intl/server"
import {
  buildMonthSummary,
  formatZodError,
  getOrCreateMonthlyPlan,
  getUserIdOrNull,
  serializeMonthlyPlan,
  type FinancePlannerActionResult,
  type SerializedMonthlyPlan,
} from "./shared"

export type SerializedMonthSummary = ReturnType<typeof buildMonthSummary>

export async function getMonthlyPlan(
  raw: unknown
): Promise<
  FinancePlannerActionResult<{
    plan: SerializedMonthlyPlan
    summary: SerializedMonthSummary
  }>
> {
  const t = await getTranslations()

  const userId = await getUserIdOrNull()
  if (!userId) {
    return { success: false, error: t("common.unauthorized") }
  }

  const parsed = monthPlanParamsSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      success: false,
      error: t("common.invalidData"),
      fieldErrors: formatZodError(parsed.error),
    }
  }

  const row = await getOrCreateMonthlyPlan(
    userId,
    parsed.data.year,
    parsed.data.month
  )

  return {
    success: true,
    data: {
      plan: serializeMonthlyPlan(row),
      summary: buildMonthSummary(row),
    },
  }
}
