import type { PrismaClient } from '@prisma/client'

type PrismaClientLike = Pick<
  PrismaClient,
  | 'reminder'
  | 'plannedExpense'
  | 'plannedIncome'
  | 'creditCardInvoice'
  | 'installmentPurchase'
  | 'monthlyPlan'
  | 'subscription'
  | 'paymentCard'
  | 'paymentMethod'
  | 'session'
  | 'account'
>

export async function clearUserData(prisma: PrismaClientLike, userId: string): Promise<void> {
  await prisma.reminder.deleteMany({ where: { userId } })
  await prisma.plannedExpense.deleteMany({
    where: { monthlyPlan: { userId } },
  })
  await prisma.plannedIncome.deleteMany({
    where: { monthlyPlan: { userId } },
  })
  await prisma.creditCardInvoice.deleteMany({ where: { userId } })
  await prisma.installmentPurchase.deleteMany({ where: { userId } })
  await prisma.monthlyPlan.deleteMany({ where: { userId } })
  await prisma.subscription.deleteMany({ where: { userId } })
  await prisma.paymentCard.deleteMany({ where: { userId } })
  await prisma.paymentMethod.deleteMany({ where: { userId } })
  await prisma.session.deleteMany({ where: { userId } })
  await prisma.account.deleteMany({ where: { userId } })
}
