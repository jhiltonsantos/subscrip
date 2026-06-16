import { prisma } from "@/lib/prisma"
import { Currency, ExpenseBucket, InvoiceStatus, PlanEntrySource, Prisma } from "@prisma/client"
import { getOrCreateMonthlyPlan } from "./shared"

export type CardMonthRef = {
  paymentCardId: string | null | undefined
  year: number
  month: number
}

export function buildCardDueDate(year: number, month: number, dueDay: number | null | undefined) {
  const day = dueDay ?? 1
  const lastDayOfMonth = new Date(year, month, 0).getDate()
  return new Date(year, month - 1, Math.min(day, lastDayOfMonth))
}

export async function syncCreditCardInvoices(userId: string, refs: CardMonthRef[]) {
  const uniqueRefs = Array.from(
    new Map(
      refs
        .filter((ref): ref is { paymentCardId: string; year: number; month: number } =>
          Boolean(ref.paymentCardId)
        )
        .map((ref) => [`${ref.paymentCardId}:${ref.year}:${ref.month}`, ref])
    ).values()
  )

  for (const ref of uniqueRefs) {
    await syncCreditCardInvoice(userId, ref)
  }
}

async function syncCreditCardInvoice(
  userId: string,
  ref: { paymentCardId: string; year: number; month: number }
) {
  const card = await prisma.paymentCard.findFirst({
    where: { id: ref.paymentCardId, userId },
    select: {
      id: true,
      nickname: true,
      dueDay: true,
      paymentMethodId: true,
    },
  })
  if (!card) return

  const purchases = await prisma.plannedExpense.findMany({
    where: {
      paymentCardId: ref.paymentCardId,
      expenseBucket: ExpenseBucket.CREDIT_CARD,
      monthlyPlan: {
        userId,
        year: ref.year,
        month: ref.month,
      },
    },
    select: {
      amount: true,
      currency: true,
    },
  })

  const invoice = await prisma.creditCardInvoice.findUnique({
    where: {
      paymentCardId_year_month: {
        paymentCardId: ref.paymentCardId,
        year: ref.year,
        month: ref.month,
      },
    },
    select: { id: true },
  })

  if (purchases.length === 0) {
    if (invoice) {
      await prisma.plannedExpense.deleteMany({ where: { creditCardInvoiceId: invoice.id } })
      await prisma.creditCardInvoice.delete({ where: { id: invoice.id } })
    }
    return
  }

  const total = purchases.reduce(
    (sum, purchase) => sum.plus(purchase.amount),
    new Prisma.Decimal(0)
  )
  const dueDate = buildCardDueDate(ref.year, ref.month, card.dueDay)
  const currency = purchases[0]?.currency ?? Currency.BRL

  const upsertedInvoice = await prisma.creditCardInvoice.upsert({
    where: {
      paymentCardId_year_month: {
        paymentCardId: ref.paymentCardId,
        year: ref.year,
        month: ref.month,
      },
    },
    create: {
      userId,
      paymentCardId: ref.paymentCardId,
      year: ref.year,
      month: ref.month,
      total,
      currency,
      dueDate,
      status: InvoiceStatus.OPEN,
    },
    update: {
      total,
      currency,
      dueDate,
    },
    select: { id: true },
  })

  const plan = await getOrCreateMonthlyPlan(userId, ref.year, ref.month)
  const name = `Fatura ${card.nickname} - ${String(ref.month).padStart(2, "0")}/${ref.year}`
  const invoiceExpense = await prisma.plannedExpense.findFirst({
    where: {
      creditCardInvoiceId: upsertedInvoice.id,
      monthlyPlan: { userId },
    },
    select: { id: true },
  })

  if (invoiceExpense) {
    await prisma.plannedExpense.update({
      where: { id: invoiceExpense.id },
      data: {
        name,
        amount: total,
        currency,
        expenseBucket: ExpenseBucket.FIXED_CARD,
        dueDate,
        paymentMethod: { connect: { id: card.paymentMethodId } },
        paymentCard: { connect: { id: card.id } },
        creditCardInvoice: { connect: { id: upsertedInvoice.id } },
        source: PlanEntrySource.CREDIT_CARD_INVOICE,
      },
    })
    return
  }

  await prisma.plannedExpense.create({
    data: {
      monthlyPlanId: plan.id,
      name,
      amount: total,
      currency,
      expenseBucket: ExpenseBucket.FIXED_CARD,
      dueDate,
      isPaid: false,
      source: PlanEntrySource.CREDIT_CARD_INVOICE,
      paymentMethodId: card.paymentMethodId,
      paymentCardId: card.id,
      creditCardInvoiceId: upsertedInvoice.id,
    },
  })
}
