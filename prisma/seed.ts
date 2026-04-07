import { PrismaClient, Category, BillingCycle, Currency } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Clean up existing data
  await prisma.reminder.deleteMany()
  await prisma.subscription.deleteMany()
  await prisma.serviceTemplate.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()

  console.log('🧹 Cleaned existing data')

  // Create test user
  const testUser = await prisma.user.create({
    data: {
      name: 'Test User',
      email: 'test@subscrip.dev',
      emailVerified: true,
    },
  })
  console.log(`👤 Created test user: ${testUser.email}`)

  // Create service templates (popular subscriptions database)
  const serviceTemplates = [
    // Entertainment
    { name: 'Netflix', slug: 'netflix', category: Category.ENTERTAINMENT, defaultCurrency: Currency.BRL, pricingUrl: 'https://netflix.com/signup/planform', cancelUrl: 'https://netflix.com/cancelplan' },
    { name: 'Spotify', slug: 'spotify', category: Category.ENTERTAINMENT, defaultCurrency: Currency.BRL, pricingUrl: 'https://spotify.com/premium', cancelUrl: 'https://spotify.com/account' },
    { name: 'Amazon Prime', slug: 'amazon-prime', category: Category.ENTERTAINMENT, defaultCurrency: Currency.BRL, pricingUrl: 'https://amazon.com.br/prime', cancelUrl: 'https://amazon.com.br/prime/cancel' },
    { name: 'Disney+', slug: 'disney-plus', category: Category.ENTERTAINMENT, defaultCurrency: Currency.BRL, pricingUrl: 'https://disneyplus.com/sign-up', cancelUrl: 'https://disneyplus.com/account' },
    { name: 'HBO Max', slug: 'hbo-max', category: Category.ENTERTAINMENT, defaultCurrency: Currency.BRL, pricingUrl: 'https://max.com/plans', cancelUrl: 'https://max.com/account' },
    { name: 'YouTube Premium', slug: 'youtube-premium', category: Category.ENTERTAINMENT, defaultCurrency: Currency.BRL, pricingUrl: 'https://youtube.com/premium', cancelUrl: 'https://youtube.com/paid_memberships' },
    { name: 'Apple TV+', slug: 'apple-tv-plus', category: Category.ENTERTAINMENT, defaultCurrency: Currency.USD, pricingUrl: 'https://apple.com/br/apple-tv-plus', cancelUrl: 'https://support.apple.com/subscriptions' },
    { name: 'Crunchyroll', slug: 'crunchyroll', category: Category.ENTERTAINMENT, defaultCurrency: Currency.BRL, pricingUrl: 'https://crunchyroll.com/premium', cancelUrl: 'https://crunchyroll.com/account' },

    // Infrastructure
    { name: 'Vercel', slug: 'vercel', category: Category.INFRASTRUCTURE, defaultCurrency: Currency.USD, pricingUrl: 'https://vercel.com/pricing', cancelUrl: 'https://vercel.com/account' },
    { name: 'AWS', slug: 'aws', category: Category.INFRASTRUCTURE, defaultCurrency: Currency.USD, pricingUrl: 'https://aws.amazon.com/pricing', cancelUrl: 'https://console.aws.amazon.com/billing' },
    { name: 'Google Cloud', slug: 'google-cloud', category: Category.INFRASTRUCTURE, defaultCurrency: Currency.USD, pricingUrl: 'https://cloud.google.com/pricing', cancelUrl: 'https://console.cloud.google.com/billing' },
    { name: 'DigitalOcean', slug: 'digitalocean', category: Category.INFRASTRUCTURE, defaultCurrency: Currency.USD, pricingUrl: 'https://digitalocean.com/pricing', cancelUrl: 'https://cloud.digitalocean.com/account' },
    { name: 'GitHub Pro', slug: 'github-pro', category: Category.INFRASTRUCTURE, defaultCurrency: Currency.USD, pricingUrl: 'https://github.com/pricing', cancelUrl: 'https://github.com/settings/billing' },
    { name: 'Cloudflare', slug: 'cloudflare', category: Category.INFRASTRUCTURE, defaultCurrency: Currency.USD, pricingUrl: 'https://cloudflare.com/plans', cancelUrl: 'https://dash.cloudflare.com/profile' },

    // Tools
    { name: 'Notion', slug: 'notion', category: Category.TOOLS, defaultCurrency: Currency.USD, pricingUrl: 'https://notion.so/pricing', cancelUrl: 'https://notion.so/settings' },
    { name: 'Figma', slug: 'figma', category: Category.TOOLS, defaultCurrency: Currency.USD, pricingUrl: 'https://figma.com/pricing', cancelUrl: 'https://figma.com/settings' },
    { name: 'Slack', slug: 'slack', category: Category.TOOLS, defaultCurrency: Currency.USD, pricingUrl: 'https://slack.com/pricing', cancelUrl: 'https://slack.com/account/settings' },
    { name: '1Password', slug: '1password', category: Category.TOOLS, defaultCurrency: Currency.USD, pricingUrl: 'https://1password.com/sign-up', cancelUrl: 'https://my.1password.com/settings' },
    { name: 'Canva Pro', slug: 'canva-pro', category: Category.TOOLS, defaultCurrency: Currency.BRL, pricingUrl: 'https://canva.com/pricing', cancelUrl: 'https://canva.com/settings/billing' },

    // Education
    { name: 'Coursera Plus', slug: 'coursera-plus', category: Category.EDUCATION, defaultCurrency: Currency.USD, pricingUrl: 'https://coursera.org/courseraplus', cancelUrl: 'https://coursera.org/account-settings' },
    { name: 'Alura', slug: 'alura', category: Category.EDUCATION, defaultCurrency: Currency.BRL, pricingUrl: 'https://alura.com.br/planos', cancelUrl: 'https://alura.com.br/minha-conta' },
    { name: 'Duolingo Plus', slug: 'duolingo-plus', category: Category.EDUCATION, defaultCurrency: Currency.USD, pricingUrl: 'https://duolingo.com/plus', cancelUrl: 'https://duolingo.com/settings/subscription' },

    // Fitness
    { name: 'Gympass/Wellhub', slug: 'gympass', category: Category.FITNESS, defaultCurrency: Currency.BRL, pricingUrl: 'https://gympass.com/plans', cancelUrl: 'https://gympass.com/account' },
    { name: 'Strava', slug: 'strava', category: Category.FITNESS, defaultCurrency: Currency.USD, pricingUrl: 'https://strava.com/subscribe', cancelUrl: 'https://strava.com/settings/subscription' },
  ]

  for (const template of serviceTemplates) {
    await prisma.serviceTemplate.create({ data: template })
  }
  console.log(`📦 Created ${serviceTemplates.length} service templates`)

  // Get Netflix template for linking
  const netflixTemplate = await prisma.serviceTemplate.findUnique({ where: { slug: 'netflix' } })
  const vercelTemplate = await prisma.serviceTemplate.findUnique({ where: { slug: 'vercel' } })
  const primeTemplate = await prisma.serviceTemplate.findUnique({ where: { slug: 'amazon-prime' } })

  // Create subscriptions for test user
  const subscriptions = [
    {
      name: 'Netflix',
      price: 55.90,
      currency: Currency.BRL,
      billingCycle: BillingCycle.MONTHLY,
      category: Category.ENTERTAINMENT,
      startDate: new Date('2024-01-15'),
      nextBillingDate: new Date('2025-01-15'),
      active: true,
      userId: testUser.id,
      serviceTemplateId: netflixTemplate?.id,
    },
    {
      name: 'Vercel Pro',
      price: 20.00,
      currency: Currency.USD,
      billingCycle: BillingCycle.MONTHLY,
      category: Category.INFRASTRUCTURE,
      startDate: new Date('2024-02-01'),
      nextBillingDate: new Date('2025-01-01'),
      active: true,
      userId: testUser.id,
      serviceTemplateId: vercelTemplate?.id,
    },
    {
      name: 'Amazon Prime',
      price: 119.90,
      currency: Currency.BRL,
      billingCycle: BillingCycle.YEARLY,
      category: Category.ENTERTAINMENT,
      startDate: new Date('2024-05-10'),
      nextBillingDate: new Date('2025-05-10'),
      active: true,
      userId: testUser.id,
      serviceTemplateId: primeTemplate?.id,
    },
    {
      name: 'Curso de Inglês',
      price: 150.00,
      currency: Currency.BRL,
      billingCycle: BillingCycle.MONTHLY,
      category: Category.EDUCATION,
      startDate: new Date('2024-03-01'),
      nextBillingDate: new Date('2025-01-01'),
      active: true,
      userId: testUser.id,
    },
    {
      name: 'Academia Smart Fit',
      price: 99.90,
      currency: Currency.BRL,
      billingCycle: BillingCycle.MONTHLY,
      category: Category.FITNESS,
      startDate: new Date('2024-06-01'),
      nextBillingDate: new Date('2025-01-01'),
      active: true,
      userId: testUser.id,
    },
  ]

  for (const sub of subscriptions) {
    await prisma.subscription.create({ data: sub })
  }
  console.log(`📝 Created ${subscriptions.length} subscriptions for test user`)

  console.log('✅ Database seeded successfully!')
  console.log('')
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