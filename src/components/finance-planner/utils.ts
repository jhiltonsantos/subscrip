import { format } from "date-fns"
import type { ActiveTab, PlannedExpense, PlannedIncome, TranslationFn } from "./types"

export function getDialogTitle(tab: ActiveTab, isEditing: boolean, t: TranslationFn) {
  if (tab === "income") return isEditing ? t("income.editTitle") : t("income.createTitle")
  if (tab === "expenses") return isEditing ? t("expense.editTitle") : t("expense.createTitle")
  return isEditing ? t("cards.editCost") : t("cards.addCost")
}

export function getDialogDescription(tab: ActiveTab, t: TranslationFn) {
  if (tab === "income") return t("modal.incomeDescription")
  if (tab === "expenses") return t("modal.expenseDescription")
  return t("modal.cardCostDescription")
}

export function getDialogFormId(tab: ActiveTab) {
  if (tab === "income") return "finance-income-form"
  if (tab === "expenses") return "finance-expense-form"
  return "finance-card-cost-form"
}

export function formatExpenseInstallment(row: PlannedExpense) {
  return row.installmentNumber && row.installmentTotal
    ? `${row.installmentNumber}/${row.installmentTotal}`
    : null
}

export function formatIncomeRecurrence(row: PlannedIncome) {
  return row.recurrenceNumber && row.recurrenceTotal
    ? `${row.recurrenceNumber}/${row.recurrenceTotal}`
    : null
}

export function toDateInput(value: string | null) {
  return value ? format(new Date(value), "yyyy-MM-dd") : ""
}

export function toDateOrUndefined(value: string) {
  return value ? new Date(`${value}T00:00:00`) : undefined
}

export function toOptionalNumber(value: string) {
  return value ? Number(value) : undefined
}

export function toCardDueDateInput(year: number, month: number, dueDay: number | null | undefined) {
  const day = dueDay ?? 1
  const lastDayOfMonth = new Date(year, month, 0).getDate()
  return format(new Date(year, month - 1, Math.min(day, lastDayOfMonth)), "yyyy-MM-dd")
}
