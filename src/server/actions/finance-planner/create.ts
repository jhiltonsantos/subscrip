"use server"

import { prisma } from "@/lib/prisma"
import {
  plannedExpenseCreateSchema,
  plannedIncomeCreateSchema,
} from "@/lib/validations/finance-planner"
import { Prisma, PlanEntrySource } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { getTranslations } from "next-intl/server"
import {
  assertInstallmentPurchaseOwnedByUser,
  assertInvoiceOwnedByUser,
  assertPaymentCardOwnedByUser,
  assertPaymentMethodOwnedByUser,
  assertSubscriptionOwnedByUser,
  formatZodError,
  getOrCreateMonthlyPlan,
  getUserIdOrNull,
  type FinancePlannerActionResult,
} from "./shared"

export async function createPlannedIncome(
  raw: unknown
): Promise<FinancePlannerActionResult<{ id: string }>> {
  const t = await getTranslations()

  const userId = await getUserIdOrNull()
  if (!userId) {
    return { success: false, error: t("common.unauthorized") }
  }

  const parsed = plannedIncomeCreateSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      success: false,
      error: t("common.invalidData"),
      fieldErrors: formatZodError(parsed.error),
    }
  }

  const data = parsed.data
  const plan = await getOrCreateMonthlyPlan(userId, data.year, data.month)

  const row = await prisma.plannedIncome.create({
    data: {
      monthlyPlanId: plan.id,
      name: data.name,
      amount: new Prisma.Decimal(data.amount),
      currency: data.currency,
      sortOrder: data.sortOrder,
      expectedDate: data.expectedDate ?? undefined,
      receivedAt: data.receivedAt ?? undefined,
      isReceived: data.isReceived,
    },
    select: { id: true },
  })

  revalidatePlannerPaths()
  return { success: true, data: row }
}

export async function createPlannedExpense(
  raw: unknown
): Promise<FinancePlannerActionResult<{ id: string }>> {
  const t = await getTranslations()

  const userId = await getUserIdOrNull()
  if (!userId) {
    return { success: false, error: t("common.unauthorized") }
  }

  const parsed = plannedExpenseCreateSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      success: false,
      error: t("common.invalidData"),
      fieldErrors: formatZodError(parsed.error),
    }
  }

  const data = parsed.data
  const ownershipError =
    (await assertPaymentMethodOwnedByUser(userId, data.paymentMethodId)) ??
    (await assertPaymentCardOwnedByUser(userId, data.paymentCardId)) ??
    (await assertInvoiceOwnedByUser(userId, data.creditCardInvoiceId)) ??
    (await assertSubscriptionOwnedByUser(userId, data.subscriptionId)) ??
    (await assertInstallmentPurchaseOwnedByUser(
      userId,
      data.installmentPurchaseId
    ))

  if (ownershipError) return ownershipError

  const plan = await getOrCreateMonthlyPlan(userId, data.year, data.month)
  const source = resolveExpenseSource(data)

  const row = await prisma.plannedExpense.create({
    data: {
      monthlyPlanId: plan.id,
      name: data.name,
      amount: new Prisma.Decimal(data.amount),
      currency: data.currency,
      expenseBucket: data.expenseBucket,
      sortOrder: data.sortOrder,
      purchaseDate: data.purchaseDate ?? undefined,
      dueDate: data.dueDate ?? undefined,
      paidAt: data.paidAt ?? undefined,
      isPaid: data.isPaid,
      source,
      paymentMethodId: data.paymentMethodId ?? undefined,
      paymentCardId: data.paymentCardId ?? undefined,
      creditCardInvoiceId: data.creditCardInvoiceId ?? undefined,
      subscriptionId: data.subscriptionId ?? undefined,
      installmentPurchaseId: data.installmentPurchaseId ?? undefined,
      installmentNumber: data.installmentNumber ?? undefined,
      installmentTotal: data.installmentTotal ?? undefined,
    },
    select: { id: true },
  })

  revalidatePlannerPaths()
  return { success: true, data: row }
}

function resolveExpenseSource(data: {
  subscriptionId?: string | null
  creditCardInvoiceId?: string | null
  installmentPurchaseId?: string | null
}) {
  if (data.installmentPurchaseId) return PlanEntrySource.INSTALLMENT
  if (data.subscriptionId) return PlanEntrySource.SUBSCRIPTION
  if (data.creditCardInvoiceId) return PlanEntrySource.CREDIT_CARD_INVOICE
  return PlanEntrySource.MANUAL
}

function revalidatePlannerPaths() {
  revalidatePath("/dashboard")
  revalidatePath("/plan")
}
