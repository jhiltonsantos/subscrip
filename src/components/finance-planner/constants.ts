import type { CardCostForm, ExpenseForm, IncomeForm } from "./types"

export const currencies = ["BRL", "USD", "EUR"] as const
export const expenseBuckets = ["MONTHLY_BILLS", "FIXED_CARD", "OTHER"] as const

export const emptyIncomeForm: IncomeForm = {
  name: "",
  description: "",
  amount: "",
  currency: "BRL",
  expectedDate: "",
  isReceived: false,
  isMonthlyRecurring: false,
  isFixedRecurring: false,
  recurrenceMonths: "",
}

export const emptyExpenseForm: ExpenseForm = {
  name: "",
  merchantName: "",
  description: "",
  amount: "",
  currency: "BRL",
  expenseBucket: "MONTHLY_BILLS",
  dueDate: "",
  purchaseDate: "",
  isPaid: false,
  paymentMethodId: "",
  isInstallment: false,
  isMonthlyRecurring: false,
  createPreviousInstallments: false,
  installmentNumber: "",
  installmentTotal: "",
}

export const emptyCardCostForm: CardCostForm = {
  name: "",
  merchantName: "",
  description: "",
  amount: "",
  currency: "BRL",
  dueDate: "",
  paymentMethodId: "",
  isInstallment: false,
  createPreviousInstallments: false,
  installmentNumber: "",
  installmentTotal: "",
}
