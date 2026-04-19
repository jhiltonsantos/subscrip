import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import type { ZodError } from "zod"
import { headers } from "next/headers"
import { getTranslations } from "next-intl/server"

export const monthlyPlanInclude = {
  incomes: {
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  },
  expenses: {
    include: {
      paymentMethod: true,
      paymentCard: true,
      creditCardInvoice: {
        include: { paymentCard: true },
      },
      subscription: true,
      installmentPurchase: true,
    },
    orderBy: [{ sortOrder: "asc" }, { dueDate: "asc" }, { createdAt: "asc" }],
  },
} satisfies Prisma.MonthlyPlanInclude

export type MonthlyPlanWithRelations = Prisma.MonthlyPlanGetPayload<{
  include: typeof monthlyPlanInclude
}>

export type FinancePlannerActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> }

export function formatZodError(err: ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {}
  for (const issue of err.issues) {
    const path = issue.path.join(".") || "_root"
    if (!fieldErrors[path]) fieldErrors[path] = []
    fieldErrors[path].push(issue.message)
  }
  return fieldErrors
}

export async function getUserIdOrNull(): Promise<string | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  return session?.user?.id ?? null
}

export async function getOrCreateMonthlyPlan(
  userId: string,
  year: number,
  month: number
): Promise<MonthlyPlanWithRelations> {
  return prisma.monthlyPlan.upsert({
    where: { userId_year_month: { userId, year, month } },
    create: { userId, year, month },
    update: {},
    include: monthlyPlanInclude,
  })
}

export async function assertPaymentMethodOwnedByUser(
  userId: string,
  paymentMethodId: string | null | undefined
): Promise<FinancePlannerActionResult<never> | null> {
  if (!paymentMethodId) return null

  const paymentMethod = await prisma.paymentMethod.findFirst({
    where: { id: paymentMethodId, userId },
    select: { id: true },
  })

  if (!paymentMethod) {
    const t = await getTranslations()
    return { success: false, error: t("common.notFound") }
  }

  return null
}

export async function assertPaymentCardOwnedByUser(
  userId: string,
  paymentCardId: string | null | undefined
): Promise<FinancePlannerActionResult<never> | null> {
  if (!paymentCardId) return null

  const paymentCard = await prisma.paymentCard.findFirst({
    where: { id: paymentCardId, userId },
    select: { id: true },
  })

  if (!paymentCard) {
    const t = await getTranslations()
    return { success: false, error: t("common.notFound") }
  }

  return null
}

export async function assertSubscriptionOwnedByUser(
  userId: string,
  subscriptionId: string | null | undefined
): Promise<FinancePlannerActionResult<never> | null> {
  if (!subscriptionId) return null

  const subscription = await prisma.subscription.findFirst({
    where: { id: subscriptionId, userId },
    select: { id: true },
  })

  if (!subscription) {
    const t = await getTranslations()
    return { success: false, error: t("common.notFound") }
  }

  return null
}

export async function assertInvoiceOwnedByUser(
  userId: string,
  creditCardInvoiceId: string | null | undefined
): Promise<FinancePlannerActionResult<never> | null> {
  if (!creditCardInvoiceId) return null

  const invoice = await prisma.creditCardInvoice.findFirst({
    where: { id: creditCardInvoiceId, userId },
    select: { id: true },
  })

  if (!invoice) {
    const t = await getTranslations()
    return { success: false, error: t("common.notFound") }
  }

  return null
}

export async function assertInstallmentPurchaseOwnedByUser(
  userId: string,
  installmentPurchaseId: string | null | undefined
): Promise<FinancePlannerActionResult<never> | null> {
  if (!installmentPurchaseId) return null

  const installmentPurchase = await prisma.installmentPurchase.findFirst({
    where: { id: installmentPurchaseId, userId },
    select: { id: true },
  })

  if (!installmentPurchase) {
    const t = await getTranslations()
    return { success: false, error: t("common.notFound") }
  }

  return null
}

export function serializeMonthlyPlan(row: MonthlyPlanWithRelations) {
  return {
    ...row,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    incomes: row.incomes.map((income) => ({
      ...income,
      amount: income.amount.toString(),
      expectedDate: income.expectedDate?.toISOString() ?? null,
      receivedAt: income.receivedAt?.toISOString() ?? null,
      createdAt: income.createdAt.toISOString(),
      updatedAt: income.updatedAt.toISOString(),
    })),
    expenses: row.expenses.map((expense) => ({
      ...expense,
      amount: expense.amount.toString(),
      purchaseDate: expense.purchaseDate?.toISOString() ?? null,
      dueDate: expense.dueDate?.toISOString() ?? null,
      paidAt: expense.paidAt?.toISOString() ?? null,
      createdAt: expense.createdAt.toISOString(),
      updatedAt: expense.updatedAt.toISOString(),
      paymentMethod: expense.paymentMethod
        ? {
            ...expense.paymentMethod,
            createdAt: expense.paymentMethod.createdAt.toISOString(),
            updatedAt: expense.paymentMethod.updatedAt.toISOString(),
          }
        : null,
      paymentCard: expense.paymentCard
        ? {
            ...expense.paymentCard,
            limitAmount: expense.paymentCard.limitAmount?.toString() ?? null,
            createdAt: expense.paymentCard.createdAt.toISOString(),
            updatedAt: expense.paymentCard.updatedAt.toISOString(),
          }
        : null,
      creditCardInvoice: expense.creditCardInvoice
        ? {
            ...expense.creditCardInvoice,
            total: expense.creditCardInvoice.total.toString(),
            closingDate: expense.creditCardInvoice.closingDate?.toISOString() ?? null,
            dueDate: expense.creditCardInvoice.dueDate?.toISOString() ?? null,
            paidAt: expense.creditCardInvoice.paidAt?.toISOString() ?? null,
            createdAt: expense.creditCardInvoice.createdAt.toISOString(),
            updatedAt: expense.creditCardInvoice.updatedAt.toISOString(),
            paymentCard: {
              ...expense.creditCardInvoice.paymentCard,
              limitAmount:
                expense.creditCardInvoice.paymentCard.limitAmount?.toString() ?? null,
              createdAt: expense.creditCardInvoice.paymentCard.createdAt.toISOString(),
              updatedAt: expense.creditCardInvoice.paymentCard.updatedAt.toISOString(),
            },
          }
        : null,
      subscription: expense.subscription
        ? {
            ...expense.subscription,
            price: expense.subscription.price.toString(),
            startDate: expense.subscription.startDate.toISOString(),
            nextBillingDate: expense.subscription.nextBillingDate.toISOString(),
            createdAt: expense.subscription.createdAt.toISOString(),
            updatedAt: expense.subscription.updatedAt.toISOString(),
          }
        : null,
      installmentPurchase: expense.installmentPurchase
        ? {
            ...expense.installmentPurchase,
            totalAmount: expense.installmentPurchase.totalAmount.toString(),
            firstPurchaseDate:
              expense.installmentPurchase.firstPurchaseDate.toISOString(),
            createdAt: expense.installmentPurchase.createdAt.toISOString(),
            updatedAt: expense.installmentPurchase.updatedAt.toISOString(),
          }
        : null,
    })),
  }
}

export type SerializedMonthlyPlan = ReturnType<typeof serializeMonthlyPlan>

export function buildMonthSummary(row: MonthlyPlanWithRelations) {
  const incomeTotal = row.incomes.reduce(
    (total, income) => total.plus(income.amount),
    new Prisma.Decimal(0)
  )
  const receivedTotal = row.incomes.reduce(
    (total, income) => (income.isReceived ? total.plus(income.amount) : total),
    new Prisma.Decimal(0)
  )
  const expenseTotal = row.expenses.reduce(
    (total, expense) => total.plus(expense.amount),
    new Prisma.Decimal(0)
  )
  const paidTotal = row.expenses.reduce(
    (total, expense) => (expense.isPaid ? total.plus(expense.amount) : total),
    new Prisma.Decimal(0)
  )
  const subscriptionTotal = row.expenses.reduce(
    (total, expense) =>
      expense.subscriptionId ? total.plus(expense.amount) : total,
    new Prisma.Decimal(0)
  )
  const creditCardTotal = row.expenses.reduce(
    (total, expense) =>
      expense.expenseBucket === "CREDIT_CARD" ? total.plus(expense.amount) : total,
    new Prisma.Decimal(0)
  )

  return {
    incomeTotal: incomeTotal.toString(),
    receivedTotal: receivedTotal.toString(),
    expenseTotal: expenseTotal.toString(),
    paidTotal: paidTotal.toString(),
    subscriptionTotal: subscriptionTotal.toString(),
    creditCardTotal: creditCardTotal.toString(),
    balance: incomeTotal.minus(expenseTotal).toString(),
    pendingIncomeTotal: incomeTotal.minus(receivedTotal).toString(),
    pendingExpenseTotal: expenseTotal.minus(paidTotal).toString(),
  }
}
