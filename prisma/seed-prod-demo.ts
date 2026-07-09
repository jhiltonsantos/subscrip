import {
  PrismaClient,
  Currency,
  ExpenseBucket,
  InvoiceStatus,
  PaymentMethodType,
  PlanEntrySource,
} from '@prisma/client'
import { assertProdDemoSeedAllowed } from './guard-prod-demo-seed'
import { clearUserData } from './seed-shared/clear-user-data'
import { currentPlanRef, planDate } from './seed-shared/dates'
import {
  DEMO_CARDS,
  DEMO_INCOMES,
  DEMO_INSTALLMENTS,
  DEMO_INTER_TRANSACTIONS,
  DEMO_MONTHLY_BILLS,
  DEMO_NUBANK_TRANSACTIONS,
  DEMO_PIX_METHOD,
  DEMO_SUBSCRIPTIONS,
  DEMO_USER,
} from './seed-shared/demo-generic-data'
import { upsertServiceTemplates } from './seed-shared/upsert-service-templates'

const prisma = new PrismaClient()

type PaymentMethodRef = {
  id: string
  cardId: string | null
}

type PaymentMethodMap = {
  nubank: PaymentMethodRef
  inter: PaymentMethodRef
  pix: PaymentMethodRef
}

function resolveInvoiceStatus(closingDay: number, planDay: number): InvoiceStatus {
  return planDay >= closingDay ? InvoiceStatus.CLOSED : InvoiceStatus.OPEN
}

function sumAmounts(items: { amount: number }[]): number {
  return items.reduce((total, item) => total + item.amount, 0)
}

async function main() {
  const demoEmail = assertProdDemoSeedAllowed()
  const { year, month } = currentPlanRef()
  const d = (day: number) => planDate(year, month, day)

  console.log('🌱 Starting production demo seed...')
  console.log(`📅 Monthly plan target: ${year}-${String(month).padStart(2, '0')}`)

  const templateIds = await upsertServiceTemplates(prisma)
  console.log(`📦 Upserted ${templateIds.size} service templates`)

  const user = await prisma.user.upsert({
    where: { email: demoEmail },
    create: DEMO_USER,
    update: {
      name: DEMO_USER.name,
      emailVerified: DEMO_USER.emailVerified,
      preferredCurrency: DEMO_USER.preferredCurrency,
      language: DEMO_USER.language,
    },
  })

  await clearUserData(prisma, user.id)
  console.log(`🧹 Cleared existing data for demo user: ${user.email}`)

  const paymentMethods: PaymentMethodMap = {} as PaymentMethodMap

  for (const card of DEMO_CARDS) {
    const method = await prisma.paymentMethod.create({
      data: {
        userId: user.id,
        name: card.methodName,
        type: PaymentMethodType.CREDIT_CARD,
        paymentCard: {
          create: {
            userId: user.id,
            nickname: card.nickname,
            brand: card.brand,
            last4: card.last4,
            closingDay: card.closingDay,
            dueDay: card.dueDay,
            limitAmount: card.limitAmount,
          },
        },
      },
      include: { paymentCard: true },
    })

    paymentMethods[card.key] = {
      id: method.id,
      cardId: method.paymentCard?.id ?? null,
    }
  }

  const pix = await prisma.paymentMethod.create({
    data: {
      userId: user.id,
      name: DEMO_PIX_METHOD.name,
      type: DEMO_PIX_METHOD.type,
    },
  })
  paymentMethods.pix = { id: pix.id, cardId: null }

  console.log('💳 Created payment methods and cards')

  const subscriptionIds = new Map<string, string>()

  for (const sub of DEMO_SUBSCRIPTIONS) {
    const method = paymentMethods[sub.paymentMethodKey]
    const created = await prisma.subscription.create({
      data: {
        name: sub.name,
        price: sub.price,
        currency: sub.currency,
        billingCycle: sub.billingCycle,
        category: sub.category,
        hiredAt: new Date(sub.hiredAt),
        billingDay: sub.billingDay,
        nextBillingDate: sub.nextBillingDate ? new Date(sub.nextBillingDate) : undefined,
        active: sub.active,
        userId: user.id,
        serviceTemplateId: sub.templateSlug ? templateIds.get(sub.templateSlug) : undefined,
        paymentMethodId: method.id,
      },
    })
    subscriptionIds.set(sub.key, created.id)
  }

  console.log(`📝 Created ${DEMO_SUBSCRIPTIONS.length} subscriptions`)

  const plan = await prisma.monthlyPlan.create({
    data: {
      userId: user.id,
      year,
      month,
      notes: `Planejamento de ${String(month).padStart(2, '0')}/${year}`,
    },
  })

  console.log(`🗓️  Created monthly plan ${year}-${month}`)

  for (const [index, income] of DEMO_INCOMES.entries()) {
    await prisma.plannedIncome.create({
      data: {
        monthlyPlanId: plan.id,
        name: income.name,
        amount: income.amount,
        currency: Currency.BRL,
        expectedDate: d(income.day),
        sortOrder: index,
      },
    })
  }

  console.log(`💰 Created ${DEMO_INCOMES.length} planned incomes`)

  for (const [index, bill] of DEMO_MONTHLY_BILLS.entries()) {
    const method = paymentMethods[bill.paymentMethodKey]
    await prisma.plannedExpense.create({
      data: {
        monthlyPlanId: plan.id,
        name: bill.name,
        amount: bill.amount,
        currency: Currency.BRL,
        expenseBucket: bill.bucket,
        paymentMethodId: method.id,
        paymentCardId: method.cardId ?? undefined,
        dueDate: d(bill.day),
        sortOrder: index,
      },
    })
  }

  console.log(`📄 Created ${DEMO_MONTHLY_BILLS.length} monthly bills`)

  const activeSubscriptions = DEMO_SUBSCRIPTIONS.filter((sub) => sub.active)

  for (const [index, sub] of activeSubscriptions.entries()) {
    const method = paymentMethods[sub.paymentMethodKey]
    const subscriptionId = subscriptionIds.get(sub.key)

    if (!subscriptionId) continue

    await prisma.plannedExpense.create({
      data: {
        monthlyPlanId: plan.id,
        name: sub.name,
        amount: sub.price,
        currency: sub.currency,
        expenseBucket: ExpenseBucket.FIXED_CARD,
        paymentMethodId: method.id,
        paymentCardId: method.cardId ?? undefined,
        subscriptionId,
        source: PlanEntrySource.SUBSCRIPTION,
        isAutoGenerated: true,
        dueDate: d(sub.billingDay ?? 10),
        sortOrder: index,
      },
    })
  }

  console.log(`🔁 Created ${activeSubscriptions.length} subscription-linked expenses`)

  const nubankCard = DEMO_CARDS.find((card) => card.key === 'nubank')!
  const interCard = DEMO_CARDS.find((card) => card.key === 'inter')!

  const nubankInvoiceTotal =
    DEMO_MONTHLY_BILLS.find((bill) => bill.paymentMethodKey === 'nubank')?.amount ??
    sumAmounts(DEMO_NUBANK_TRANSACTIONS)

  const interInvoiceTotal =
    DEMO_MONTHLY_BILLS.find((bill) => bill.paymentMethodKey === 'inter')?.amount ??
    sumAmounts(DEMO_INTER_TRANSACTIONS) +
      sumAmounts(DEMO_INSTALLMENTS.map((item) => ({ amount: item.monthAmount })))

  const today = new Date().getDate()

  const nubankInvoice = await prisma.creditCardInvoice.create({
    data: {
      userId: user.id,
      paymentCardId: paymentMethods.nubank.cardId!,
      year,
      month,
      closingDate: d(nubankCard.closingDay),
      dueDate: d(nubankCard.dueDay),
      total: nubankInvoiceTotal,
      currency: Currency.BRL,
      status: resolveInvoiceStatus(nubankCard.closingDay, today),
    },
  })

  const interInvoice = await prisma.creditCardInvoice.create({
    data: {
      userId: user.id,
      paymentCardId: paymentMethods.inter.cardId!,
      year,
      month,
      closingDate: d(interCard.closingDay),
      dueDate: d(interCard.dueDay),
      total: interInvoiceTotal,
      currency: Currency.BRL,
      status: resolveInvoiceStatus(interCard.closingDay, today),
    },
  })

  console.log('🧾 Created credit card invoices')

  for (const tx of DEMO_NUBANK_TRANSACTIONS) {
    await prisma.plannedExpense.create({
      data: {
        monthlyPlanId: plan.id,
        name: tx.name,
        amount: tx.amount,
        currency: Currency.BRL,
        expenseBucket: ExpenseBucket.CREDIT_CARD,
        paymentMethodId: paymentMethods.nubank.id,
        paymentCardId: paymentMethods.nubank.cardId!,
        creditCardInvoiceId: nubankInvoice.id,
        source: PlanEntrySource.CREDIT_CARD_INVOICE,
        purchaseDate: d(tx.day),
      },
    })
  }

  for (const tx of DEMO_INTER_TRANSACTIONS) {
    await prisma.plannedExpense.create({
      data: {
        monthlyPlanId: plan.id,
        name: tx.name,
        amount: tx.amount,
        currency: Currency.BRL,
        expenseBucket: ExpenseBucket.CREDIT_CARD,
        paymentMethodId: paymentMethods.inter.id,
        paymentCardId: paymentMethods.inter.cardId!,
        creditCardInvoiceId: interInvoice.id,
        source: PlanEntrySource.CREDIT_CARD_INVOICE,
        purchaseDate: d(tx.day),
      },
    })
  }

  for (const purchase of DEMO_INSTALLMENTS) {
    const installment = await prisma.installmentPurchase.create({
      data: {
        userId: user.id,
        paymentCardId: paymentMethods.inter.cardId!,
        name: purchase.name,
        totalAmount: purchase.totalAmount,
        currency: Currency.BRL,
        installmentCount: purchase.installmentCount,
        firstPurchaseDate: new Date(purchase.firstPurchaseDate),
      },
    })

    await prisma.plannedExpense.create({
      data: {
        monthlyPlanId: plan.id,
        name: purchase.name,
        amount: purchase.monthAmount,
        currency: Currency.BRL,
        expenseBucket: ExpenseBucket.CREDIT_CARD,
        paymentMethodId: paymentMethods.inter.id,
        paymentCardId: paymentMethods.inter.cardId!,
        creditCardInvoiceId: interInvoice.id,
        installmentPurchaseId: installment.id,
        installmentNumber: purchase.currentInstallment,
        installmentTotal: purchase.installmentCount,
        source: PlanEntrySource.INSTALLMENT,
        purchaseDate: d(purchase.purchaseDay),
      },
    })
  }

  const cardTransactionCount =
    DEMO_NUBANK_TRANSACTIONS.length +
    DEMO_INTER_TRANSACTIONS.length +
    DEMO_INSTALLMENTS.length

  console.log(`💳 Created ${cardTransactionCount} card transactions and installments`)
  console.log('')
  console.log('✅ Production demo seed completed!')
  console.log('')
  console.log('Summary:')
  console.log(`   User: ${user.email}`)
  console.log(`   Subscriptions: ${DEMO_SUBSCRIPTIONS.length} (${activeSubscriptions.length} active)`)
  console.log(`   Payment methods: ${DEMO_CARDS.length + 1}`)
  console.log(`   Incomes: ${DEMO_INCOMES.length}`)
  console.log(`   Monthly bills: ${DEMO_MONTHLY_BILLS.length}`)
  console.log(`   Card transactions: ${cardTransactionCount}`)
  console.log('')
  console.log('Login via OTP in production using the seeded email address.')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
