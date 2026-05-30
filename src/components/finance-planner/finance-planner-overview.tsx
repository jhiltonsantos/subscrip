"use client"

import { format } from "date-fns"
import { enUS, ptBR } from "date-fns/locale"
import { CreditCard, LayoutGrid, List, Plus } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import type { Dispatch, FormEvent, ReactNode, SetStateAction } from "react"
import { useEffect, useMemo, useState } from "react"
import { LocaleLink } from "@/components/global"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { formatCurrency } from "@/lib/utils/formatters"
import type {
  FinancePlannerFormOptions,
  SerializedMonthlyPlan,
} from "@/server/actions/finance-planner"
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

type PlannedIncome = SerializedMonthlyPlan["incomes"][number]
type PlannedExpense = SerializedMonthlyPlan["expenses"][number]
type PaymentMethodOption = FinancePlannerFormOptions["paymentMethods"][number]
type ViewMode = "cards" | "list"
type TranslationFn = ReturnType<typeof useTranslations>

type IncomeForm = {
  name: string
  amount: string
  currency: string
  expectedDate: string
  isReceived: boolean
}

type ExpenseForm = {
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

const emptyIncomeForm: IncomeForm = {
  name: "",
  amount: "",
  currency: "BRL",
  expectedDate: "",
  isReceived: false,
}

const emptyExpenseForm: ExpenseForm = {
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
  const paymentMethods = useAppSelector(selectPaymentMethodsOptions)
  const cardExpenses = useAppSelector(selectCreditCardExpenses)
  const totals = {
    income: useAppSelector(selectSummaryIncomeTotal),
    expense: useAppSelector(selectSummaryExpenseTotal),
    subscriptions: useAppSelector(selectSummarySubscriptionTotal),
    cards: useAppSelector(selectSummaryCreditCardTotal),
    balance: useAppSelector(selectSummaryBalance),
  }

  const [monthInput, setMonthInput] = useState(String(selectedMonth))
  const [yearInput, setYearInput] = useState(String(selectedYear))
  const [viewMode, setViewMode] = useState<ViewMode>("cards")
  const [incomeForm, setIncomeForm] = useState(emptyIncomeForm)
  const [expenseForm, setExpenseForm] = useState(emptyExpenseForm)
  const [editingIncomeId, setEditingIncomeId] = useState<string | null>(null)
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

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
  const cardGroups = useMemo(() => summarizeCards(cardExpenses), [cardExpenses])

  function applyMonthFilter() {
    const year = Number(yearInput)
    const month = Number(monthInput)
    if (Number.isNaN(year) || Number.isNaN(month) || month < 1 || month > 12) return
    dispatch(setSelectedMonth({ year, month }))
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
    setIncomeForm(emptyIncomeForm)
    setEditingIncomeId(null)
  }

  async function saveExpense(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)
    if (!expenseForm.name.trim() || Number(expenseForm.amount) <= 0) {
      setFormError(t("form.validation"))
      return
    }
    const current = expenses.find((expense) => expense.id === editingExpenseId)
    const method = paymentMethods.find((item) => item.id === expenseForm.paymentMethodId)
    const data = {
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
      paymentMethodId: method?.id ?? null,
      paymentCardId: method?.paymentCard?.id ?? null,
    }
    if (editingExpenseId) {
      await dispatch(updatePlannedExpenseAction({ id: editingExpenseId, data })).unwrap()
    } else {
      await dispatch(createPlannedExpenseAction(data)).unwrap()
    }
    setExpenseForm(emptyExpenseForm)
    setEditingExpenseId(null)
  }

  function editIncome(row: PlannedIncome) {
    setEditingIncomeId(row.id)
    setIncomeForm({
      name: row.name,
      amount: row.amount,
      currency: row.currency,
      expectedDate: toDateInput(row.expectedDate),
      isReceived: row.isReceived,
    })
  }

  function editExpense(row: PlannedExpense) {
    setEditingExpenseId(row.id)
    setExpenseForm({
      name: row.name,
      amount: row.amount,
      currency: row.currency,
      expenseBucket: row.expenseBucket,
      dueDate: toDateInput(row.dueDate),
      purchaseDate: toDateInput(row.purchaseDate),
      isPaid: row.isPaid,
      paymentMethodId: row.paymentMethodId ?? "",
    })
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
    if (!window.confirm(t("form.confirmDelete"))) return
    await dispatch(deletePlannedExpenseAction(row.id)).unwrap()
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
      {error || formError ? (
        <p className="text-sm text-destructive" role="alert">
          {formError ?? error}
        </p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <SummaryCard title={t("summary.incomeTotal")} value={totals.income} />
        <SummaryCard title={t("summary.expenseTotal")} value={totals.expense} />
        <SummaryCard title={t("summary.subscriptionTotal")} value={totals.subscriptions} />
        <SummaryCard title={t("summary.creditCardTotal")} value={totals.cards} />
        <SummaryCard title={t("summary.balance")} value={totals.balance} positive={totals.balance >= 0} />
      </div>
      <Card>
        <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>{t("monthPlan", { month: monthLabel })}</CardTitle>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              {t("planning.description")}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <ViewToggle value={viewMode} onChange={setViewMode} t={t} />
            <Button asChild variant="outline">
              <LocaleLink href="/finance-planner/cards">
                <CreditCard className="size-4" />
                {t("cards.cta")}
              </LocaleLink>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-6 xl:grid-cols-2">
          <section className="rounded-xl border bg-muted/10 p-3">
            <ColumnTitle>{t("income.columnTitle")}</ColumnTitle>
            <IncomeFormBox
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
            <IncomeRows
              rows={incomes}
              viewMode={viewMode}
              onToggle={toggleIncome}
              onEdit={editIncome}
              onDelete={removeIncome}
              t={t}
            />
          </section>
          <section className="rounded-xl border bg-muted/10 p-3">
            <ColumnTitle>{t("expense.columnTitle")}</ColumnTitle>
            <ExpenseFormBox
              title={editingExpenseId ? t("expense.editTitle") : t("expense.createTitle")}
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
            <ExpenseRows
              rows={manualExpenses}
              cardGroups={cardGroups}
              viewMode={viewMode}
              onToggle={toggleExpense}
              onEdit={editExpense}
              onDelete={removeExpense}
              t={t}
            />
          </section>
        </CardContent>
      </Card>
    </div>
  )
}

function MonthSelector({
  monthInput,
  yearInput,
  setMonthInput,
  setYearInput,
  onApply,
  isLoading,
  t,
}: {
  monthInput: string
  yearInput: string
  setMonthInput: (value: string) => void
  setYearInput: (value: string) => void
  onApply: () => void
  isLoading: boolean
  t: TranslationFn
}) {
  return (
    <div className="flex items-end gap-2">
      <NumberField label={t("filters.month")} value={monthInput} onChange={setMonthInput} className="w-20" />
      <NumberField label={t("filters.year")} value={yearInput} onChange={setYearInput} className="w-24" />
      <Button onClick={onApply} disabled={isLoading}>
        {isLoading ? t("filters.loading") : t("filters.apply")}
      </Button>
    </div>
  )
}

function NumberField({
  label,
  value,
  onChange,
  className,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  className?: string
}) {
  return (
    <div>
      <label className="mb-1 block text-xs text-muted-foreground">{label}</label>
      <Input
        type="number"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={className}
      />
    </div>
  )
}

function ViewToggle({
  value,
  onChange,
  t,
}: {
  value: ViewMode
  onChange: (value: ViewMode) => void
  t: TranslationFn
}) {
  return (
    <div className="inline-flex rounded-md border bg-background p-1">
      <Button type="button" size="sm" variant={value === "cards" ? "default" : "ghost"} onClick={() => onChange("cards")}>
        <LayoutGrid className="size-4" />
        {t("view.cards")}
      </Button>
      <Button type="button" size="sm" variant={value === "list" ? "default" : "ghost"} onClick={() => onChange("list")}>
        <List className="size-4" />
        {t("view.list")}
      </Button>
    </div>
  )
}

function ColumnTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </h2>
  )
}

function IncomeFormBox(props: {
  title: string
  form: IncomeForm
  setForm: Dispatch<SetStateAction<IncomeForm>>
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onCancel: () => void
  isEditing: boolean
  isLoading: boolean
  t: TranslationFn
}) {
  const { title, form, setForm, onSubmit, onCancel, isEditing, isLoading, t } = props
  return (
    <form onSubmit={onSubmit} className="mb-4 rounded-lg border bg-background/70 p-3 shadow-sm">
      <FormTitle>{title}</FormTitle>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder={t("form.name")} />
        <Input type="number" min="0" step="0.01" value={form.amount} onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))} placeholder={t("form.amount")} />
        <CurrencySelect value={form.currency} onChange={(currency) => setForm((current) => ({ ...current, currency }))} />
        <Input type="date" value={form.expectedDate} onChange={(event) => setForm((current) => ({ ...current, expectedDate: event.target.value }))} />
      </div>
      <CheckboxLine checked={form.isReceived} onChange={(checked) => setForm((current) => ({ ...current, isReceived: checked }))}>
        {t("income.markReceived")}
      </CheckboxLine>
      <FormActions isEditing={isEditing} isLoading={isLoading} onCancel={onCancel} t={t} />
    </form>
  )
}

function ExpenseFormBox(props: {
  title: string
  form: ExpenseForm
  setForm: Dispatch<SetStateAction<ExpenseForm>>
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onCancel: () => void
  isEditing: boolean
  isLoading: boolean
  paymentMethods: PaymentMethodOption[]
  t: TranslationFn
}) {
  const { title, form, setForm, onSubmit, onCancel, isEditing, isLoading, paymentMethods, t } = props
  return (
    <form onSubmit={onSubmit} className="mb-4 rounded-lg border bg-background/70 p-3 shadow-sm">
      <FormTitle>{title}</FormTitle>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder={t("form.name")} />
        <Input type="number" min="0" step="0.01" value={form.amount} onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))} placeholder={t("form.amount")} />
        <select value={form.expenseBucket} onChange={(event) => setForm((current) => ({ ...current, expenseBucket: event.target.value }))} className="h-9 rounded-md border border-input bg-transparent px-3 text-sm">
          {expenseBuckets.map((bucket) => (
            <option key={bucket} value={bucket}>{t(`buckets.${bucket}`)}</option>
          ))}
        </select>
        <CurrencySelect value={form.currency} onChange={(currency) => setForm((current) => ({ ...current, currency }))} />
        <Input type="date" value={form.dueDate} onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))} />
        <Input type="date" value={form.purchaseDate} onChange={(event) => setForm((current) => ({ ...current, purchaseDate: event.target.value }))} />
        <select value={form.paymentMethodId} onChange={(event) => setForm((current) => ({ ...current, paymentMethodId: event.target.value }))} className="h-9 rounded-md border border-input bg-transparent px-3 text-sm sm:col-span-2">
          <option value="">{t("form.noPaymentMethod")}</option>
          {paymentMethods.map((method) => (
            <option key={method.id} value={method.id}>
              {method.paymentCard ? `${method.name} - ${method.paymentCard.nickname}` : method.name}
            </option>
          ))}
        </select>
      </div>
      <CheckboxLine checked={form.isPaid} onChange={(checked) => setForm((current) => ({ ...current, isPaid: checked }))}>
        {t("expense.markPaid")}
      </CheckboxLine>
      <FormActions isEditing={isEditing} isLoading={isLoading} onCancel={onCancel} t={t} />
    </form>
  )
}

function FormTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
      <Plus className="size-4 text-emerald-600" />
      {children}
    </h3>
  )
}

function CurrencySelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value)} className="h-9 rounded-md border border-input bg-transparent px-3 text-sm">
      {currencies.map((currency) => (
        <option key={currency} value={currency}>{currency}</option>
      ))}
    </select>
  )
}

function CheckboxLine({ checked, onChange, children }: { checked: boolean; onChange: (checked: boolean) => void; children: ReactNode }) {
  return (
    <label className="mt-3 flex items-center gap-2 text-sm">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      {children}
    </label>
  )
}

function FormActions({ isEditing, isLoading, onCancel, t }: { isEditing: boolean; isLoading: boolean; onCancel: () => void; t: TranslationFn }) {
  return (
    <div className="mt-3 flex gap-2">
      <Button type="submit" disabled={isLoading}>{isLoading ? t("form.saving") : t("form.save")}</Button>
      {isEditing ? <Button type="button" variant="ghost" onClick={onCancel}>{t("form.cancel")}</Button> : null}
    </div>
  )
}

function IncomeRows(props: {
  rows: PlannedIncome[]
  viewMode: ViewMode
  onToggle: (row: PlannedIncome) => void
  onEdit: (row: PlannedIncome) => void
  onDelete: (row: PlannedIncome) => void
  t: TranslationFn
}) {
  const { rows, viewMode, onToggle, onEdit, onDelete, t } = props
  if (rows.length === 0) return <EmptyState>{t("income.empty")}</EmptyState>
  if (viewMode === "list") {
    return <SimpleTable rows={rows} t={t} renderMeta={(row) => row.isReceived ? t("income.received") : t("income.pending")} toggleLabel={(row) => row.isReceived ? t("income.markPending") : t("income.markReceived")} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} />
  }
  return (
    <div className="grid gap-2">
      {rows.map((row) => (
        <EntryCard key={row.id} title={row.name} meta={formatCurrency(Number(row.amount), row.currency)} status={row.isReceived ? t("income.received") : t("income.pending")}>
          <RowActions toggleLabel={row.isReceived ? t("income.markPending") : t("income.markReceived")} onToggle={() => onToggle(row)} onEdit={() => onEdit(row)} onDelete={() => onDelete(row)} t={t} />
        </EntryCard>
      ))}
    </div>
  )
}

function ExpenseRows(props: {
  rows: PlannedExpense[]
  cardGroups: ReturnType<typeof summarizeCards>
  viewMode: ViewMode
  onToggle: (row: PlannedExpense) => void
  onEdit: (row: PlannedExpense) => void
  onDelete: (row: PlannedExpense) => void
  t: TranslationFn
}) {
  const { rows, cardGroups, viewMode, onToggle, onEdit, onDelete, t } = props
  if (rows.length === 0 && cardGroups.length === 0) return <EmptyState>{t("expense.empty")}</EmptyState>
  return (
    <div className={viewMode === "cards" ? "grid gap-2" : "space-y-2"}>
      {cardGroups.map((group) => (
        <div key={group.key} className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="flex items-center gap-2 font-medium"><CreditCard className="size-4 text-emerald-600" />{group.name}</p>
              <p className="text-sm text-muted-foreground">{t("cards.purchaseCount", { count: group.count })}</p>
            </div>
            <p className="font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(group.amount, group.currency)}</p>
          </div>
          <Button asChild size="sm" variant="outline" className="mt-3">
            <LocaleLink href="/finance-planner/cards">{t("cards.open")}</LocaleLink>
          </Button>
        </div>
      ))}
      {viewMode === "list" ? (
        <SimpleTable rows={rows} t={t} renderMeta={(row) => t(`buckets.${row.expenseBucket}`)} toggleLabel={(row) => row.isPaid ? t("expense.markPending") : t("expense.markPaid")} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} />
      ) : rows.map((row) => (
        <EntryCard key={row.id} title={row.name} meta={`${formatCurrency(Number(row.amount), row.currency)} · ${t(`buckets.${row.expenseBucket}`)}`} status={row.isPaid ? t("expense.paid") : t("expense.pending")}>
          <RowActions toggleLabel={row.isPaid ? t("expense.markPending") : t("expense.markPaid")} onToggle={() => onToggle(row)} onEdit={() => onEdit(row)} onDelete={() => onDelete(row)} t={t} />
        </EntryCard>
      ))}
    </div>
  )
}

function SimpleTable<T extends { id: string; name: string; amount: string; currency: string }>(props: {
  rows: T[]
  t: TranslationFn
  renderMeta: (row: T) => string
  toggleLabel: (row: T) => string
  onToggle: (row: T) => void
  onEdit: (row: T) => void
  onDelete: (row: T) => void
}) {
  const { rows, t, renderMeta, toggleLabel, onToggle, onEdit, onDelete } = props
  return (
    <div className="overflow-x-auto rounded-lg border bg-background/60">
      <table className="w-full min-w-[560px] text-sm">
        <thead className="bg-muted/40">
          <tr className="border-b text-left">
            <th className="p-2 font-medium">{t("table.name")}</th>
            <th className="p-2 font-medium">{t("table.bucket")}</th>
            <th className="p-2 text-right font-medium">{t("table.amount")}</th>
            <th className="p-2 text-right font-medium">{t("table.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b last:border-0">
              <td className="p-2">{row.name}</td>
              <td className="p-2 text-muted-foreground">{renderMeta(row)}</td>
              <td className="p-2 text-right">{formatCurrency(Number(row.amount), row.currency)}</td>
              <td className="p-2">
                <RowActions toggleLabel={toggleLabel(row)} onToggle={() => onToggle(row)} onEdit={() => onEdit(row)} onDelete={() => onDelete(row)} t={t} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function EntryCard({ title, meta, status, children }: { title: string; meta: string; status: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border bg-background/60 p-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div><p className="font-medium">{title}</p><p className="text-sm text-muted-foreground">{meta}</p></div>
        <span className="rounded-full bg-muted px-2 py-1 text-xs">{status}</span>
      </div>
      <div className="mt-3">{children}</div>
    </div>
  )
}

function RowActions({ toggleLabel, onToggle, onEdit, onDelete, t }: { toggleLabel: string; onToggle: () => void; onEdit: () => void; onDelete: () => void; t: TranslationFn }) {
  return (
    <div className="flex flex-wrap justify-end gap-2">
      <Button type="button" size="sm" variant="outline" onClick={onToggle}>{toggleLabel}</Button>
      <Button type="button" size="sm" variant="ghost" onClick={onEdit}>{t("form.edit")}</Button>
      <Button type="button" size="sm" variant="ghost" onClick={onDelete}>{t("form.delete")}</Button>
    </div>
  )
}

function EmptyState({ children }: { children: ReactNode }) {
  return <p className="rounded-lg border p-4 text-sm text-muted-foreground">{children}</p>
}

function SummaryCard({ title, value, positive }: { title: string; value: number; positive?: boolean }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</p>
        <p className={["mt-2 text-lg font-semibold", positive === undefined ? "" : positive ? "text-emerald-600" : "text-red-600"].join(" ")}>
          {formatCurrency(value, "BRL")}
        </p>
      </CardContent>
    </Card>
  )
}

function summarizeCards(rows: PlannedExpense[]) {
  const map = new Map<string, { key: string; name: string; amount: number; currency: string; count: number }>()
  for (const row of rows) {
    const key = row.paymentCardId ?? row.paymentMethodId ?? "unknown-card"
    const name = row.paymentCard?.nickname ?? row.paymentMethod?.name ?? "Card"
    const current = map.get(key)
    if (current) {
      current.amount += Number(row.amount)
      current.count += 1
    } else {
      map.set(key, { key, name, amount: Number(row.amount), currency: row.currency, count: 1 })
    }
  }
  return Array.from(map.values())
}

function toDateInput(value: string | null) {
  return value ? format(new Date(value), "yyyy-MM-dd") : ""
}

function toDateOrUndefined(value: string) {
  return value ? new Date(`${value}T00:00:00`) : undefined
}
