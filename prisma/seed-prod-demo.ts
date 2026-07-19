import { PrismaClient, PaymentMethodType } from '@prisma/client'
import { assertProdDemoSeedAllowed } from './guard-prod-demo-seed'
import { clearUserData } from './seed-shared/clear-user-data'
import { currentPlanRef, getLastNMonths } from './seed-shared/dates'
import {
  DEMO_CARDS,
  DEMO_PIX_METHOD,
  DEMO_SUBSCRIPTIONS,
  DEMO_USER,
} from './seed-shared/demo-generic-data'
import {
  seedDemoMonthPlan,
  type PaymentMethodMap,
} from './seed-shared/seed-demo-month-plan'
import { upsertServiceTemplates } from './seed-shared/upsert-service-templates'

const prisma = new PrismaClient()

const DEMO_MONTH_COUNT = 12

async function main() {
  const demoEmail = assertProdDemoSeedAllowed()
  const { year, month } = currentPlanRef()
  const months = getLastNMonths(year, month, DEMO_MONTH_COUNT)

  console.log('🌱 Starting production demo seed...')
  console.log(
    `📅 Monthly plans: ${months[0].year}-${String(months[0].month).padStart(2, '0')} → ${year}-${String(month).padStart(2, '0')} (${DEMO_MONTH_COUNT} months)`
  )

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

  const activeSubscriptions = DEMO_SUBSCRIPTIONS.filter((sub) => sub.active)
  console.log(`📝 Created ${DEMO_SUBSCRIPTIONS.length} subscriptions`)

  const installmentPurchaseIds = new Map<string, string>()
  let totalIncomes = 0
  let totalBills = 0
  let totalSubscriptionExpenses = 0
  let totalCardTransactions = 0
  let totalInstallmentExpenses = 0

  for (const [monthIndex, monthRef] of months.entries()) {
    const isCurrentMonth = monthIndex === months.length - 1
    const result = await seedDemoMonthPlan({
      prisma,
      userId: user.id,
      monthRef,
      monthIndex,
      isCurrentMonth,
      paymentMethods,
      subscriptionIds,
      installmentPurchaseIds,
    })

    totalIncomes += result.incomeCount
    totalBills += result.billCount
    totalSubscriptionExpenses += result.subscriptionExpenseCount
    totalCardTransactions += result.cardTransactionCount
    totalInstallmentExpenses += result.installmentExpenseCount

    console.log(
      `🗓️  Seeded ${monthRef.year}-${String(monthRef.month).padStart(2, '0')}`
    )
  }

  const cardTransactionCount = totalCardTransactions + totalInstallmentExpenses

  console.log('')
  console.log('✅ Production demo seed completed!')
  console.log('')
  console.log('Summary:')
  console.log(`   User: ${user.email}`)
  console.log(`   Monthly plans: ${DEMO_MONTH_COUNT}`)
  console.log(`   Subscriptions: ${DEMO_SUBSCRIPTIONS.length} (${activeSubscriptions.length} active)`)
  console.log(`   Payment methods: ${DEMO_CARDS.length + 1}`)
  console.log(`   Incomes (total rows): ${totalIncomes}`)
  console.log(`   Monthly bills (total rows): ${totalBills}`)
  console.log(`   Subscription expenses (total rows): ${totalSubscriptionExpenses}`)
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
