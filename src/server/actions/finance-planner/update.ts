"use server"

import { prisma } from "@/lib/prisma"
import {
  plannedExpenseUpdateSchema,
  plannedIncomeUpdateSchema,
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
  getUserIdOrNull,
  type FinancePlannerActionResult,
} from "./shared"

export async function updatePlannedIncome(
  id: string,
  raw: unknown
): Promise<FinancePlannerActionResult<{ id: string }>> {
  const t = await getTranslations()

  const userId = await getUserIdOrNull()
  if (!userId) {
    return { success: false, error: t("common.unauthorized") }
  }

  const parsed = plannedIncomeUpdateSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      success: false,
      error: t("common.invalidData"),
      fieldErrors: formatZodError(parsed.error),
    }
  }

  const data = parsed.data
  if (Object.keys(data).length === 0) {
    return { success: false, error: t("common.invalidData") }
  }

  const existing = await prisma.plannedIncome.findFirst({
    where: { id, monthlyPlan: { userId } },
    select: { id: true },
  })
  if (!existing) {
    return { success: false, error: t("common.notFound") }
  }

  const updateData: Prisma.PlannedIncomeUpdateInput = {}
  if (data.name !== undefined) updateData.name = data.name
  if (data.amount !== undefined)
    updateData.amount = new Prisma.Decimal(data.amount)
  if (data.currency !== undefined) updateData.currency = data.currency
  if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder
  if (data.expectedDate !== undefined) updateData.expectedDate = data.expectedDate
  if (data.receivedAt !== undefined) updateData.receivedAt = data.receivedAt
  if (data.isReceived !== undefined) updateData.isReceived = data.isReceived

  const row = await prisma.plannedIncome.update({
    where: { id },
    data: updateData,
    select: { id: true },
  })

  revalidatePlannerPaths()
  return { success: true, data: row }
}

export async function updatePlannedExpense(
  id: string,
  raw: unknown
): Promise<FinancePlannerActionResult<{ id: string }>> {
  const t = await getTranslations()

  const userId = await getUserIdOrNull()
  if (!userId) {
    return { success: false, error: t("common.unauthorized") }
  }

  const parsed = plannedExpenseUpdateSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      success: false,
      error: t("common.invalidData"),
      fieldErrors: formatZodError(parsed.error),
    }
  }

  const data = parsed.data
  if (Object.keys(data).length === 0) {
    return { success: false, error: t("common.invalidData") }
  }

  const existing = await prisma.plannedExpense.findFirst({
    where: { id, monthlyPlan: { userId } },
    select: { id: true },
  })
  if (!existing) {
    return { success: false, error: t("common.notFound") }
  }

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

  const updateData: Prisma.PlannedExpenseUpdateInput = {}
  if (data.name !== undefined) updateData.name = data.name
  if (data.amount !== undefined)
    updateData.amount = new Prisma.Decimal(data.amount)
  if (data.currency !== undefined) updateData.currency = data.currency
  if (data.expenseBucket !== undefined)
    updateData.expenseBucket = data.expenseBucket
  if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder
  if (data.purchaseDate !== undefined) updateData.purchaseDate = data.purchaseDate
  if (data.dueDate !== undefined) updateData.dueDate = data.dueDate
  if (data.paidAt !== undefined) updateData.paidAt = data.paidAt
  if (data.isPaid !== undefined) updateData.isPaid = data.isPaid
  if (data.installmentNumber !== undefined)
    updateData.installmentNumber = data.installmentNumber
  if (data.installmentTotal !== undefined)
    updateData.installmentTotal = data.installmentTotal
  if (data.paymentMethodId !== undefined)
    updateData.paymentMethod = data.paymentMethodId
      ? { connect: { id: data.paymentMethodId } }
      : { disconnect: true }
  if (data.paymentCardId !== undefined)
    updateData.paymentCard = data.paymentCardId
      ? { connect: { id: data.paymentCardId } }
      : { disconnect: true }
  if (data.creditCardInvoiceId !== undefined)
    updateData.creditCardInvoice = data.creditCardInvoiceId
      ? { connect: { id: data.creditCardInvoiceId } }
      : { disconnect: true }
  if (data.subscriptionId !== undefined)
    updateData.subscription = data.subscriptionId
      ? { connect: { id: data.subscriptionId } }
      : { disconnect: true }
  if (data.installmentPurchaseId !== undefined)
    updateData.installmentPurchase = data.installmentPurchaseId
      ? { connect: { id: data.installmentPurchaseId } }
      : { disconnect: true }

  const nextSource = resolveExpenseSource(data)
  if (nextSource) updateData.source = nextSource

  const row = await prisma.plannedExpense.update({
    where: { id },
    data: updateData,
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
  if (
    data.installmentPurchaseId === null ||
    data.subscriptionId === null ||
    data.creditCardInvoiceId === null
  ) {
    return PlanEntrySource.MANUAL
  }
  return null
}

function revalidatePlannerPaths() {
  revalidatePath("/dashboard")
  revalidatePath("/plan")
}
