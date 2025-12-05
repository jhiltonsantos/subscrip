import { PrismaClient, Category, BillingCycle, Currency } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')
  
  await prisma.subscription.deleteMany()

  const subscriptions = [
    {
      name: 'Netflix',
      price: 55.90,
      currency: Currency.BRL,
      billingCycle: BillingCycle.MONTHLY,
      category: Category.ENTERTAINMENT,
      startDate: new Date('2024-01-15'),
      nextBillingDate: new Date('2024-12-15'),
      active: true,
    },
    {
      name: 'Vercel Pro',
      price: 20.00,
      currency: Currency.USD,
      billingCycle: BillingCycle.MONTHLY,
      category: Category.INFRASTRUCTURE,
      startDate: new Date('2024-02-01'),
      nextBillingDate: new Date('2024-12-01'),
      active: true,
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
    },
    {
      name: 'Curso de Inglês',
      price: 150.00,
      currency: Currency.BRL,
      billingCycle: BillingCycle.MONTHLY,
      category: Category.EDUCATION,
      startDate: new Date('2024-03-01'),
      nextBillingDate: new Date('2024-04-01'),
      active: true,
    }
  ]

  for (const sub of subscriptions) {
    const res = await prisma.subscription.create({ data: sub })
    console.log(`Created subscription with id: ${res.id}`)
  }

  console.log('✅ Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })