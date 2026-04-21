import type { RootState } from "@/store"

const toNumber = (value: string | null | undefined) =>
  value ? Number(value) : 0

export const selectFinanceState = (state: RootState) => state.finance

export const selectFinanceLoading = (state: RootState) => state.finance.isLoading
export const selectFinanceError = (state: RootState) => state.finance.error

export const selectSelectedYear = (state: RootState) => state.finance.selectedYear
export const selectSelectedMonth = (state: RootState) => state.finance.selectedMonth
export const selectSelectedMonthRef = (state: RootState) => ({
  year: state.finance.selectedYear,
  month: state.finance.selectedMonth,
})

export const selectMonthlyPlan = (state: RootState) => state.finance.plan
export const selectMonthSummary = (state: RootState) => state.finance.summary
export const selectFinanceFormOptions = (state: RootState) =>
  state.finance.formOptions

export const selectPlannedIncomes = (state: RootState) =>
  state.finance.plan?.incomes ?? []

export const selectPlannedExpenses = (state: RootState) =>
  state.finance.plan?.expenses ?? []

export const selectPlannedIncomeById =
  (id: string) =>
  (state: RootState) =>
    state.finance.plan?.incomes.find((income) => income.id === id) ?? null

export const selectPlannedExpenseById =
  (id: string) =>
  (state: RootState) =>
    state.finance.plan?.expenses.find((expense) => expense.id === id) ?? null

export const selectReceivedIncomes = (state: RootState) =>
  (state.finance.plan?.incomes ?? []).filter((income) => income.isReceived)

export const selectPendingIncomes = (state: RootState) =>
  (state.finance.plan?.incomes ?? []).filter((income) => !income.isReceived)

export const selectPaidExpenses = (state: RootState) =>
  (state.finance.plan?.expenses ?? []).filter((expense) => expense.isPaid)

export const selectPendingExpenses = (state: RootState) =>
  (state.finance.plan?.expenses ?? []).filter((expense) => !expense.isPaid)

export const selectMonthlyBillsExpenses = (state: RootState) =>
  (state.finance.plan?.expenses ?? []).filter(
    (expense) => expense.expenseBucket === "MONTHLY_BILLS"
  )

export const selectCreditCardExpenses = (state: RootState) =>
  (state.finance.plan?.expenses ?? []).filter(
    (expense) => expense.expenseBucket === "CREDIT_CARD"
  )

export const selectFixedCardExpenses = (state: RootState) =>
  (state.finance.plan?.expenses ?? []).filter(
    (expense) => expense.expenseBucket === "FIXED_CARD"
  )

export const selectOtherExpenses = (state: RootState) =>
  (state.finance.plan?.expenses ?? []).filter(
    (expense) => expense.expenseBucket === "OTHER"
  )

export const selectPaymentMethodsOptions = (state: RootState) =>
  state.finance.formOptions?.paymentMethods ?? []

export const selectSubscriptionsOptions = (state: RootState) =>
  state.finance.formOptions?.subscriptions ?? []

export const selectSummaryIncomeTotal = (state: RootState) =>
  toNumber(state.finance.summary?.incomeTotal)

export const selectSummaryReceivedTotal = (state: RootState) =>
  toNumber(state.finance.summary?.receivedTotal)

export const selectSummaryExpenseTotal = (state: RootState) =>
  toNumber(state.finance.summary?.expenseTotal)

export const selectSummaryPaidTotal = (state: RootState) =>
  toNumber(state.finance.summary?.paidTotal)

export const selectSummarySubscriptionTotal = (state: RootState) =>
  toNumber(state.finance.summary?.subscriptionTotal)

export const selectSummaryCreditCardTotal = (state: RootState) =>
  toNumber(state.finance.summary?.creditCardTotal)

export const selectSummaryBalance = (state: RootState) =>
  toNumber(state.finance.summary?.balance)

export const selectSummaryPendingIncomeTotal = (state: RootState) =>
  toNumber(state.finance.summary?.pendingIncomeTotal)

export const selectSummaryPendingExpenseTotal = (state: RootState) =>
  toNumber(state.finance.summary?.pendingExpenseTotal)

export const selectIsFinancePlanReady = (state: RootState) =>
  Boolean(state.finance.plan)

export const selectIsFinanceSummaryReady = (state: RootState) =>
  Boolean(state.finance.summary)

export const selectIsFinanceFormOptionsReady = (state: RootState) =>
  Boolean(state.finance.formOptions)
