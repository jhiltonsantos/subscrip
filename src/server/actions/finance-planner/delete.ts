"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getTranslations } from "next-intl/server"
import {
  getUserIdOrNull,
  type FinancePlannerActionResult,
} from "./shared"

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
  id: string
): Promise<FinancePlannerActionResult<{ id: string }>> {
  const t = await getTranslations()

  const userId = await getUserIdOrNull()
  if (!userId) {
    return { success: false, error: t("common.unauthorized") }
  }

  const existing = await prisma.plannedExpense.findFirst({
    where: { id, monthlyPlan: { userId } },
    select: { id: true },
  })
  if (!existing) {
    return { success: false, error: t("common.notFound") }
  }

  await prisma.plannedExpense.delete({ where: { id } })

  revalidatePlannerPaths()
  return { success: true, data: { id } }
}

function revalidatePlannerPaths() {
  revalidatePath("/dashboard")
  revalidatePath("/plan")
}
