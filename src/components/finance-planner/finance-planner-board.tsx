"use client"

import { useEffect, useMemo, useState } from "react"
import { format } from "date-fns"
import { ptBR, enUS } from "date-fns/locale"
import { useLocale, useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatCurrency } from "@/lib/utils/formatters"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
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
import type { SerializedMonthlyPlan } from "@/server/actions/finance-planner"

type PlannedIncomeRow = SerializedMonthlyPlan["incomes"][number]
type PlannedExpenseRow = SerializedMonthlyPlan["expenses"][number]
type IncomeFormState = {
  name: string
  amount: string
  currency: string
  expectedDate: string
  isReceived: boolean
}
type ExpenseFormState = {
  name: string
  amount: string
  currency: string
  expenseBucket: string
  dueDate: string
  purchaseDate: string
  isPaid: boolean
  paymentMethodId: string
}

const currencies = ["BRL", "USD", "EUR"] as const
const expenseBuckets = ["MONTHLY_BILLS", "FIXED_CARD", "CREDIT_CARD", "OTHER"] as const

const emptyIncomeForm: IncomeFormState = {
  name: "",
  amount: "",
  currency: "BRL",
  expectedDate: "",
  isReceived: false,
}

const emptyExpenseForm: ExpenseFormState = {
  name: "",
  amount: "",
  currency: "BRL",
  expenseBucket: "MONTHLY_BILLS",
  dueDate: "",
  purchaseDate: "",
  isPaid: false,
  paymentMethodId: "",
}

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
  const creditCardExpenses = useAppSelector(selectCreditCardExpenses)
  const paymentMethods = useAppSelector(selectPaymentMethodsOptions)

  const incomeTotal = useAppSelector(selectSummaryIncomeTotal)
  const expenseTotal = useAppSelector(selectSummaryExpenseTotal)
  const subscriptionTotal = useAppSelector(selectSummarySubscriptionTotal)
  const creditCardTotal = useAppSelector(selectSummaryCreditCardTotal)
  const balance = useAppSelector(selectSummaryBalance)

  const [yearInput, setYearInput] = useState(String(selectedYear))
  const [monthInput, setMonthInput] = useState(String(selectedMonth))
  const [incomeForm, setIncomeForm] = useState(emptyIncomeForm)
  const [expenseForm, setExpenseForm] = useState(emptyExpenseForm)
  const [editingIncomeId, setEditingIncomeId] = useState<string | null>(null)
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    dispatch(fetchMonthlyPlan({ year: selectedYear, month: selectedMonth }))
    dispatch(fetchFinanceFormOptions())
  }, [dispatch, selectedYear, selectedMonth])

  const groupedCardExpenses = useMemo(() => {
    const map = new Map<
      string,
      {
        key: string
        cardName: string
        rows: typeof creditCardExpenses
      }
    >()

    for (const expense of creditCardExpenses) {
      const cardName =
        expense.paymentCard?.nickname ??
        expense.paymentMethod?.name ??
        "Cartao sem identificacao"

      const key = expense.paymentCardId ?? expense.paymentMethodId ?? cardName
      const current = map.get(key)

      if (current) {
        current.rows.push(expense)
      } else {
        map.set(key, { key, cardName, rows: [expense] })
      }
    }

    return Array.from(map.values())
  }, [creditCardExpenses])

  const monthLabel = format(new Date(selectedYear, selectedMonth - 1, 1), "LLLL / yyyy", {
    locale: dateLocale,
  })

  function applyMonthFilter() {
    const nextYear = Number(yearInput)
    const nextMonth = Number(monthInput)

    if (
      Number.isNaN(nextYear) ||
      Number.isNaN(nextMonth) ||
      nextMonth < 1 ||
      nextMonth > 12
    ) {
      return
    }

    dispatch(setSelectedMonth({ year: nextYear, month: nextMonth }))
  }

  async function saveIncome(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)
    if (!incomeForm.name.trim() || Number(incomeForm.amount) <= 0) {
      setFormError(t("form.validation"))
      return
    }

    const current = incomes.find((income) => income.id === editingIncomeId)
    const payload = {
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
      await dispatch(
        updatePlannedIncomeAction({ id: editingIncomeId, data: payload })
      ).unwrap()
    } else {
      await dispatch(createPlannedIncomeAction(payload)).unwrap()
    }

    setIncomeForm(emptyIncomeForm)
    setEditingIncomeId(null)
  }

  async function saveExpense(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)
    if (!expenseForm.name.trim() || Number(expenseForm.amount) <= 0) {
      setFormError(t("form.validation"))
      return
    }

    const current = expenses.find((expense) => expense.id === editingExpenseId)
    const payload = {
      year: selectedYear,
      month: selectedMonth,
      name: expenseForm.name.trim(),
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
      paymentMethodId: expenseForm.paymentMethodId || null,
    }

    if (editingExpenseId) {
      await dispatch(
        updatePlannedExpenseAction({ id: editingExpenseId, data: payload })
      ).unwrap()
    } else {
      await dispatch(createPlannedExpenseAction(payload)).unwrap()
    }

    setExpenseForm(emptyExpenseForm)
    setEditingExpenseId(null)
  }

  function editIncome(income: PlannedIncomeRow) {
    setEditingIncomeId(income.id)
    setIncomeForm({
      name: income.name,
      amount: income.amount,
      currency: income.currency,
      expectedDate: toDateInput(income.expectedDate),
      isReceived: income.isReceived,
    })
  }

  function editExpense(expense: PlannedExpenseRow) {
    setEditingExpenseId(expense.id)
    setExpenseForm({
      name: expense.name,
      amount: expense.amount,
      currency: expense.currency,
      expenseBucket: expense.expenseBucket,
      dueDate: toDateInput(expense.dueDate),
      purchaseDate: toDateInput(expense.purchaseDate),
      isPaid: expense.isPaid,
      paymentMethodId: expense.paymentMethodId ?? "",
    })
  }

  async function toggleIncomeReceived(income: PlannedIncomeRow) {
    await dispatch(
      updatePlannedIncomeAction({
        id: income.id,
        data: {
          isReceived: !income.isReceived,
          receivedAt: income.isReceived ? null : new Date(),
        },
      })
    ).unwrap()
  }

  async function toggleExpensePaid(expense: PlannedExpenseRow) {
    await dispatch(
      updatePlannedExpenseAction({
        id: expense.id,
        data: {
          isPaid: !expense.isPaid,
          paidAt: expense.isPaid ? null : new Date(),
        },
      })
    ).unwrap()
  }

  async function removeIncome(income: PlannedIncomeRow) {
    if (!window.confirm(t("form.confirmDelete"))) return
    await dispatch(deletePlannedIncomeAction(income.id)).unwrap()
  }

  async function removeExpense(expense: PlannedExpenseRow) {
    if (!window.confirm(t("form.confirmDelete"))) return
    await dispatch(deletePlannedExpenseAction(expense.id)).unwrap()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>

        <div className="flex items-end gap-2">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              {t("filters.month")}
            </label>
            <Input
              type="number"
              min={1}
              max={12}
              value={monthInput}
              onChange={(event) => setMonthInput(event.target.value)}
              className="w-20"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              {t("filters.year")}
            </label>
            <Input
              type="number"
              min={2000}
              max={2100}
              value={yearInput}
              onChange={(event) => setYearInput(event.target.value)}
              className="w-24"
            />
          </div>
          <Button onClick={applyMonthFilter} disabled={isLoading}>
            {isLoading ? t("filters.loading") : t("filters.apply")}
          </Button>
        </div>
      </div>

      {error || formError ? (
        <p className="text-sm text-destructive" role="alert">
          {formError ?? error}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <SummaryCard title={t("summary.incomeTotal")} value={incomeTotal} />
        <SummaryCard title={t("summary.expenseTotal")} value={expenseTotal} />
        <SummaryCard title={t("summary.subscriptionTotal")} value={subscriptionTotal} />
        <SummaryCard title={t("summary.creditCardTotal")} value={creditCardTotal} />
        <SummaryCard title={t("summary.balance")} value={balance} positive={balance >= 0} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>{t("monthPlan", { month: monthLabel })}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 lg:grid-cols-2">
            <section className="space-y-4">
              <EntryForm
                title={editingIncomeId ? t("income.editTitle") : t("income.createTitle")}
                form={incomeForm}
                setForm={setIncomeForm}
                onSubmit={saveIncome}
                onCancel={() => {
                  setIncomeForm(emptyIncomeForm)
                  setEditingIncomeId(null)
                }}
                isEditing={Boolean(editingIncomeId)}
                isLoading={isLoading}
                t={t}
              />

              <EntryList
                rows={incomes}
                empty={t("income.empty")}
                statusDone={t("income.received")}
                statusPending={t("income.pending")}
                onToggle={toggleIncomeReceived}
                onEdit={editIncome}
                onDelete={removeIncome}
                t={t}
              />
            </section>

            <section className="space-y-4">
              <ExpenseForm
                title={
                  editingExpenseId ? t("expense.editTitle") : t("expense.createTitle")
                }
                form={expenseForm}
                setForm={setExpenseForm}
                onSubmit={saveExpense}
                onCancel={() => {
                  setExpenseForm(emptyExpenseForm)
                  setEditingExpenseId(null)
                }}
                isEditing={Boolean(editingExpenseId)}
                isLoading={isLoading}
                paymentMethods={paymentMethods}
                t={t}
              />

              <ExpenseList
                rows={expenses}
                empty={t("expense.empty")}
                onToggle={toggleExpensePaid}
                onEdit={editExpense}
                onDelete={removeExpense}
                t={t}
              />
            </section>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("cards.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {groupedCardExpenses.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("cards.empty")}</p>
            ) : (
              groupedCardExpenses.map((group) => (
                <div key={group.key} className="overflow-x-auto rounded-lg border">
                  <div className="border-b bg-muted/40 px-3 py-2 text-sm font-medium">
                    {group.cardName}
                  </div>
                  <table className="w-full min-w-[420px] text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="p-2 font-medium">{t("table.date")}</th>
                        <th className="p-2 font-medium">{t("table.name")}</th>
                        <th className="p-2 text-right font-medium">
                          {t("table.amount")}
                        </th>
                        <th className="p-2 text-right font-medium">
                          {t("table.installment")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.rows.map((expense) => (
                        <tr key={expense.id} className="border-b last:border-0">
                          <td className="p-2 text-muted-foreground">
                            {expense.purchaseDate
                              ? format(new Date(expense.purchaseDate), "P", {
                                  locale: dateLocale,
                                })
                              : "-"}
                          </td>
                          <td className="p-2">{expense.name}</td>
                          <td className="p-2 text-right">
                            {formatCurrency(Number(expense.amount), expense.currency)}
                          </td>
                          <td className="p-2 text-right text-muted-foreground">
                            {expense.installmentNumber && expense.installmentTotal
                              ? `${expense.installmentNumber}/${expense.installmentTotal}`
                              : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

type TranslationFn = ReturnType<typeof useTranslations>

function EntryForm({
  title,
  form,
  setForm,
  onSubmit,
  onCancel,
  isEditing,
  isLoading,
  t,
}: {
  title: string
  form: IncomeFormState
  setForm: React.Dispatch<React.SetStateAction<IncomeFormState>>
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  onCancel: () => void
  isEditing: boolean
  isLoading: boolean
  t: TranslationFn
}) {
  return (
    <form onSubmit={onSubmit} className="rounded-lg border bg-muted/20 p-3">
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          value={form.name}
          onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          placeholder={t("form.name")}
        />
        <Input
          type="number"
          min="0"
          step="0.01"
          value={form.amount}
          onChange={(event) =>
            setForm((current) => ({ ...current, amount: event.target.value }))
          }
          placeholder={t("form.amount")}
        />
        <select
          value={form.currency}
          onChange={(event) =>
            setForm((current) => ({ ...current, currency: event.target.value }))
          }
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
        >
          {currencies.map((currency) => (
            <option key={currency} value={currency}>
              {currency}
            </option>
          ))}
        </select>
        <Input
          type="date"
          value={form.expectedDate}
          onChange={(event) =>
            setForm((current) => ({ ...current, expectedDate: event.target.value }))
          }
        />
      </div>
      <label className="mt-3 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.isReceived}
          onChange={(event) =>
            setForm((current) => ({ ...current, isReceived: event.target.checked }))
          }
        />
        {t("income.markReceived")}
      </label>
      <div className="mt-3 flex gap-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? t("form.saving") : t("form.save")}
        </Button>
        {isEditing ? (
          <Button type="button" variant="ghost" onClick={onCancel}>
            {t("form.cancel")}
          </Button>
        ) : null}
      </div>
    </form>
  )
}

function ExpenseForm({
  title,
  form,
  setForm,
  onSubmit,
  onCancel,
  isEditing,
  isLoading,
  paymentMethods,
  t,
}: {
  title: string
  form: ExpenseFormState
  setForm: React.Dispatch<React.SetStateAction<ExpenseFormState>>
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  onCancel: () => void
  isEditing: boolean
  isLoading: boolean
  paymentMethods: ReturnType<typeof selectPaymentMethodsOptions>
  t: TranslationFn
}) {
  return (
    <form onSubmit={onSubmit} className="rounded-lg border bg-muted/20 p-3">
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          value={form.name}
          onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          placeholder={t("form.name")}
        />
        <Input
          type="number"
          min="0"
          step="0.01"
          value={form.amount}
          onChange={(event) =>
            setForm((current) => ({ ...current, amount: event.target.value }))
          }
          placeholder={t("form.amount")}
        />
        <select
          value={form.expenseBucket}
          onChange={(event) =>
            setForm((current) => ({ ...current, expenseBucket: event.target.value }))
          }
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
        >
          {expenseBuckets.map((bucket) => (
            <option key={bucket} value={bucket}>
              {t(`buckets.${bucket}`)}
            </option>
          ))}
        </select>
        <select
          value={form.currency}
          onChange={(event) =>
            setForm((current) => ({ ...current, currency: event.target.value }))
          }
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
        >
          {currencies.map((currency) => (
            <option key={currency} value={currency}>
              {currency}
            </option>
          ))}
        </select>
        <Input
          type="date"
          value={form.dueDate}
          onChange={(event) =>
            setForm((current) => ({ ...current, dueDate: event.target.value }))
          }
        />
        <Input
          type="date"
          value={form.purchaseDate}
          onChange={(event) =>
            setForm((current) => ({ ...current, purchaseDate: event.target.value }))
          }
        />
        <select
          value={form.paymentMethodId}
          onChange={(event) =>
            setForm((current) => ({ ...current, paymentMethodId: event.target.value }))
          }
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm sm:col-span-2"
        >
          <option value="">{t("form.noPaymentMethod")}</option>
          {paymentMethods.map((method) => (
            <option key={method.id} value={method.id}>
              {method.paymentCard
                ? `${method.name} - ${method.paymentCard.nickname}`
                : method.name}
            </option>
          ))}
        </select>
      </div>
      <label className="mt-3 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.isPaid}
          onChange={(event) =>
            setForm((current) => ({ ...current, isPaid: event.target.checked }))
          }
        />
        {t("expense.markPaid")}
      </label>
      <div className="mt-3 flex gap-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? t("form.saving") : t("form.save")}
        </Button>
        {isEditing ? (
          <Button type="button" variant="ghost" onClick={onCancel}>
            {t("form.cancel")}
          </Button>
        ) : null}
      </div>
    </form>
  )
}

function EntryList({
  rows,
  empty,
  statusDone,
  statusPending,
  onToggle,
  onEdit,
  onDelete,
  t,
}: {
  rows: PlannedIncomeRow[]
  empty: string
  statusDone: string
  statusPending: string
  onToggle: (row: PlannedIncomeRow) => void
  onEdit: (row: PlannedIncomeRow) => void
  onDelete: (row: PlannedIncomeRow) => void
  t: TranslationFn
}) {
  if (rows.length === 0) {
    return <p className="rounded-lg border p-3 text-sm text-muted-foreground">{empty}</p>
  }

  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <div key={row.id} className="rounded-lg border p-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-medium">{row.name}</p>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(Number(row.amount), row.currency)}
              </p>
            </div>
            <span className="rounded-full bg-muted px-2 py-1 text-xs">
              {row.isReceived ? statusDone : statusPending}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => onToggle(row)}>
              {row.isReceived ? t("income.markPending") : t("income.markReceived")}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => onEdit(row)}>
              {t("form.edit")}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => onDelete(row)}>
              {t("form.delete")}
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

function ExpenseList({
  rows,
  empty,
  onToggle,
  onEdit,
  onDelete,
  t,
}: {
  rows: PlannedExpenseRow[]
  empty: string
  onToggle: (row: PlannedExpenseRow) => void
  onEdit: (row: PlannedExpenseRow) => void
  onDelete: (row: PlannedExpenseRow) => void
  t: TranslationFn
}) {
  if (rows.length === 0) {
    return <p className="rounded-lg border p-3 text-sm text-muted-foreground">{empty}</p>
  }

  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <div key={row.id} className="rounded-lg border p-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-medium">{row.name}</p>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(Number(row.amount), row.currency)} ·{" "}
                {t(`buckets.${row.expenseBucket}`)}
              </p>
            </div>
            <span className="rounded-full bg-muted px-2 py-1 text-xs">
              {row.isPaid ? t("expense.paid") : t("expense.pending")}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => onToggle(row)}>
              {row.isPaid ? t("expense.markPending") : t("expense.markPaid")}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => onEdit(row)}>
              {t("form.edit")}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => onDelete(row)}>
              {t("form.delete")}
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

function toDateInput(value: string | null) {
  return value ? format(new Date(value), "yyyy-MM-dd") : ""
}

function toDateOrUndefined(value: string) {
  return value ? new Date(`${value}T00:00:00`) : undefined
}

function SummaryCard({
  title,
  value,
  positive,
}: {
  title: string
  value: number
  positive?: boolean
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {title}
        </p>
        <p
          className={[
            "mt-2 text-lg font-semibold",
            positive === undefined ? "" : positive ? "text-emerald-600" : "text-red-600",
          ].join(" ")}
        >
          {formatCurrency(value, "BRL")}
        </p>
      </CardContent>
    </Card>
  )
}
