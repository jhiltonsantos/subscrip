import { format } from "date-fns"
import type { ActiveTab, PlannedExpense, TranslationFn } from "./types"

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

export function formatInstallment(row: PlannedExpense) {
  return row.installmentNumber && row.installmentTotal
    ? `${row.installmentNumber}/${row.installmentTotal}`
    : "-"
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
