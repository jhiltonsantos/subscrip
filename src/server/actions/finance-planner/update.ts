"use server"

import { prisma } from "@/lib/prisma"
import {
  plannedExpenseUpdateSchema,
  plannedIncomeUpdateSchema,
  type PlannedExpenseUpdateInput,
  type PlannedIncomeUpdateInput,
} from "@/lib/validations/finance-planner"
import { addMonths } from "date-fns"
import { InvoiceStatus, Prisma, PlanEntrySource } from "@prisma/client"
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
  validateExpenseRelations,
  type FinancePlannerActionResult,
} from "./shared"
import { syncCreditCardInvoices, type CardMonthRef } from "./card-invoices"

type UpdateMode = "single" | "future"

export async function updatePlannedIncome(
  id: string,
  raw: unknown,
  mode: UpdateMode = "single"
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
    await updateFuturePlannedIncomes(userId, existing, data)
  } else {
    await prisma.plannedIncome.update({
      where: { id },
      data: buildIncomeUpdateData(data),
      select: { id: true },
    })
  }

  revalidatePlannerPaths()
  return { success: true, data: { id } }
}

export async function updatePlannedExpense(
  id: string,
  raw: unknown,
  mode: UpdateMode = "single"
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
    select: {
      id: true,
      expenseBucket: true,
      paymentCardId: true,
      creditCardInvoiceId: true,
      recurrenceGroupId: true,
      monthlyPlan: { select: { year: true, month: true } },
    },
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
  const relationError = await validateExpenseRelations(userId, data)
  if (relationError) return relationError

  if (mode === "future" && existing.recurrenceGroupId) {
    const refs = await updateFuturePlannedExpenses(userId, existing, data)
    await syncCreditCardInvoices(userId, refs)
  } else {
    await prisma.plannedExpense.update({
      where: { id },
      data: buildExpenseUpdateData(data),
      select: { id: true },
    })
    await syncInvoicePaymentState(userId, existing, data)
    await syncCreditCardInvoices(userId, [
      toCardMonthRef(existing),
      {
        paymentCardId:
          data.paymentCardId !== undefined ? data.paymentCardId : existing.paymentCardId,
        year: existing.monthlyPlan.year,
        month: existing.monthlyPlan.month,
      },
    ])
  }

  revalidatePlannerPaths()
  return { success: true, data: { id } }
}

function buildIncomeUpdateData(
  data: PlannedIncomeUpdateInput,
  monthOffset = 0
): Prisma.PlannedIncomeUpdateInput {
  const updateData: Prisma.PlannedIncomeUpdateInput = {}
  if (data.name !== undefined) updateData.name = data.name
  if (data.description !== undefined) updateData.description = data.description
  if (data.amount !== undefined)
    updateData.amount = new Prisma.Decimal(data.amount)
  if (data.currency !== undefined) updateData.currency = data.currency
  if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder
  if (data.expectedDate !== undefined)
    updateData.expectedDate = addMonthsToOptionalDate(data.expectedDate, monthOffset)
  if (data.receivedAt !== undefined) updateData.receivedAt = data.receivedAt
  if (data.isReceived !== undefined) updateData.isReceived = data.isReceived
  if (data.recurrenceKind !== undefined) updateData.recurrenceKind = data.recurrenceKind
  if (data.recurrenceGroupId !== undefined)
    updateData.recurrenceGroupId = data.recurrenceGroupId
  if (data.recurrenceNumber !== undefined)
    updateData.recurrenceNumber =
      data.recurrenceNumber === null ? null : data.recurrenceNumber + monthOffset
  if (data.recurrenceTotal !== undefined)
    updateData.recurrenceTotal = data.recurrenceTotal
  return updateData
}

function buildExpenseUpdateData(
  data: PlannedExpenseUpdateInput,
  monthOffset = 0
): Prisma.PlannedExpenseUpdateInput {
  const updateData: Prisma.PlannedExpenseUpdateInput = {}
  if (data.name !== undefined) updateData.name = data.name
  if (data.merchantName !== undefined) updateData.merchantName = data.merchantName
  if (data.description !== undefined) updateData.description = data.description
  if (data.amount !== undefined)
    updateData.amount = new Prisma.Decimal(data.amount)
  if (data.currency !== undefined) updateData.currency = data.currency
  if (data.expenseBucket !== undefined)
    updateData.expenseBucket = data.expenseBucket
  if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder
  if (data.purchaseDate !== undefined)
    updateData.purchaseDate = addMonthsToOptionalDate(data.purchaseDate, monthOffset)
  if (data.dueDate !== undefined)
    updateData.dueDate = addMonthsToOptionalDate(data.dueDate, monthOffset)
  if (data.paidAt !== undefined) updateData.paidAt = data.paidAt
  if (data.isPaid !== undefined) updateData.isPaid = data.isPaid
  if (data.installmentNumber !== undefined)
    updateData.installmentNumber =
      data.installmentNumber === null ? null : data.installmentNumber + monthOffset
  if (data.installmentTotal !== undefined)
    updateData.installmentTotal = data.installmentTotal
  if (data.recurrenceKind !== undefined) updateData.recurrenceKind = data.recurrenceKind
  if (data.recurrenceGroupId !== undefined)
    updateData.recurrenceGroupId = data.recurrenceGroupId
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
  return updateData
}

async function updateFuturePlannedIncomes(
  userId: string,
  existing: {
    recurrenceGroupId: string | null
    monthlyPlan: { year: number; month: number }
  },
  data: PlannedIncomeUpdateInput
) {
  const rows = await prisma.plannedIncome.findMany({
    where: {
      recurrenceGroupId: existing.recurrenceGroupId,
      monthlyPlan: futurePlanWhere(userId, existing.monthlyPlan),
    },
    select: { id: true, monthlyPlan: { select: { year: true, month: true } } },
  })

  await prisma.$transaction(
    rows.map((row) =>
      prisma.plannedIncome.update({
        where: { id: row.id },
        data: buildIncomeUpdateData(
          data,
          getMonthOffset(existing.monthlyPlan, row.monthlyPlan)
        ),
      })
    )
  )
}

async function updateFuturePlannedExpenses(
  userId: string,
  existing: {
    recurrenceGroupId: string | null
    paymentCardId?: string | null
    monthlyPlan: { year: number; month: number }
  },
  data: PlannedExpenseUpdateInput
) {
  const rows = await prisma.plannedExpense.findMany({
    where: {
      recurrenceGroupId: existing.recurrenceGroupId,
      monthlyPlan: futurePlanWhere(userId, existing.monthlyPlan),
    },
    select: {
      id: true,
      paymentCardId: true,
      expenseBucket: true,
      monthlyPlan: { select: { year: true, month: true } },
    },
  })

  await prisma.$transaction(
    rows.map((row) =>
      prisma.plannedExpense.update({
        where: { id: row.id },
        data: buildExpenseUpdateData(
          data,
          getMonthOffset(existing.monthlyPlan, row.monthlyPlan)
        ),
      })
    )
  )

  return rows.flatMap((row) => [
    toCardMonthRef(row),
    {
      paymentCardId: data.paymentCardId !== undefined ? data.paymentCardId : row.paymentCardId,
      year: row.monthlyPlan.year,
      month: row.monthlyPlan.month,
    },
  ])
}

async function syncInvoicePaymentState(
  userId: string,
  existing: {
    expenseBucket?: string | null
    paymentCardId?: string | null
    creditCardInvoiceId?: string | null
    monthlyPlan: { year: number; month: number }
  },
  data: PlannedExpenseUpdateInput
) {
  if (
    existing.expenseBucket !== "FIXED_CARD" ||
    !existing.paymentCardId ||
    !existing.creditCardInvoiceId ||
    data.isPaid === undefined
  ) {
    return
  }

  const paidAt = data.isPaid ? data.paidAt ?? new Date() : null

  await prisma.creditCardInvoice.update({
    where: { id: existing.creditCardInvoiceId },
    data: {
      status: data.isPaid ? InvoiceStatus.PAID : InvoiceStatus.OPEN,
      paidAt,
    },
  })

  await prisma.plannedExpense.updateMany({
    where: {
      expenseBucket: "CREDIT_CARD",
      paymentCardId: existing.paymentCardId,
      monthlyPlan: {
        userId,
        year: existing.monthlyPlan.year,
        month: existing.monthlyPlan.month,
      },
    },
    data: {
      isPaid: data.isPaid,
      paidAt,
    },
  })
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

function futurePlanWhere(userId: string, from: { year: number; month: number }) {
  return {
    userId,
    OR: [
      { year: { gt: from.year } },
      {
        year: from.year,
        month: { gte: from.month },
      },
    ],
  }
}

function getMonthOffset(
  from: { year: number; month: number },
  to: { year: number; month: number }
) {
  return (to.year - from.year) * 12 + (to.month - from.month)
}

function addMonthsToOptionalDate(value: Date | null | undefined, months: number) {
  return value ? addMonths(value, months) : value
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
  revalidatePath("/finance-planner")
}
