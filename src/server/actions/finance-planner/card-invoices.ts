import { prisma } from "@/lib/prisma"
import { Currency, ExpenseBucket, InvoiceStatus, PlanEntrySource, Prisma } from "@prisma/client"

type PrismaClientLike = typeof prisma | Prisma.TransactionClient

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

export async function syncCreditCardInvoices(
  userId: string,
  refs: CardMonthRef[],
  client: PrismaClientLike = prisma
) {
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
    await syncCreditCardInvoice(userId, ref, client)
  }
}

async function syncCreditCardInvoice(
  userId: string,
  ref: { paymentCardId: string; year: number; month: number },
  client: PrismaClientLike
) {
  const card = await client.paymentCard.findFirst({
    where: { id: ref.paymentCardId, userId },
    select: {
      id: true,
      nickname: true,
      dueDay: true,
      paymentMethodId: true,
    },
  })
  if (!card) return

  const purchases = await client.plannedExpense.findMany({
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

  const invoice = await client.creditCardInvoice.findUnique({
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
      await client.plannedExpense.deleteMany({ where: { creditCardInvoiceId: invoice.id } })
      await client.creditCardInvoice.delete({ where: { id: invoice.id } })
    }
    return
  }

  const total = purchases.reduce(
    (sum, purchase) => sum.plus(purchase.amount),
    new Prisma.Decimal(0)
  )
  const dueDate = buildCardDueDate(ref.year, ref.month, card.dueDay)
  const currency = purchases[0]?.currency ?? Currency.BRL

  const upsertedInvoice = await client.creditCardInvoice.upsert({
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

  const plan = await client.monthlyPlan.upsert({
    where: { userId_year_month: { userId, year: ref.year, month: ref.month } },
    create: { userId, year: ref.year, month: ref.month },
    update: {},
    select: { id: true },
  })
  const name = `Fatura ${card.nickname} - ${String(ref.month).padStart(2, "0")}/${ref.year}`
  const invoiceExpense = await client.plannedExpense.findFirst({
    where: {
      creditCardInvoiceId: upsertedInvoice.id,
      monthlyPlan: { userId },
    },
    select: { id: true },
  })

  if (invoiceExpense) {
    await client.plannedExpense.update({
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

  await client.plannedExpense.create({
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
