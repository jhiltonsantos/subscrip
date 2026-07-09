import {
  BillingCycle,
  Category,
  Currency,
  ExpenseBucket,
  PaymentMethodType,
} from '@prisma/client'
import { DEFAULT_DEMO_USER_EMAIL } from '../guard-prod-demo-seed'

export const DEMO_USER = {
  name: 'João Silva',
  email: DEFAULT_DEMO_USER_EMAIL,
  emailVerified: true,
  preferredCurrency: Currency.BRL,
  language: 'pt-BR',
} as const

export type DemoCardSeed = {
  key: 'nubank' | 'inter'
  methodName: string
  nickname: string
  brand: string
  last4: string
  closingDay: number
  dueDay: number
  limitAmount: number
}

export const DEMO_CARDS: DemoCardSeed[] = [
  {
    key: 'nubank',
    methodName: 'Nubank Mastercard',
    nickname: 'Nubank',
    brand: 'Mastercard',
    last4: '4821',
    closingDay: 3,
    dueDay: 10,
    limitAmount: 8000,
  },
  {
    key: 'inter',
    methodName: 'Inter Visa',
    nickname: 'Inter',
    brand: 'Visa',
    last4: '9034',
    closingDay: 15,
    dueDay: 22,
    limitAmount: 12000,
  },
]

export const DEMO_PIX_METHOD = {
  key: 'pix' as const,
  name: 'PIX',
  type: PaymentMethodType.PIX,
}

export type DemoSubscriptionSeed = {
  key: string
  name: string
  templateSlug?: string
  price: number
  currency: Currency
  billingCycle: BillingCycle
  category: Category
  billingDay?: number
  nextBillingDate?: string
  paymentMethodKey: 'nubank' | 'inter' | 'pix'
  active: boolean
  hiredAt: string
}

export const DEMO_SUBSCRIPTIONS: DemoSubscriptionSeed[] = [
  {
    key: 'netflix',
    name: 'Netflix',
    templateSlug: 'netflix',
    price: 55.9,
    currency: Currency.BRL,
    billingCycle: BillingCycle.MONTHLY,
    category: Category.ENTERTAINMENT,
    billingDay: 5,
    paymentMethodKey: 'nubank',
    active: true,
    hiredAt: '2023-01-15',
  },
  {
    key: 'spotify',
    name: 'Spotify',
    templateSlug: 'spotify',
    price: 27.9,
    currency: Currency.BRL,
    billingCycle: BillingCycle.MONTHLY,
    category: Category.ENTERTAINMENT,
    billingDay: 12,
    paymentMethodKey: 'nubank',
    active: true,
    hiredAt: '2022-08-20',
  },
  {
    key: 'disney',
    name: 'Disney+',
    templateSlug: 'disney-plus',
    price: 33.9,
    currency: Currency.BRL,
    billingCycle: BillingCycle.MONTHLY,
    category: Category.ENTERTAINMENT,
    billingDay: 18,
    paymentMethodKey: 'nubank',
    active: true,
    hiredAt: '2024-02-01',
  },
  {
    key: 'github',
    name: 'GitHub Pro',
    templateSlug: 'github-pro',
    price: 4,
    currency: Currency.USD,
    billingCycle: BillingCycle.MONTHLY,
    category: Category.INFRASTRUCTURE,
    billingDay: 8,
    paymentMethodKey: 'nubank',
    active: true,
    hiredAt: '2021-11-10',
  },
  {
    key: 'aws',
    name: 'AWS',
    templateSlug: 'aws',
    price: 45,
    currency: Currency.USD,
    billingCycle: BillingCycle.MONTHLY,
    category: Category.INFRASTRUCTURE,
    billingDay: 1,
    paymentMethodKey: 'nubank',
    active: true,
    hiredAt: '2020-06-01',
  },
  {
    key: 'notion',
    name: 'Notion',
    templateSlug: 'notion',
    price: 96,
    currency: Currency.USD,
    billingCycle: BillingCycle.YEARLY,
    category: Category.TOOLS,
    nextBillingDate: '2026-11-20',
    paymentMethodKey: 'pix',
    active: true,
    hiredAt: '2024-11-20',
  },
  {
    key: 'wellhub',
    name: 'Wellhub',
    templateSlug: 'gympass',
    price: 89.9,
    currency: Currency.BRL,
    billingCycle: BillingCycle.MONTHLY,
    category: Category.FITNESS,
    billingDay: 20,
    paymentMethodKey: 'pix',
    active: true,
    hiredAt: '2025-03-01',
  },
  {
    key: 'hbo',
    name: 'HBO Max',
    templateSlug: 'hbo-max',
    price: 34.9,
    currency: Currency.BRL,
    billingCycle: BillingCycle.MONTHLY,
    category: Category.ENTERTAINMENT,
    billingDay: 25,
    paymentMethodKey: 'nubank',
    active: false,
    hiredAt: '2024-05-10',
  },
]

export type DemoIncomeSeed = {
  name: string
  amount: number
  day: number
}

export const DEMO_INCOMES: DemoIncomeSeed[] = [
  { name: 'Salário CLT', amount: 8500, day: 5 },
  { name: 'Freelance', amount: 2500, day: 15 },
  { name: 'Aluguel recebido', amount: 1200, day: 10 },
  { name: 'Rendimentos', amount: 350, day: 20 },
]

export type DemoMonthlyBillSeed = {
  name: string
  amount: number
  paymentMethodKey: 'nubank' | 'inter' | 'pix'
  bucket: ExpenseBucket
  day: number
}

export const DEMO_MONTHLY_BILLS: DemoMonthlyBillSeed[] = [
  { name: 'Aluguel', amount: 2200, paymentMethodKey: 'pix', bucket: ExpenseBucket.MONTHLY_BILLS, day: 8 },
  { name: 'Condomínio', amount: 450, paymentMethodKey: 'pix', bucket: ExpenseBucket.MONTHLY_BILLS, day: 10 },
  { name: 'Internet', amount: 119.9, paymentMethodKey: 'pix', bucket: ExpenseBucket.MONTHLY_BILLS, day: 12 },
  { name: 'Energia elétrica', amount: 180, paymentMethodKey: 'pix', bucket: ExpenseBucket.MONTHLY_BILLS, day: 14 },
  { name: 'Plano de saúde', amount: 320, paymentMethodKey: 'pix', bucket: ExpenseBucket.MONTHLY_BILLS, day: 16 },
  { name: 'Seguro auto', amount: 210, paymentMethodKey: 'pix', bucket: ExpenseBucket.MONTHLY_BILLS, day: 18 },
  { name: 'Fatura Nubank', amount: 1850, paymentMethodKey: 'nubank', bucket: ExpenseBucket.CREDIT_CARD, day: 10 },
  { name: 'Fatura Inter', amount: 2340, paymentMethodKey: 'inter', bucket: ExpenseBucket.CREDIT_CARD, day: 22 },
]

export type DemoCardTransactionSeed = {
  name: string
  amount: number
  day: number
  cardKey: 'nubank' | 'inter'
}

export const DEMO_NUBANK_TRANSACTIONS: DemoCardTransactionSeed[] = [
  { name: 'iFood', amount: 68.9, day: 4, cardKey: 'nubank' },
  { name: 'Uber', amount: 32.5, day: 7, cardKey: 'nubank' },
  { name: 'Amazon', amount: 149.9, day: 11, cardKey: 'nubank' },
  { name: 'Farmácia', amount: 87.4, day: 19, cardKey: 'nubank' },
]

export const DEMO_INTER_TRANSACTIONS: DemoCardTransactionSeed[] = [
  { name: 'Supermercado', amount: 412.35, day: 6, cardKey: 'inter' },
  { name: 'Posto de gasolina', amount: 280, day: 13, cardKey: 'inter' },
  { name: 'Cinema', amount: 96, day: 21, cardKey: 'inter' },
]

export type DemoInstallmentSeed = {
  name: string
  totalAmount: number
  installmentCount: number
  currentInstallment: number
  monthAmount: number
  purchaseDay: number
  firstPurchaseDate: string
}

export const DEMO_INSTALLMENTS: DemoInstallmentSeed[] = [
  {
    name: 'Notebook Dell',
    totalAmount: 5490,
    installmentCount: 10,
    currentInstallment: 4,
    monthAmount: 549,
    purchaseDay: 12,
    firstPurchaseDate: '2026-04-12',
  },
  {
    name: 'Smartphone Samsung',
    totalAmount: 2394,
    installmentCount: 6,
    currentInstallment: 2,
    monthAmount: 399,
    purchaseDay: 8,
    firstPurchaseDate: '2026-06-08',
  },
  {
    name: 'Curso de inglês',
    totalAmount: 1196,
    installmentCount: 4,
    currentInstallment: 3,
    monthAmount: 299,
    purchaseDay: 5,
    firstPurchaseDate: '2026-05-05',
  },
]
