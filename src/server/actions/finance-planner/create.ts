"use server"

import { prisma } from "@/lib/prisma"
import {
  plannedExpenseCreateSchema,
  plannedIncomeCreateSchema,
  type PlannedIncomeCreateInput,
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
import { buildCardDueDate, syncCreditCardInvoices } from "./card-invoices"

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
  const rows = await createPlannedIncomeRows(userId, data)

  revalidatePlannerPaths()
  return { success: true, data: rows[0] }
}

async function createPlannedIncomeRows(
  userId: string,
  data: PlannedIncomeCreateInput
) {
  const entryCount = getIncomeEntryCount(data)
  const isFiniteRecurrence = data.createMonthlyRecurring && Boolean(data.recurrenceMonths)
  const recurrenceGroupId =
    entryCount > 1 ? data.recurrenceGroupId ?? randomUUID() : data.recurrenceGroupId
  const startDate = data.expectedDate ?? new Date(data.year, data.month - 1, 1)
  const rows: { id: string }[] = []

  for (let index = 0; index < entryCount; index += 1) {
    const planDate = addMonths(startDate, index)
    const plan = await getOrCreateMonthlyPlan(
      userId,
      planDate.getFullYear(),
      planDate.getMonth() + 1
    )
    const isCurrentRowReceived = index === 0 ? data.isReceived : false

    const row = await prisma.plannedIncome.create({
      data: {
        monthlyPlanId: plan.id,
        name: data.name,
        description: data.description ?? undefined,
        amount: new Prisma.Decimal(data.amount),
        currency: data.currency,
        sortOrder: data.sortOrder,
        expectedDate: addMonthsToOptionalDate(data.expectedDate, index),
        receivedAt: isCurrentRowReceived ? data.receivedAt ?? undefined : undefined,
        isReceived: isCurrentRowReceived,
        recurrenceKind: entryCount > 1 ? RecurrenceKind.MONTHLY_RECURRING : data.recurrenceKind ?? undefined,
        recurrenceGroupId: recurrenceGroupId ?? undefined,
        recurrenceNumber: isFiniteRecurrence ? index + 1 : data.recurrenceNumber ?? undefined,
        recurrenceTotal: isFiniteRecurrence ? entryCount : data.recurrenceTotal ?? undefined,
      },
      select: { id: true },
    })
    rows.push(row)
  }

  return rows
}

function getIncomeEntryCount(data: PlannedIncomeCreateInput) {
  if (!data.createMonthlyRecurring) return 1
  return data.recurrenceMonths ?? 12
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
  await syncCreditCardInvoices(userId, rows)

  revalidatePlannerPaths()
  return { success: true, data: rows[0] }
}

async function createPlannedExpenseRows(
  userId: string,
  data: PlannedExpenseCreateInput,
  source: PlanEntrySource
) {
  const cardDueDay = await getCardDueDay(userId, data)
  const schedule = buildExpenseSchedule(data, cardDueDay)
  const entryCount = schedule.length
  const recurrenceKind = getRecurrenceKind(data)
  const recurrenceGroupId =
    entryCount > 1 ? data.recurrenceGroupId ?? randomUUID() : data.recurrenceGroupId
  const rows: { id: string; paymentCardId: string | null; year: number; month: number }[] = []

  for (const item of schedule) {
    const plan = await getOrCreateMonthlyPlan(
      userId,
      item.year,
      item.month
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
        purchaseDate: item.purchaseDate,
        dueDate: item.dueDate,
        paidAt: data.paidAt ?? undefined,
        isPaid: data.isPaid,
        source,
        paymentMethodId: data.paymentMethodId ?? undefined,
        paymentCardId: data.paymentCardId ?? undefined,
        creditCardInvoiceId: data.creditCardInvoiceId ?? undefined,
        subscriptionId: data.subscriptionId ?? undefined,
        installmentPurchaseId: data.installmentPurchaseId ?? undefined,
        installmentNumber: item.installmentNumber,
        installmentTotal: data.installmentTotal ?? undefined,
        recurrenceKind: recurrenceKind ?? undefined,
        recurrenceGroupId: recurrenceGroupId ?? undefined,
      },
      select: { id: true },
    })
    rows.push({
      ...row,
      paymentCardId: data.paymentCardId ?? null,
      year: item.year,
      month: item.month,
    })
  }

  return rows
}

async function getCardDueDay(userId: string, data: PlannedExpenseCreateInput) {
  if (!isCreditCardExpense(data)) return null
  const card = await prisma.paymentCard.findFirst({
    where: { id: data.paymentCardId ?? undefined, userId },
    select: { dueDay: true },
  })
  return card?.dueDay ?? null
}

function buildExpenseSchedule(
  data: PlannedExpenseCreateInput,
  cardDueDay: number | null
) {
  if (isCreditCardExpense(data)) {
    return buildCreditCardExpenseSchedule(data, cardDueDay)
  }

  const entryCount = getEntryCount(data)
  const startDate = data.purchaseDate ?? data.dueDate ?? new Date(data.year, data.month - 1, 1)

  return Array.from({ length: entryCount }, (_, index) => {
    const planDate = addMonths(startDate, index)
    return {
      year: planDate.getFullYear(),
      month: planDate.getMonth() + 1,
      purchaseDate: addMonthsToOptionalDate(data.purchaseDate, index),
      dueDate: addMonthsToOptionalDate(data.dueDate, index),
      installmentNumber: data.installmentNumber ? data.installmentNumber + index : undefined,
    }
  })
}

function buildCreditCardExpenseSchedule(
  data: PlannedExpenseCreateInput,
  cardDueDay: number | null
) {
  const currentInstallment = data.installmentNumber ?? 1
  const totalInstallments =
    data.createFutureInstallments && data.installmentTotal
      ? data.installmentTotal
      : currentInstallment

  return Array.from({ length: totalInstallments }, (_, index) => {
    const installmentNumber = index + 1
    const planDate = addMonths(
      new Date(data.year, data.month - 1, 1),
      installmentNumber - currentInstallment
    )
    const year = planDate.getFullYear()
    const month = planDate.getMonth() + 1

    return {
      year,
      month,
      purchaseDate: undefined,
      dueDate: buildCardDueDate(year, month, cardDueDay),
      installmentNumber:
        data.createFutureInstallments && data.installmentTotal
          ? installmentNumber
          : data.installmentNumber ?? undefined,
    }
  })
}

function isCreditCardExpense(data: PlannedExpenseCreateInput) {
  return data.expenseBucket === "CREDIT_CARD" && Boolean(data.paymentCardId)
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
