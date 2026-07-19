import {
  BILLING_CYCLE_VALUES,
  CATEGORY_VALUES,
  type BillingCycle,
  type Category,
} from "@/lib/subscription-constants"

type SubscriptionLabelTranslator = (
  key: `enums.categories.${Category}` | `enums.billingCycles.${BillingCycle}`
) => string

export function getCategoryLabel(
  category: string,
  t: SubscriptionLabelTranslator
): string {
  if (CATEGORY_VALUES.includes(category as Category)) {
    return t(`enums.categories.${category as Category}`)
  }

  return category
}

export function getBillingCycleLabel(
  billingCycle: string,
  t: SubscriptionLabelTranslator
): string {
  if (BILLING_CYCLE_VALUES.includes(billingCycle as BillingCycle)) {
    return t(`enums.billingCycles.${billingCycle as BillingCycle}`)
  }

  return billingCycle
}

export function formatSubscriptionDueDate(
  date: Date,
  locale: string
): string {
  if (locale === "pt") {
    const day = String(date.getDate()).padStart(2, "0")
    const month = date.toLocaleString("pt-BR", { month: "long" })
    return `${day} de ${month}`
  }

  return date.toLocaleString("en-US", { month: "long", day: "numeric" })
}
