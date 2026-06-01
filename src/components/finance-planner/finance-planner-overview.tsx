"use client"

import { format } from "date-fns"
import { enUS, ptBR } from "date-fns/locale"
import { useLocale, useTranslations } from "next-intl"
import type { FormEvent } from "react"
import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CardCostsContent } from "./card-costs-content"
import { emptyCardCostForm, emptyExpenseForm, emptyIncomeForm } from "./constants"
import { DeleteExpenseDialog } from "./delete-expense-dialog"
import { ExpenseContent } from "./expense-content"
import { IncomeContent } from "./income-content"
import { MonthSelector } from "./month-selector"
import { PlannerEntryDialog } from "./planner-entry-dialog"
import { PlanningToolbar } from "./planning-toolbar"
import { SummaryCard } from "./summary-card"
import type {
  ActiveTab,
  CardCostForm,
  ExpenseForm,
  IncomeForm,
  PlannedExpense,
  PlannedIncome,
  ViewMode,
} from "./types"
import { toDateInput, toDateOrUndefined, toOptionalNumber } from "./utils"
import {
  createPlannedExpenseAction,
  createPlannedIncomeAction,
  deletePlannedExpenseAction,
  deletePlannedIncomeAction,
  fetchFinanceFormOptions,
  fetchMonthlyPlan,
  setSelectedMonth,
  updatePlannedExpenseAction,
  updatePlannedIncomeAction,
} from "@/store/features/finance"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import {
  selectCreditCardExpenses,
  selectFinanceError,
  selectFinanceLoading,
  selectPaymentMethodsOptions,
  selectPlannedExpenses,
  selectPlannedIncomes,
  selectSelectedMonth,
  selectSelectedYear,
  selectSummaryBalance,
  selectSummaryCreditCardTotal,
  selectSummaryExpenseTotal,
  selectSummaryIncomeTotal,
  selectSummarySubscriptionTotal,
} from "@/store/selectors"

export function FinancePlannerBoard() {
  const dispatch = useAppDispatch()
  const locale = useLocale()
  const t = useTranslations("financePlannerPage")
  const dateLocale = locale === "pt" ? ptBR : enUS

  const selectedYear = useAppSelector(selectSelectedYear)
  const selectedMonth = useAppSelector(selectSelectedMonth)
  const isLoading = useAppSelector(selectFinanceLoading)
  const error = useAppSelector(selectFinanceError)
  const incomes = useAppSelector(selectPlannedIncomes)
  const expenses = useAppSelector(selectPlannedExpenses)
  const cardCosts = useAppSelector(selectCreditCardExpenses)
  const paymentMethods = useAppSelector(selectPaymentMethodsOptions)
  const totals = {
    income: useAppSelector(selectSummaryIncomeTotal),
    expense: useAppSelector(selectSummaryExpenseTotal),
    subscriptions: useAppSelector(selectSummarySubscriptionTotal),
    cards: useAppSelector(selectSummaryCreditCardTotal),
    balance: useAppSelector(selectSummaryBalance),
  }

  const [monthInput, setMonthInput] = useState(String(selectedMonth))
  const [yearInput, setYearInput] = useState(String(selectedYear))
  const [activeTab, setActiveTab] = useState<ActiveTab>("income")
  const [viewMode, setViewMode] = useState<ViewMode>("cards")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingIncomeId, setEditingIncomeId] = useState<string | null>(null)
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null)
  const [incomeForm, setIncomeForm] = useState<IncomeForm>(emptyIncomeForm)
  const [expenseForm, setExpenseForm] = useState<ExpenseForm>(emptyExpenseForm)
  const [cardCostForm, setCardCostForm] = useState<CardCostForm>(emptyCardCostForm)
  const [formError, setFormError] = useState<string | null>(null)
  const [pendingDeleteExpense, setPendingDeleteExpense] = useState<PlannedExpense | null>(null)

  useEffect(() => {
    dispatch(fetchMonthlyPlan({ year: selectedYear, month: selectedMonth }))
    dispatch(fetchFinanceFormOptions())
  }, [dispatch, selectedMonth, selectedYear])

  const monthLabel = format(new Date(selectedYear, selectedMonth - 1, 1), "LLLL / yyyy", {
    locale: dateLocale,
  })
  const manualExpenses = useMemo(
    () => expenses.filter((expense) => expense.expenseBucket !== "CREDIT_CARD"),
    [expenses]
  )
  const cardMethods = useMemo(
    () => paymentMethods.filter((method) => method.type === "CREDIT_CARD" && method.paymentCard),
    [paymentMethods]
  )

  function applyMonthFilter() {
    const year = Number(yearInput)
    const month = Number(monthInput)
    if (Number.isNaN(year) || Number.isNaN(month) || month < 1 || month > 12) return
    dispatch(setSelectedMonth({ year, month }))
  }

  function openCreateDialog() {
    setFormError(null)
    setEditingIncomeId(null)
    setEditingExpenseId(null)
    setIncomeForm(emptyIncomeForm)
    setExpenseForm(emptyExpenseForm)
    setCardCostForm({
      ...emptyCardCostForm,
      paymentMethodId: cardMethods[0]?.id ?? "",
    })
    setDialogOpen(true)
  }

  function openIncomeEdit(row: PlannedIncome) {
    setActiveTab("income")
    setFormError(null)
    setEditingIncomeId(row.id)
    setEditingExpenseId(null)
    setIncomeForm({
      name: row.name,
      amount: row.amount,
      currency: row.currency,
      expectedDate: toDateInput(row.expectedDate),
      isReceived: row.isReceived,
    })
    setDialogOpen(true)
  }

  function openExpenseEdit(row: PlannedExpense) {
    const isCardCost = row.expenseBucket === "CREDIT_CARD"
    setActiveTab(isCardCost ? "cardCosts" : "expenses")
    setFormError(null)
    setEditingExpenseId(row.id)
    setEditingIncomeId(null)

    if (isCardCost) {
      setCardCostForm({
        name: row.name,
        merchantName: row.merchantName ?? "",
        description: row.description ?? "",
        amount: row.amount,
        currency: row.currency,
        purchaseDate: toDateInput(row.purchaseDate),
        dueDate: toDateInput(row.dueDate),
        paymentMethodId: row.paymentMethodId ?? "",
        isInstallment: Boolean(row.installmentNumber && row.installmentTotal),
        installmentNumber: row.installmentNumber?.toString() ?? "",
        installmentTotal: row.installmentTotal?.toString() ?? "",
        isPaid: row.isPaid,
      })
    } else {
      setExpenseForm({
        name: row.name,
        merchantName: row.merchantName ?? "",
        description: row.description ?? "",
        amount: row.amount,
        currency: row.currency,
        expenseBucket: row.expenseBucket,
        dueDate: toDateInput(row.dueDate),
        purchaseDate: toDateInput(row.purchaseDate),
        isPaid: row.isPaid,
        paymentMethodId: row.paymentMethodId ?? "",
        isInstallment: Boolean(row.installmentNumber && row.installmentTotal),
        isMonthlyRecurring: row.recurrenceKind === "MONTHLY_RECURRING",
        installmentNumber: row.installmentNumber?.toString() ?? "",
        installmentTotal: row.installmentTotal?.toString() ?? "",
      })
    }

    setDialogOpen(true)
  }

  async function saveIncome(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)
    if (!incomeForm.name.trim() || Number(incomeForm.amount) <= 0) {
      setFormError(t("form.validation"))
      return
    }

    const current = incomes.find((income) => income.id === editingIncomeId)
    const data = {
      year: selectedYear,
      month: selectedMonth,
      name: incomeForm.name.trim(),
      amount: Number(incomeForm.amount),
      currency: incomeForm.currency,
      expectedDate: toDateOrUndefined(incomeForm.expectedDate),
      isReceived: incomeForm.isReceived,
      receivedAt: incomeForm.isReceived
        ? current?.receivedAt
          ? new Date(current.receivedAt)
          : new Date()
        : null,
    }

    if (editingIncomeId) {
      await dispatch(updatePlannedIncomeAction({ id: editingIncomeId, data })).unwrap()
    } else {
      await dispatch(createPlannedIncomeAction(data)).unwrap()
    }

    closeDialog()
  }

  async function saveExpense(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)
    if (!expenseForm.name.trim() || Number(expenseForm.amount) <= 0) {
      setFormError(t("form.validation"))
      return
    }
    if (
      expenseForm.isInstallment &&
      (!expenseForm.installmentNumber || !expenseForm.installmentTotal)
    ) {
      setFormError(t("form.installmentValidation"))
      return
    }

    const current = manualExpenses.find((expense) => expense.id === editingExpenseId)
    const method = paymentMethods.find((item) => item.id === expenseForm.paymentMethodId)
    const data = {
      year: selectedYear,
      month: selectedMonth,
      name: expenseForm.name.trim(),
      merchantName: expenseForm.merchantName.trim() || null,
      description: expenseForm.description.trim() || null,
      amount: Number(expenseForm.amount),
      currency: expenseForm.currency,
      expenseBucket: expenseForm.expenseBucket,
      dueDate: toDateOrUndefined(expenseForm.dueDate),
      purchaseDate: toDateOrUndefined(expenseForm.purchaseDate),
      isPaid: expenseForm.isPaid,
      paidAt: expenseForm.isPaid
        ? current?.paidAt
          ? new Date(current.paidAt)
          : new Date()
        : null,
      paymentMethodId: method?.id ?? null,
      paymentCardId: method?.paymentCard?.id ?? null,
      installmentNumber: expenseForm.isInstallment
        ? toOptionalNumber(expenseForm.installmentNumber)
        : null,
      installmentTotal: expenseForm.isInstallment
        ? toOptionalNumber(expenseForm.installmentTotal)
        : null,
      createFutureInstallments: !editingExpenseId && expenseForm.isInstallment,
      createMonthlyRecurring: !editingExpenseId && expenseForm.isMonthlyRecurring,
    }

    if (editingExpenseId) {
      await dispatch(updatePlannedExpenseAction({ id: editingExpenseId, data })).unwrap()
    } else {
      await dispatch(createPlannedExpenseAction(data)).unwrap()
    }

    closeDialog()
  }

  async function saveCardCost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)
    if (!cardCostForm.name.trim() || Number(cardCostForm.amount) <= 0) {
      setFormError(t("form.validation"))
      return
    }
    if (
      cardCostForm.isInstallment &&
      (!cardCostForm.installmentNumber || !cardCostForm.installmentTotal)
    ) {
      setFormError(t("form.installmentValidation"))
      return
    }

    const method = cardMethods.find((item) => item.id === cardCostForm.paymentMethodId)
    if (!method?.paymentCard) {
      setFormError(t("cards.noCards"))
      return
    }

    const current = cardCosts.find((expense) => expense.id === editingExpenseId)
    const data = {
      year: selectedYear,
      month: selectedMonth,
      name: cardCostForm.name.trim(),
      merchantName: cardCostForm.merchantName.trim() || null,
      description: cardCostForm.description.trim() || null,
      amount: Number(cardCostForm.amount),
      currency: cardCostForm.currency,
      expenseBucket: "CREDIT_CARD",
      paymentMethodId: method.id,
      paymentCardId: method.paymentCard.id,
      purchaseDate: toDateOrUndefined(cardCostForm.purchaseDate),
      dueDate: toDateOrUndefined(cardCostForm.dueDate),
      installmentNumber: cardCostForm.isInstallment
        ? toOptionalNumber(cardCostForm.installmentNumber)
        : null,
      installmentTotal: cardCostForm.isInstallment
        ? toOptionalNumber(cardCostForm.installmentTotal)
        : null,
      createFutureInstallments: !editingExpenseId && cardCostForm.isInstallment,
      isPaid: cardCostForm.isPaid,
      paidAt: cardCostForm.isPaid
        ? current?.paidAt
          ? new Date(current.paidAt)
          : new Date()
        : null,
    }

    if (editingExpenseId) {
      await dispatch(updatePlannedExpenseAction({ id: editingExpenseId, data })).unwrap()
    } else {
      await dispatch(createPlannedExpenseAction(data)).unwrap()
    }

    closeDialog()
  }

  async function toggleIncome(row: PlannedIncome) {
    await dispatch(
      updatePlannedIncomeAction({
        id: row.id,
        data: { isReceived: !row.isReceived, receivedAt: row.isReceived ? null : new Date() },
      })
    ).unwrap()
  }

  async function toggleExpense(row: PlannedExpense) {
    await dispatch(
      updatePlannedExpenseAction({
        id: row.id,
        data: { isPaid: !row.isPaid, paidAt: row.isPaid ? null : new Date() },
      })
    ).unwrap()
  }

  async function removeIncome(row: PlannedIncome) {
    if (!window.confirm(t("form.confirmDelete"))) return
    await dispatch(deletePlannedIncomeAction(row.id)).unwrap()
  }

  async function removeExpense(row: PlannedExpense) {
    if (row.recurrenceGroupId) {
      setPendingDeleteExpense(row)
      return
    }
    if (!window.confirm(t("form.confirmDelete"))) return
    await dispatch(deletePlannedExpenseAction(row.id)).unwrap()
  }

  async function confirmDeleteExpense(mode: "single" | "future") {
    if (!pendingDeleteExpense) return
    await dispatch(
      deletePlannedExpenseAction({ id: pendingDeleteExpense.id, mode })
    ).unwrap()
    setPendingDeleteExpense(null)
  }

  function closeDialog() {
    setDialogOpen(false)
    setEditingIncomeId(null)
    setEditingExpenseId(null)
    setFormError(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <MonthSelector
          monthInput={monthInput}
          yearInput={yearInput}
          setMonthInput={setMonthInput}
          setYearInput={setYearInput}
          onApply={applyMonthFilter}
          isLoading={isLoading}
          t={t}
        />
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <SummaryCard title={t("summary.incomeTotal")} value={totals.income} />
        <SummaryCard title={t("summary.expenseTotal")} value={totals.expense} />
        <SummaryCard title={t("summary.subscriptionTotal")} value={totals.subscriptions} />
        <SummaryCard title={t("summary.creditCardTotal")} value={totals.cards} />
        <SummaryCard
          title={t("summary.balance")}
          value={totals.balance}
          positive={totals.balance >= 0}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("monthPlan", { month: monthLabel })}</CardTitle>
          <p className="max-w-2xl text-sm text-muted-foreground">
            {t("planning.description")}
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          <PlanningToolbar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            viewMode={viewMode}
            setViewMode={setViewMode}
            onAdd={openCreateDialog}
            t={t}
          />

          {activeTab === "income" ? (
            <IncomeContent
              rows={incomes}
              viewMode={viewMode}
              onToggle={toggleIncome}
              onEdit={openIncomeEdit}
              onDelete={removeIncome}
              t={t}
            />
          ) : null}

          {activeTab === "expenses" ? (
            <ExpenseContent
              rows={manualExpenses}
              viewMode={viewMode}
              onToggle={toggleExpense}
              onEdit={openExpenseEdit}
              onDelete={removeExpense}
              t={t}
            />
          ) : null}

          {activeTab === "cardCosts" ? (
            <CardCostsContent
              rows={cardCosts}
              viewMode={viewMode}
              onToggle={toggleExpense}
              onEdit={openExpenseEdit}
              onDelete={removeExpense}
              t={t}
              dateLocale={dateLocale}
            />
          ) : null}
        </CardContent>
      </Card>

      <PlannerEntryDialog
        activeTab={activeTab}
        open={dialogOpen}
        onOpenChange={(open) => (open ? setDialogOpen(true) : closeDialog())}
        isEditing={Boolean(editingIncomeId || editingExpenseId)}
        formError={formError}
        incomeForm={incomeForm}
        setIncomeForm={setIncomeForm}
        expenseForm={expenseForm}
        setExpenseForm={setExpenseForm}
        cardCostForm={cardCostForm}
        setCardCostForm={setCardCostForm}
        paymentMethods={paymentMethods}
        cardMethods={cardMethods}
        onSaveIncome={saveIncome}
        onSaveExpense={saveExpense}
        onSaveCardCost={saveCardCost}
        isLoading={isLoading}
        t={t}
      />
      <DeleteExpenseDialog
        row={pendingDeleteExpense}
        open={Boolean(pendingDeleteExpense)}
        onOpenChange={(open) => {
          if (!open) setPendingDeleteExpense(null)
        }}
        onDeleteSingle={() => confirmDeleteExpense("single")}
        onDeleteFuture={() => confirmDeleteExpense("future")}
        t={t}
      />
    </div>
  )
}
