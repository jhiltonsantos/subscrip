import type { useTranslations } from "next-intl"
import type {
  FinancePlannerFormOptions,
  SerializedMonthlyPlan,
} from "@/server/actions/finance-planner"

export type PlannedIncome = SerializedMonthlyPlan["incomes"][number]
export type PlannedExpense = SerializedMonthlyPlan["expenses"][number]
export type PaymentMethodOption = FinancePlannerFormOptions["paymentMethods"][number]
export type ActiveTab = "income" | "expenses" | "cardCosts"
export type ViewMode = "cards" | "list"
export type TranslationFn = ReturnType<typeof useTranslations>

export type IncomeForm = {
  name: string
  description: string
  amount: string
  currency: string
  expectedDate: string
  isReceived: boolean
  isMonthlyRecurring: boolean
  isFixedRecurring: boolean
  recurrenceMonths: string
}

export type ExpenseForm = {
  name: string
  merchantName: string
  description: string
  amount: string
  currency: string
  expenseBucket: string
  dueDate: string
  purchaseDate: string
  isPaid: boolean
  paymentMethodId: string
  isInstallment: boolean
  isMonthlyRecurring: boolean
  createPreviousInstallments: boolean
  installmentNumber: string
  installmentTotal: string
}

export type CardCostForm = {
  name: string
  merchantName: string
  description: string
  amount: string
  currency: string
  dueDate: string
  paymentMethodId: string
  isInstallment: boolean
  createPreviousInstallments: boolean
  installmentNumber: string
  installmentTotal: string
}
