"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getTranslations } from "next-intl/server"
import {
  getUserIdOrNull,
  type FinancePlannerActionResult,
} from "./shared"
import { syncCreditCardInvoices, type CardMonthRef } from "./card-invoices"
import {
  deleteSubscriptionFromExpense,
  revalidateSubscriptionExpenseSyncPaths,
} from "@/server/actions/subscriptions/expense-sync"

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
      expenseBucket: true,
      paymentCardId: true,
      subscriptionId: true,
      recurrenceGroupId: true,
      monthlyPlan: { select: { year: true, month: true } },
    },
  })
  if (!existing) {
    return { success: false, error: t("common.notFound") }
  }

  if (existing.subscriptionId) {
    await deleteSubscriptionFromExpense(userId, id)
    await syncCreditCardInvoices(userId, [toCardMonthRef(existing)])
    revalidateSubscriptionExpenseSyncPaths()
    return { success: true, data: { id } }
  }

  if (mode === "future" && existing.recurrenceGroupId) {
    const rows = await prisma.plannedExpense.findMany({
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
      select: {
        paymentCardId: true,
        expenseBucket: true,
        monthlyPlan: { select: { year: true, month: true } },
      },
    })
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

    await syncCreditCardInvoices(userId, rows.map(toCardMonthRef))
    revalidatePlannerPaths()
    return { success: true, data: { id, count: result.count } }
  }

  await prisma.plannedExpense.delete({ where: { id } })
  await syncCreditCardInvoices(userId, [toCardMonthRef(existing)])

  revalidatePlannerPaths()
  return { success: true, data: { id } }
}

function toCardMonthRef(row: {
  paymentCardId?: string | null
  expenseBucket?: string | null
  monthlyPlan: { year: number; month: number }
}): CardMonthRef {
  return {
    paymentCardId: row.expenseBucket === "CREDIT_CARD" ? row.paymentCardId : null,
    year: row.monthlyPlan.year,
    month: row.monthlyPlan.month,
  }
}

function revalidatePlannerPaths() {
  revalidatePath("/dashboard")
  revalidatePath("/finance-planner")
}
