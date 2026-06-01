import type { CardCostForm, ExpenseForm, IncomeForm } from "./types"

export const currencies = ["BRL", "USD", "EUR"] as const
export const expenseBuckets = ["MONTHLY_BILLS", "FIXED_CARD", "OTHER"] as const

export const emptyIncomeForm: IncomeForm = {
  name: "",
  amount: "",
  currency: "BRL",
  expectedDate: "",
  isReceived: false,
}

export const emptyExpenseForm: ExpenseForm = {
  name: "",
  amount: "",
  currency: "BRL",
  expenseBucket: "MONTHLY_BILLS",
  dueDate: "",
  purchaseDate: "",
  isPaid: false,
  paymentMethodId: "",
}

export const emptyCardCostForm: CardCostForm = {
  name: "",
  amount: "",
  currency: "BRL",
  purchaseDate: "",
  dueDate: "",
  paymentMethodId: "",
  installmentNumber: "",
  installmentTotal: "",
  isPaid: false,
}
