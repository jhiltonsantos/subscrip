export const CURRENCY_VALUES = ["BRL", "USD", "EUR"] as const
export type Currency = (typeof CURRENCY_VALUES)[number]

export const BILLING_CYCLE_VALUES = ["MONTHLY", "YEARLY", "WEEKLY"] as const
export type BillingCycle = (typeof BILLING_CYCLE_VALUES)[number]

export const CATEGORY_VALUES = [
  "INFRASTRUCTURE",
  "ENTERTAINMENT",
  "EDUCATION",
  "TOOLS",
  "FITNESS",
  "OTHER",
] as const
export type Category = (typeof CATEGORY_VALUES)[number]

export const DEFAULT_SUBSCRIPTION_FORM = {
  currency: "BRL",
  billingCycle: "MONTHLY",
  category: "OTHER",
} as const satisfies {
  currency: Currency
  billingCycle: BillingCycle
  category: Category
}
