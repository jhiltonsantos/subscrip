"use server"

import { prisma } from "@/lib/prisma"
import {
  plannedExpenseCreateSchema,
  plannedIncomeCreateSchema,
  type PlannedExpenseCreateInput,
} from "@/lib/validations/finance-planner"
import { addMonths } from "date-fns"
import { randomUUID } from "node:crypto"
import { Prisma, PlanEntrySource, RecurrenceKind } from "@prisma/client"
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
  validateExpenseRelations,
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
  const relationError = await validateExpenseRelations(userId, data)
  if (relationError) return relationError

  if (
    data.createFutureInstallments &&
    data.installmentNumber &&
    data.installmentTotal &&
    data.installmentNumber > data.installmentTotal
  ) {
    return { success: false, error: t("common.invalidData") }
  }

  const source = resolveExpenseSource(data)
  const rows = await createPlannedExpenseRows(userId, data, source)

  revalidatePlannerPaths()
  return { success: true, data: rows[0] }
}

async function createPlannedExpenseRows(
  userId: string,
  data: PlannedExpenseCreateInput,
  source: PlanEntrySource
) {
  const entryCount = getEntryCount(data)
  const recurrenceKind = getRecurrenceKind(data)
  const recurrenceGroupId =
    entryCount > 1 ? data.recurrenceGroupId ?? randomUUID() : data.recurrenceGroupId
  const startDate = data.purchaseDate ?? data.dueDate ?? new Date(data.year, data.month - 1, 1)
  const rows: { id: string }[] = []

  for (let index = 0; index < entryCount; index += 1) {
    const planDate = addMonths(startDate, index)
    const plan = await getOrCreateMonthlyPlan(
      userId,
      planDate.getFullYear(),
      planDate.getMonth() + 1
    )

    const row = await prisma.plannedExpense.create({
      data: {
        monthlyPlanId: plan.id,
        name: data.name,
        merchantName: data.merchantName ?? undefined,
        description: data.description ?? undefined,
        amount: new Prisma.Decimal(data.amount),
        currency: data.currency,
        expenseBucket: data.expenseBucket,
        sortOrder: data.sortOrder,
        purchaseDate: addMonthsToOptionalDate(data.purchaseDate, index),
        dueDate: addMonthsToOptionalDate(data.dueDate, index),
        paidAt: data.paidAt ?? undefined,
        isPaid: data.isPaid,
        source,
        paymentMethodId: data.paymentMethodId ?? undefined,
        paymentCardId: data.paymentCardId ?? undefined,
        creditCardInvoiceId: data.creditCardInvoiceId ?? undefined,
        subscriptionId: data.subscriptionId ?? undefined,
        installmentPurchaseId: data.installmentPurchaseId ?? undefined,
        installmentNumber: data.installmentNumber
          ? data.installmentNumber + index
          : undefined,
        installmentTotal: data.installmentTotal ?? undefined,
        recurrenceKind: recurrenceKind ?? undefined,
        recurrenceGroupId: recurrenceGroupId ?? undefined,
      },
      select: { id: true },
    })
    rows.push(row)
  }

  return rows
}

function getEntryCount(data: PlannedExpenseCreateInput) {
  if (data.createMonthlyRecurring) return 12
  if (!data.createFutureInstallments || !data.installmentNumber || !data.installmentTotal) {
    return 1
  }
  return Math.max(1, data.installmentTotal - data.installmentNumber + 1)
}

function getRecurrenceKind(data: PlannedExpenseCreateInput) {
  if (data.createMonthlyRecurring) return RecurrenceKind.MONTHLY_RECURRING
  if (data.createFutureInstallments) return RecurrenceKind.INSTALLMENT
  return data.recurrenceKind
}

function addMonthsToOptionalDate(value: Date | null | undefined, months: number) {
  return value ? addMonths(value, months) : undefined
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
  revalidatePath("/finance-planner")
}
