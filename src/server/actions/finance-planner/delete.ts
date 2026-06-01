"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getTranslations } from "next-intl/server"
import {
  getUserIdOrNull,
  type FinancePlannerActionResult,
} from "./shared"

type DeleteExpenseMode = "single" | "future"

export async function deletePlannedIncome(
  id: string
): Promise<FinancePlannerActionResult<{ id: string }>> {
  const t = await getTranslations()

  const userId = await getUserIdOrNull()
  if (!userId) {
    return { success: false, error: t("common.unauthorized") }
  }

  const existing = await prisma.plannedIncome.findFirst({
    where: { id, monthlyPlan: { userId } },
    select: { id: true },
  })
  if (!existing) {
    return { success: false, error: t("common.notFound") }
  }

  await prisma.plannedIncome.delete({ where: { id } })

  revalidatePlannerPaths()
  return { success: true, data: { id } }
}

export async function deletePlannedExpense(
  id: string,
  mode: DeleteExpenseMode = "single"
): Promise<FinancePlannerActionResult<{ id: string; count?: number }>> {
  const t = await getTranslations()

  const userId = await getUserIdOrNull()
  if (!userId) {
    return { success: false, error: t("common.unauthorized") }
  }

  const existing = await prisma.plannedExpense.findFirst({
    where: { id, monthlyPlan: { userId } },
    select: {
      id: true,
      recurrenceGroupId: true,
      monthlyPlan: { select: { year: true, month: true } },
    },
  })
  if (!existing) {
    return { success: false, error: t("common.notFound") }
  }

  if (mode === "future" && existing.recurrenceGroupId) {
    const result = await prisma.plannedExpense.deleteMany({
      where: {
        recurrenceGroupId: existing.recurrenceGroupId,
        monthlyPlan: {
          userId,
          OR: [
            { year: { gt: existing.monthlyPlan.year } },
            {
              year: existing.monthlyPlan.year,
              month: { gte: existing.monthlyPlan.month },
            },
          ],
        },
      },
    })

    revalidatePlannerPaths()
    return { success: true, data: { id, count: result.count } }
  }

  await prisma.plannedExpense.delete({ where: { id } })

  revalidatePlannerPaths()
  return { success: true, data: { id } }
}

function revalidatePlannerPaths() {
  revalidatePath("/dashboard")
  revalidatePath("/finance-planner")
}
