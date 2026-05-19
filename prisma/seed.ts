import {
  PrismaClient,
  Category,
  BillingCycle,
  Currency,
  PaymentMethodType,
  ExpenseBucket,
  PlanEntrySource,
  InvoiceStatus,
} from '@prisma/client'

const prisma = new PrismaClient()

const PLAN_YEAR = 2026
const PLAN_MONTH = 4

function d(day: number): Date {
  return new Date(Date.UTC(PLAN_YEAR, PLAN_MONTH - 1, day, 12, 0, 0))
}

async function main() {
  console.log('🌱 Starting seed...')

  // Clean up existing data (respect FK order)
  await prisma.reminder.deleteMany()
  await prisma.plannedExpense.deleteMany()
  await prisma.plannedIncome.deleteMany()
  await prisma.creditCardInvoice.deleteMany()
  await prisma.installmentPurchase.deleteMany()
  await prisma.monthlyPlan.deleteMany()
  await prisma.subscription.deleteMany()
  await prisma.paymentCard.deleteMany()
  await prisma.paymentMethod.deleteMany()
  await prisma.serviceTemplate.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()

  console.log('🧹 Cleaned existing data')

  const testUser = await prisma.user.create({
    data: {
      name: 'Test User',
      email: 'test@subscrip.dev',
      emailVerified: true,
    },
  })
  console.log(`👤 Created test user: ${testUser.email}`)

  const serviceTemplates = [
    { name: 'Netflix', slug: 'netflix', category: Category.ENTERTAINMENT, defaultCurrency: Currency.BRL, pricingUrl: 'https://netflix.com/signup/planform', cancelUrl: 'https://netflix.com/cancelplan' },
    { name: 'Spotify', slug: 'spotify', category: Category.ENTERTAINMENT, defaultCurrency: Currency.BRL, pricingUrl: 'https://spotify.com/premium', cancelUrl: 'https://spotify.com/account' },
    { name: 'Amazon Prime', slug: 'amazon-prime', category: Category.ENTERTAINMENT, defaultCurrency: Currency.BRL, pricingUrl: 'https://amazon.com.br/prime', cancelUrl: 'https://amazon.com.br/prime/cancel' },
    { name: 'Disney+', slug: 'disney-plus', category: Category.ENTERTAINMENT, defaultCurrency: Currency.BRL, pricingUrl: 'https://disneyplus.com/sign-up', cancelUrl: 'https://disneyplus.com/account' },
    { name: 'HBO Max', slug: 'hbo-max', category: Category.ENTERTAINMENT, defaultCurrency: Currency.BRL, pricingUrl: 'https://max.com/plans', cancelUrl: 'https://max.com/account' },
    { name: 'YouTube Premium', slug: 'youtube-premium', category: Category.ENTERTAINMENT, defaultCurrency: Currency.BRL, pricingUrl: 'https://youtube.com/premium', cancelUrl: 'https://youtube.com/paid_memberships' },
    { name: 'Apple TV+', slug: 'apple-tv-plus', category: Category.ENTERTAINMENT, defaultCurrency: Currency.USD, pricingUrl: 'https://apple.com/br/apple-tv-plus', cancelUrl: 'https://support.apple.com/subscriptions' },
    { name: 'Crunchyroll', slug: 'crunchyroll', category: Category.ENTERTAINMENT, defaultCurrency: Currency.BRL, pricingUrl: 'https://crunchyroll.com/premium', cancelUrl: 'https://crunchyroll.com/account' },
    { name: 'Vercel', slug: 'vercel', category: Category.INFRASTRUCTURE, defaultCurrency: Currency.USD, pricingUrl: 'https://vercel.com/pricing', cancelUrl: 'https://vercel.com/account' },
    { name: 'AWS', slug: 'aws', category: Category.INFRASTRUCTURE, defaultCurrency: Currency.USD, pricingUrl: 'https://aws.amazon.com/pricing', cancelUrl: 'https://console.aws.amazon.com/billing' },
    { name: 'Google Cloud', slug: 'google-cloud', category: Category.INFRASTRUCTURE, defaultCurrency: Currency.USD, pricingUrl: 'https://cloud.google.com/pricing', cancelUrl: 'https://console.cloud.google.com/billing' },
    { name: 'DigitalOcean', slug: 'digitalocean', category: Category.INFRASTRUCTURE, defaultCurrency: Currency.USD, pricingUrl: 'https://digitalocean.com/pricing', cancelUrl: 'https://cloud.digitalocean.com/account' },
    { name: 'GitHub Pro', slug: 'github-pro', category: Category.INFRASTRUCTURE, defaultCurrency: Currency.USD, pricingUrl: 'https://github.com/pricing', cancelUrl: 'https://github.com/settings/billing' },
    { name: 'Cloudflare', slug: 'cloudflare', category: Category.INFRASTRUCTURE, defaultCurrency: Currency.USD, pricingUrl: 'https://cloudflare.com/plans', cancelUrl: 'https://dash.cloudflare.com/profile' },
    { name: 'Notion', slug: 'notion', category: Category.TOOLS, defaultCurrency: Currency.USD, pricingUrl: 'https://notion.so/pricing', cancelUrl: 'https://notion.so/settings' },
    { name: 'Figma', slug: 'figma', category: Category.TOOLS, defaultCurrency: Currency.USD, pricingUrl: 'https://figma.com/pricing', cancelUrl: 'https://figma.com/settings' },
    { name: 'Slack', slug: 'slack', category: Category.TOOLS, defaultCurrency: Currency.USD, pricingUrl: 'https://slack.com/pricing', cancelUrl: 'https://slack.com/account/settings' },
    { name: '1Password', slug: '1password', category: Category.TOOLS, defaultCurrency: Currency.USD, pricingUrl: 'https://1password.com/sign-up', cancelUrl: 'https://my.1password.com/settings' },
    { name: 'Canva Pro', slug: 'canva-pro', category: Category.TOOLS, defaultCurrency: Currency.BRL, pricingUrl: 'https://canva.com/pricing', cancelUrl: 'https://canva.com/settings/billing' },
    { name: 'Coursera Plus', slug: 'coursera-plus', category: Category.EDUCATION, defaultCurrency: Currency.USD, pricingUrl: 'https://coursera.org/courseraplus', cancelUrl: 'https://coursera.org/account-settings' },
    { name: 'Alura', slug: 'alura', category: Category.EDUCATION, defaultCurrency: Currency.BRL, pricingUrl: 'https://alura.com.br/planos', cancelUrl: 'https://alura.com.br/minha-conta' },
    { name: 'Duolingo Plus', slug: 'duolingo-plus', category: Category.EDUCATION, defaultCurrency: Currency.USD, pricingUrl: 'https://duolingo.com/plus', cancelUrl: 'https://duolingo.com/settings/subscription' },
    { name: 'Gympass/Wellhub', slug: 'gympass', category: Category.FITNESS, defaultCurrency: Currency.BRL, pricingUrl: 'https://gympass.com/plans', cancelUrl: 'https://gympass.com/account' },
    { name: 'Strava', slug: 'strava', category: Category.FITNESS, defaultCurrency: Currency.USD, pricingUrl: 'https://strava.com/subscribe', cancelUrl: 'https://strava.com/settings/subscription' },
  ]

  for (const template of serviceTemplates) {
    await prisma.serviceTemplate.create({ data: template })
  }
  console.log(`📦 Created ${serviceTemplates.length} service templates`)

  const crunchyrollTemplate = await prisma.serviceTemplate.findUnique({ where: { slug: 'crunchyroll' } })

  // Payment methods + cards
  const samsungItau = await prisma.paymentMethod.create({
    data: {
      userId: testUser.id,
      name: 'Samsung Itaú',
      type: PaymentMethodType.CREDIT_CARD,
      paymentCard: {
        create: {
          userId: testUser.id,
          nickname: 'Samsung Itaú',
          brand: 'Mastercard',
          last4: '1234',
          closingDay: 28,
          dueDay: 5,
          limitAmount: 5000,
        },
      },
    },
    include: { paymentCard: true },
  })

  const bradescoVisa = await prisma.paymentMethod.create({
    data: {
      userId: testUser.id,
      name: 'Bradesco Visa',
      type: PaymentMethodType.CREDIT_CARD,
      paymentCard: {
        create: {
          userId: testUser.id,
          nickname: 'Bradesco Visa',
          brand: 'Visa',
          last4: '5678',
          closingDay: 20,
          dueDay: 28,
          limitAmount: 12000,
        },
      },
    },
    include: { paymentCard: true },
  })

  const pix = await prisma.paymentMethod.create({
    data: {
      userId: testUser.id,
      name: 'PIX',
      type: PaymentMethodType.PIX,
    },
  })

  console.log(`💳 Created payment methods + cards`)

  // Subscriptions
  const crunchyroll = await prisma.subscription.create({
    data: {
      name: 'Crunchyroll',
      price: 4.0,
      currency: Currency.BRL,
      billingCycle: BillingCycle.MONTHLY,
      category: Category.ENTERTAINMENT,
      startDate: new Date('2024-03-10'),
      nextBillingDate: d(10),
      active: true,
      userId: testUser.id,
      serviceTemplateId: crunchyrollTemplate?.id,
      paymentMethodId: pix.id,
    },
  })

  const f1tv = await prisma.subscription.create({
    data: {
      name: 'F1 TV',
      price: 29.0,
      currency: Currency.BRL,
      billingCycle: BillingCycle.MONTHLY,
      category: Category.ENTERTAINMENT,
      startDate: new Date('2024-06-01'),
      nextBillingDate: d(1),
      active: true,
      userId: testUser.id,
      paymentMethodId: pix.id,
    },
  })

  console.log(`📝 Created subscriptions`)

  // Monthly plan (April 2026)
  const plan = await prisma.monthlyPlan.create({
    data: {
      userId: testUser.id,
      year: PLAN_YEAR,
      month: PLAN_MONTH,
      notes: 'Planejamento de Abril',
    },
  })
  console.log(`🗓️  Created monthly plan ${PLAN_YEAR}-${PLAN_MONTH}`)

  // Incomes (A Receber)
  const incomes = [
    { name: 'DelSafe', amount: 7500.0 },
    { name: 'Amor', amount: 1513.34 },
    { name: 'Air Fryer (Mãe e Pai)', amount: 98.66 },
    { name: 'Amazon (Natalia)', amount: 20.92 },
    { name: 'Estacionamento', amount: 150.0 },
  ]

  for (const [index, income] of incomes.entries()) {
    await prisma.plannedIncome.create({
      data: {
        monthlyPlanId: plan.id,
        name: income.name,
        amount: income.amount,
        currency: Currency.BRL,
        expectedDate: d(5 + index),
        sortOrder: index,
      },
    })
  }
  console.log(`💰 Created ${incomes.length} planned incomes`)

  // Monthly bills (Contas fixas)
  const monthlyBills = [
    { name: 'Samsung Itaú', amount: 220.98, method: samsungItau.id, bucket: ExpenseBucket.CREDIT_CARD },
    { name: 'Bradesco', amount: 6154.0, method: bradescoVisa.id, bucket: ExpenseBucket.CREDIT_CARD },
    { name: 'HumanaSaúde', amount: 153.72, method: pix.id, bucket: ExpenseBucket.MONTHLY_BILLS },
    { name: 'HapVida Odonto', amount: 38.76, method: pix.id, bucket: ExpenseBucket.MONTHLY_BILLS },
    { name: 'Claro*', amount: 32.36, method: pix.id, bucket: ExpenseBucket.MONTHLY_BILLS },
    { name: 'DAS', amount: 86.05, method: pix.id, bucket: ExpenseBucket.MONTHLY_BILLS },
    { name: 'Nubank 2ª parcela', amount: 1040.48, method: pix.id, bucket: ExpenseBucket.MONTHLY_BILLS },
    { name: 'Contas Casa', amount: 1985.12, method: pix.id, bucket: ExpenseBucket.MONTHLY_BILLS },
    { name: 'Internet ORA', amount: 96.55, method: pix.id, bucket: ExpenseBucket.MONTHLY_BILLS },
  ]

  for (const [index, bill] of monthlyBills.entries()) {
    await prisma.plannedExpense.create({
      data: {
        monthlyPlanId: plan.id,
        name: bill.name,
        amount: bill.amount,
        currency: Currency.BRL,
        expenseBucket: bill.bucket,
        paymentMethodId: bill.method,
        dueDate: d(10 + index),
        sortOrder: index,
      },
    })
  }
  console.log(`📄 Created ${monthlyBills.length} monthly bills`)

  // Fixed card (assinaturas no cartão)
  const fixedCardSubs = [
    { name: 'Crunchyroll', amount: 4.0, subscriptionId: crunchyroll.id, cardId: null as string | null, methodId: pix.id },
    { name: 'F1 TV', amount: 29.0, subscriptionId: f1tv.id, cardId: null, methodId: pix.id },
  ]

  for (const [index, sub] of fixedCardSubs.entries()) {
    await prisma.plannedExpense.create({
      data: {
        monthlyPlanId: plan.id,
        name: sub.name,
        amount: sub.amount,
        currency: Currency.BRL,
        expenseBucket: ExpenseBucket.FIXED_CARD,
        paymentMethodId: sub.methodId,
        paymentCardId: sub.cardId ?? undefined,
        subscriptionId: sub.subscriptionId,
        source: PlanEntrySource.SUBSCRIPTION,
        isAutoGenerated: true,
        dueDate: d(10 + index),
        sortOrder: index,
      },
    })
  }
  console.log(`🔁 Created ${fixedCardSubs.length} subscription-linked expenses`)

  // Credit card invoices
  const samsungInvoice = await prisma.creditCardInvoice.create({
    data: {
      userId: testUser.id,
      paymentCardId: samsungItau.paymentCard!.id,
      year: PLAN_YEAR,
      month: PLAN_MONTH,
      closingDate: d(28),
      dueDate: new Date(Date.UTC(PLAN_YEAR, PLAN_MONTH, 5, 12, 0, 0)),
      total: 220.98,
      currency: Currency.BRL,
      status: InvoiceStatus.CLOSED,
    },
  })

  const bradescoInvoice = await prisma.creditCardInvoice.create({
    data: {
      userId: testUser.id,
      paymentCardId: bradescoVisa.paymentCard!.id,
      year: PLAN_YEAR,
      month: PLAN_MONTH,
      closingDate: d(20),
      dueDate: new Date(Date.UTC(PLAN_YEAR, PLAN_MONTH - 1, 28, 12, 0, 0)),
      total: 6154.0,
      currency: Currency.BRL,
      status: InvoiceStatus.CLOSED,
    },
  })
  console.log(`🧾 Created credit card invoices`)

  // Samsung Itaú transactions (single-shot)
  const samsungTransactions = [
    { name: 'Cursor Pro', amount: 115.23, day: 25 },
    { name: 'Cursor Pro IOF', amount: 4.03, day: 25 },
    { name: 'Windsurf Pro', amount: 57.12, day: 17 },
    { name: 'Windsurf Pro IOF', amount: 2.0, day: 17 },
    { name: 'Google Play', amount: 3.9, day: 10 },
    { name: 'Google Play', amount: 9.9, day: 3 },
    { name: 'Google Play', amount: 18.9, day: 2 },
  ]

  for (const tx of samsungTransactions) {
    await prisma.plannedExpense.create({
      data: {
        monthlyPlanId: plan.id,
        name: tx.name,
        amount: tx.amount,
        currency: Currency.BRL,
        expenseBucket: ExpenseBucket.CREDIT_CARD,
        paymentMethodId: samsungItau.id,
        paymentCardId: samsungItau.paymentCard!.id,
        creditCardInvoiceId: samsungInvoice.id,
        source: PlanEntrySource.CREDIT_CARD_INVOICE,
        purchaseDate: d(tx.day),
      },
    })
  }

  // Bradesco: mix of single + installments
  // Single transactions
  const bradescoSingle = [
    { name: 'Seresa Exp', amount: 23.9, day: 24 },
    { name: 'Steam', amount: 17.34, day: 23 },
    { name: 'Smartfit Promoção', amount: 9.9, day: 24 },
    { name: 'Uber', amount: 12.95, day: 26 },
    { name: 'Divino North', amount: 60.23, day: 26 },
  ]

  for (const tx of bradescoSingle) {
    await prisma.plannedExpense.create({
      data: {
        monthlyPlanId: plan.id,
        name: tx.name,
        amount: tx.amount,
        currency: Currency.BRL,
        expenseBucket: ExpenseBucket.CREDIT_CARD,
        paymentMethodId: bradescoVisa.id,
        paymentCardId: bradescoVisa.paymentCard!.id,
        creditCardInvoiceId: bradescoInvoice.id,
        source: PlanEntrySource.CREDIT_CARD_INVOICE,
        purchaseDate: d(tx.day),
      },
    })
  }

  // Installment purchases (one PlannedExpense per parcela in this month)
  const installmentPurchases = [
    { name: 'Bus Serviços', totalAmount: 422.3, installmentCount: 2, current: 2, monthAmount: 211.15, purchaseDay: 13, firstDate: new Date(Date.UTC(2026, 1, 13, 12, 0, 0)) },
    { name: 'Paypal Class', totalAmount: 106.2, installmentCount: 2, current: 1, monthAmount: 53.1, purchaseDay: 13, firstDate: d(13) },
    { name: 'Airbnb Hmset Centro', totalAmount: 551.58, installmentCount: 6, current: 2, monthAmount: 91.93, purchaseDay: 26, firstDate: new Date(Date.UTC(2026, 2, 26, 12, 0, 0)) },
    { name: 'Clinica Dilaser', totalAmount: 550.8, installmentCount: 12, current: 11, monthAmount: 45.9, purchaseDay: 28, firstDate: new Date(Date.UTC(2025, 4, 28, 12, 0, 0)) },
    { name: 'Ticketmaster Lollapalooza', totalAmount: 2409.6, installmentCount: 10, current: 7, monthAmount: 240.96, purchaseDay: 28, firstDate: new Date(Date.UTC(2025, 9, 28, 12, 0, 0)) },
    { name: 'Tcl Service (Ar condicionado)', totalAmount: 499.98, installmentCount: 6, current: 4, monthAmount: 83.33, purchaseDay: 26, firstDate: new Date(Date.UTC(2026, 0, 26, 12, 0, 0)) },
    { name: 'Amazon (Rack Mãe)', totalAmount: 282.12, installmentCount: 6, current: 4, monthAmount: 47.02, purchaseDay: 13, firstDate: new Date(Date.UTC(2026, 0, 13, 12, 0, 0)) },
    { name: 'Dafiti (Tênis Mãe e Jeovana)', totalAmount: 665.2, installmentCount: 5, current: 3, monthAmount: 133.04, purchaseDay: 23, firstDate: new Date(Date.UTC(2026, 1, 23, 12, 0, 0)) },
    { name: 'Airbnb Hmset (BA)', totalAmount: 1486.87, installmentCount: 7, current: 2, monthAmount: 212.41, purchaseDay: 26, firstDate: new Date(Date.UTC(2026, 2, 26, 12, 0, 0)) },
    { name: 'Vivara Xp', totalAmount: 800.0, installmentCount: 5, current: 2, monthAmount: 160.0, purchaseDay: 20, firstDate: new Date(Date.UTC(2026, 2, 20, 12, 0, 0)) },
    { name: 'Airbnb Hmset Centro', totalAmount: 551.58, installmentCount: 6, current: 2, monthAmount: 91.93, purchaseDay: 25, firstDate: new Date(Date.UTC(2026, 2, 25, 12, 0, 0)) },
  ]

  for (const purchase of installmentPurchases) {
    const installment = await prisma.installmentPurchase.create({
      data: {
        userId: testUser.id,
        paymentCardId: bradescoVisa.paymentCard!.id,
        name: purchase.name,
        totalAmount: purchase.totalAmount,
        currency: Currency.BRL,
        installmentCount: purchase.installmentCount,
        firstPurchaseDate: purchase.firstDate,
      },
    })

    await prisma.plannedExpense.create({
      data: {
        monthlyPlanId: plan.id,
        name: purchase.name,
        amount: purchase.monthAmount,
        currency: Currency.BRL,
        expenseBucket: ExpenseBucket.CREDIT_CARD,
        paymentMethodId: bradescoVisa.id,
        paymentCardId: bradescoVisa.paymentCard!.id,
        creditCardInvoiceId: bradescoInvoice.id,
        installmentPurchaseId: installment.id,
        installmentNumber: purchase.current,
        installmentTotal: purchase.installmentCount,
        source: PlanEntrySource.INSTALLMENT,
        purchaseDate: d(purchase.purchaseDay),
      },
    })
  }

  console.log(`💳 Created ${samsungTransactions.length + bradescoSingle.length + installmentPurchases.length} card transactions`)

  console.log('')
  console.log('✅ Database seeded successfully!')
  console.log('📧 Test user credentials:')
  console.log('   Email: test@subscrip.dev')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
