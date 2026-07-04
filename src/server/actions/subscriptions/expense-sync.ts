import { prisma } from "@/lib/prisma"
import type { PlannedExpenseUpdateInput } from "@/lib/validations/finance-planner"
import {
  resolveChargeForInvoiceMonth,
  resolveInvoiceMonth,
  resolveNextChargeDate,
} from "@/lib/subscription-billing"
import {
  BillingCycle,
  ExpenseBucket,
  PaymentMethodType,
  PlanEntrySource,
  Prisma,
  type Subscription,
} from "@prisma/client"
import { revalidatePath } from "next/cache"
import {
  syncCreditCardInvoices,
  type CardMonthRef,
} from "@/server/actions/finance-planner/card-invoices"

type SubscriptionExpenseSyncInput = Pick<
  Subscription,
  | "id"
  | "userId"
  | "name"
  | "planLabel"
  | "price"
  | "currency"
  | "billingCycle"
  | "billingDay"
  | "hiredAt"
  | "nextBillingDate"
  | "active"
  | "paymentMethodId"
>

type PrismaClientLike = typeof prisma | Prisma.TransactionClient

type SubscriptionExpenseResult = {
  id: string
  paymentCardId: string | null
  year: number
  month: number
}

function monthFromDate(date: Date) {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
  }
}

function monthIndex(year: number, month: number) {
  return year * 12 + month
}

function currentMonthRef(date = new Date()) {
  return monthFromDate(date)
}

function futurePlanWhere(userId: string, from = new Date()) {
  const current = currentMonthRef(from)

  return {
    userId,
    OR: [
      { year: { gt: current.year } },
      {
        year: current.year,
        month: { gte: current.month },
      },
    ],
  } satisfies Prisma.MonthlyPlanWhereInput
}

async function getOrCreatePlan(
  client: PrismaClientLike,
  userId: string,
  year: number,
  month: number
) {
  return client.monthlyPlan.upsert({
    where: { userId_year_month: { userId, year, month } },
    create: { userId, year, month },
    update: {},
    select: { id: true },
  })
}

function buildExpenseDescription(subscription: SubscriptionExpenseSyncInput) {
  return subscription.planLabel?.trim() || null
}

function earliestMonthStart(
  plan: { year: number; month: number },
  date: Date | null | undefined
) {
  if (!date) return new Date(plan.year, plan.month - 1, 1)

  const dateMonth = monthFromDate(date)
  const earliest =
    monthIndex(dateMonth.year, dateMonth.month) < monthIndex(plan.year, plan.month)
      ? dateMonth
      : plan

  return new Date(earliest.year, earliest.month - 1, 1)
}

function toCardMonthRef(result: {
  paymentCardId: string | null
  year: number
  month: number
}): CardMonthRef | null {
  if (!result.paymentCardId) return null
  return {
    paymentCardId: result.paymentCardId,
    year: result.year,
    month: result.month,
  }
}

async function resolveSubscriptionPaymentTarget(
  subscription: SubscriptionExpenseSyncInput,
  client: PrismaClientLike
): Promise<{
  expenseBucket: ExpenseBucket
  paymentCardId: string | null
  closingDay: number | null
}> {
  if (!subscription.paymentMethodId) {
    return {
      expenseBucket: ExpenseBucket.MONTHLY_BILLS,
      paymentCardId: null,
      closingDay: null,
    }
  }

  const method = await client.paymentMethod.findFirst({
    where: {
      id: subscription.paymentMethodId,
      userId: subscription.userId,
    },
    select: {
      type: true,
      paymentCard: { select: { id: true, closingDay: true } },
    },
  })

  if (method?.type === PaymentMethodType.CREDIT_CARD && method.paymentCard) {
    return {
      expenseBucket: ExpenseBucket.CREDIT_CARD,
      paymentCardId: method.paymentCard.id,
      closingDay: method.paymentCard.closingDay,
    }
  }

  return {
    expenseBucket: ExpenseBucket.MONTHLY_BILLS,
    paymentCardId: null,
    closingDay: null,
  }
}

async function collectSubscriptionCardRefs(
  userId: string,
  subscriptionId: string,
  client: PrismaClientLike,
  from?: Date
): Promise<CardMonthRef[]> {
  const rows = await client.plannedExpense.findMany({
    where: {
      subscriptionId,
      paymentCardId: { not: null },
      expenseBucket: ExpenseBucket.CREDIT_CARD,
      ...(from
        ? { monthlyPlan: futurePlanWhere(userId, from) }
        : { monthlyPlan: { userId } }),
    },
    select: {
      paymentCardId: true,
      monthlyPlan: { select: { year: true, month: true } },
    },
  })

  return rows
    .filter((row): row is typeof row & { paymentCardId: string } => Boolean(row.paymentCardId))
    .map((row) => ({
      paymentCardId: row.paymentCardId,
      year: row.monthlyPlan.year,
      month: row.monthlyPlan.month,
    }))
}

export async function upsertSubscriptionExpense(
  userId: string,
  subscription: SubscriptionExpenseSyncInput,
  client: PrismaClientLike = prisma
) {
  const now = new Date()
  const previousRefs = await collectSubscriptionCardRefs(userId, subscription.id, client)
  const result = await upsertSubscriptionExpenseForMonth(
    userId,
    subscription,
    now.getFullYear(),
    now.getMonth() + 1,
    client
  )

  const refs = [
    ...previousRefs,
    ...(result ? [toCardMonthRef(result)].filter(Boolean) : []),
  ] as CardMonthRef[]

  await syncCreditCardInvoices(userId, refs, client)
  return result
}

export async function upsertSubscriptionExpenseForMonth(
  userId: string,
  subscription: SubscriptionExpenseSyncInput,
  year: number,
  month: number,
  client: PrismaClientLike = prisma
): Promise<SubscriptionExpenseResult | null> {
  if (!subscription.active) return null

  const paymentTarget = await resolveSubscriptionPaymentTarget(subscription, client)
  const dueDate = resolveChargeForInvoiceMonth(
    subscription,
    year,
    month,
    paymentTarget.closingDay
  )

  if (!dueDate) {
    // Remove stale auto-generated expense for this invoice month if billing no longer applies
    const plan = await client.monthlyPlan.findUnique({
      where: { userId_year_month: { userId, year, month } },
      select: { id: true },
    })
    if (plan) {
      const existing = await client.plannedExpense.findFirst({
        where: {
          subscriptionId: subscription.id,
          monthlyPlanId: plan.id,
          isAutoGenerated: true,
        },
        select: { id: true, paymentCardId: true },
      })
      if (existing) {
        await client.plannedExpense.delete({ where: { id: existing.id } })
        return {
          id: existing.id,
          paymentCardId: existing.paymentCardId,
          year,
          month,
        }
      }
    }
    return null
  }

  const plan = await getOrCreatePlan(client, userId, year, month)
  const existing = await client.plannedExpense.findFirst({
    where: {
      subscriptionId: subscription.id,
      monthlyPlanId: plan.id,
    },
    select: { id: true, paymentCardId: true },
  })

  const data = {
    monthlyPlanId: plan.id,
    name: subscription.name,
    description: buildExpenseDescription(subscription),
    amount: subscription.price,
    currency: subscription.currency,
    expenseBucket: paymentTarget.expenseBucket,
    dueDate,
    source: PlanEntrySource.SUBSCRIPTION,
    isAutoGenerated: true,
    isLocked: true,
    paymentMethodId: subscription.paymentMethodId,
    paymentCardId: paymentTarget.paymentCardId,
    creditCardInvoiceId: null,
    installmentPurchaseId: null,
    installmentNumber: null,
    installmentTotal: null,
    recurrenceKind: null,
    recurrenceGroupId: null,
  } satisfies Prisma.PlannedExpenseUncheckedUpdateInput

  const row = existing
    ? await client.plannedExpense.update({
        where: { id: existing.id },
        data,
        select: { id: true, paymentCardId: true },
      })
    : await client.plannedExpense.create({
        data: {
          ...data,
          subscriptionId: subscription.id,
        },
        select: { id: true, paymentCardId: true },
      })

  return {
    id: row.id,
    paymentCardId: row.paymentCardId,
    year,
    month,
  }
}

export async function ensureMonthlySubscriptionExpenses(
  userId: string,
  year: number,
  month: number,
  client: PrismaClientLike = prisma
) {
  const subscriptions = await client.subscription.findMany({
    where: {
      userId,
      active: true,
      billingCycle: {
        in: [BillingCycle.MONTHLY, BillingCycle.WEEKLY, BillingCycle.YEARLY],
      },
    },
  })

  const subscriptionIds = subscriptions.map((subscription) => subscription.id)
  const previousRows =
    subscriptionIds.length === 0
      ? []
      : await client.plannedExpense.findMany({
          where: {
            subscriptionId: { in: subscriptionIds },
            paymentCardId: { not: null },
            expenseBucket: ExpenseBucket.CREDIT_CARD,
            monthlyPlan: { userId, year, month },
          },
          select: {
            paymentCardId: true,
            monthlyPlan: { select: { year: true, month: true } },
          },
        })

  const results = await Promise.all(
    subscriptions.map((subscription) =>
      upsertSubscriptionExpenseForMonth(userId, subscription, year, month, client)
    )
  )

  const refs: CardMonthRef[] = [
    ...previousRows
      .filter((row): row is typeof row & { paymentCardId: string } =>
        Boolean(row.paymentCardId)
      )
      .map((row) => ({
        paymentCardId: row.paymentCardId,
        year: row.monthlyPlan.year,
        month: row.monthlyPlan.month,
      })),
    ...results
      .map((result) => (result ? toCardMonthRef(result) : null))
      .filter((ref): ref is CardMonthRef => Boolean(ref)),
  ]

  await syncCreditCardInvoices(userId, refs, client)
}

export async function syncCurrentAndFutureSubscriptionExpenses(
  userId: string,
  subscription: SubscriptionExpenseSyncInput,
  client: PrismaClientLike = prisma,
  from = new Date()
) {
  const previousRefs = await collectSubscriptionCardRefs(
    userId,
    subscription.id,
    client,
    from
  )

  const supportedCycles: BillingCycle[] = [
    BillingCycle.MONTHLY,
    BillingCycle.WEEKLY,
    BillingCycle.YEARLY,
  ]

  if (!subscription.active || !supportedCycles.includes(subscription.billingCycle)) {
    await deleteCurrentAndFutureSubscriptionExpenses(userId, subscription.id, client, from)
    await syncCreditCardInvoices(userId, previousRefs, client)
    return
  }

  const results: SubscriptionExpenseResult[] = []
  const current = currentMonthRef(from)
  const primary = await upsertSubscriptionExpenseForMonth(
    userId,
    subscription,
    current.year,
    current.month,
    client
  )
  if (primary) results.push(primary)

  // Also ensure the invoice month for the next charge (may differ when closingDay shifts month)
  const nextCharge = resolveNextChargeDate(subscription, from)
  if (nextCharge) {
    const paymentTarget = await resolveSubscriptionPaymentTarget(subscription, client)
    const chargeForCurrent = resolveChargeForInvoiceMonth(
      subscription,
      current.year,
      current.month,
      paymentTarget.closingDay
    )
    // If next charge maps to a different invoice month, upsert that month too
    const invoiceMonth = resolveInvoiceMonth(nextCharge, paymentTarget.closingDay)
    if (
      !chargeForCurrent ||
      invoiceMonth.year !== current.year ||
      invoiceMonth.month !== current.month
    ) {
      const extra = await upsertSubscriptionExpenseForMonth(
        userId,
        subscription,
        invoiceMonth.year,
        invoiceMonth.month,
        client
      )
      if (extra) results.push(extra)
    }
  }

  const rows = await client.plannedExpense.findMany({
    where: {
      subscriptionId: subscription.id,
      monthlyPlan: futurePlanWhere(userId, from),
    },
    select: {
      id: true,
      paymentCardId: true,
      monthlyPlan: { select: { year: true, month: true } },
    },
  })

  await Promise.all(
    rows.map(async (row) => {
      const { year, month } = row.monthlyPlan
      const paymentTarget = await resolveSubscriptionPaymentTarget(subscription, client)
      const dueDate = resolveChargeForInvoiceMonth(
        subscription,
        year,
        month,
        paymentTarget.closingDay
      )

      if (!dueDate) {
        await client.plannedExpense.delete({ where: { id: row.id } })
        return
      }

      const result = await upsertSubscriptionExpenseForMonth(
        userId,
        subscription,
        year,
        month,
        client
      )
      if (result) results.push(result)
    })
  )

  const refs: CardMonthRef[] = [
    ...previousRefs,
    ...results
      .map((result) => toCardMonthRef(result))
      .filter((ref): ref is CardMonthRef => Boolean(ref)),
  ]

  await syncCreditCardInvoices(userId, refs, client)
}

export async function deleteCurrentAndFutureSubscriptionExpenses(
  userId: string,
  subscriptionId: string,
  client: PrismaClientLike = prisma,
  from = new Date()
) {
  const previousRefs = await collectSubscriptionCardRefs(
    userId,
    subscriptionId,
    client,
    from
  )

  const result = await client.plannedExpense.deleteMany({
    where: {
      subscriptionId,
      monthlyPlan: futurePlanWhere(userId, from),
    },
  })

  await syncCreditCardInvoices(userId, previousRefs, client)
  return result
}

export async function syncSubscriptionFromExpense(
  userId: string,
  expenseId: string,
  data: PlannedExpenseUpdateInput,
  client: PrismaClientLike = prisma
) {
  const expense = await client.plannedExpense.findFirst({
    where: {
      id: expenseId,
      monthlyPlan: { userId },
      subscriptionId: { not: null },
    },
    include: {
      subscription: true,
      monthlyPlan: true,
    },
  })

  if (!expense?.subscription) return null

  const updateData: Prisma.SubscriptionUpdateInput = {}
  const dueDate =
    data.dueDate !== undefined && data.dueDate !== null ? data.dueDate : undefined

  if (data.name !== undefined) updateData.name = data.name
  if (data.description !== undefined) {
    updateData.planLabel = data.description?.trim() || null
  }
  if (data.amount !== undefined) updateData.price = new Prisma.Decimal(data.amount)
  if (data.currency !== undefined) updateData.currency = data.currency

  if (dueDate) {
    if (
      expense.subscription.billingCycle === BillingCycle.MONTHLY ||
      expense.subscription.billingCycle === BillingCycle.WEEKLY
    ) {
      updateData.billingDay = dueDate.getDate()
    } else if (expense.subscription.billingCycle === BillingCycle.YEARLY) {
      updateData.nextBillingDate = dueDate
    }
  }

  if (data.paymentMethodId !== undefined) {
    updateData.paymentMethod = data.paymentMethodId
      ? { connect: { id: data.paymentMethodId } }
      : { disconnect: true }
  }

  if (Object.keys(updateData).length === 0) return expense.subscription

  const subscription = await client.subscription.update({
    where: { id: expense.subscription.id },
    data: updateData,
  })

  await syncCurrentAndFutureSubscriptionExpenses(
    userId,
    subscription,
    client,
    earliestMonthStart(expense.monthlyPlan, dueDate ?? expense.dueDate)
  )

  return subscription
}

export async function deleteSubscriptionFromExpense(
  userId: string,
  expenseId: string,
  client: PrismaClientLike = prisma
) {
  const expense = await client.plannedExpense.findFirst({
    where: {
      id: expenseId,
      monthlyPlan: { userId },
      subscriptionId: { not: null },
    },
    select: {
      subscriptionId: true,
      paymentCardId: true,
      expenseBucket: true,
      monthlyPlan: { select: { year: true, month: true } },
    },
  })

  if (!expense?.subscriptionId) return null

  await deleteCurrentAndFutureSubscriptionExpenses(userId, expense.subscriptionId, client)
  await client.subscription.delete({
    where: { id: expense.subscriptionId },
  })

  return { subscriptionId: expense.subscriptionId }
}

export function revalidateSubscriptionExpenseSyncPaths() {
  revalidatePath("/dashboard")
  revalidatePath("/subscriptions")
  revalidatePath("/finance-planner")
  revalidatePath("/card-invoice")
}
