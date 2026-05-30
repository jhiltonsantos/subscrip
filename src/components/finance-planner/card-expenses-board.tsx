"use client"

import { format } from "date-fns"
import type { Locale } from "date-fns"
import { enUS, ptBR } from "date-fns/locale"
import { ArrowLeft, CreditCard, LayoutGrid, List, Plus, Settings } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import type { Dispatch, FormEvent, SetStateAction } from "react"
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
  deletePlannedExpenseAction,
  fetchFinanceFormOptions,
  fetchMonthlyPlan,
  setSelectedMonth,
  updatePlannedExpenseAction,
} from "@/store/features/finance"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import {
  selectCreditCardExpenses,
  selectFinanceError,
  selectFinanceLoading,
  selectPaymentMethodsOptions,
  selectSelectedMonth,
  selectSelectedYear,
  selectSummaryCreditCardTotal,
} from "@/store/selectors"

type PlannedExpenseRow = SerializedMonthlyPlan["expenses"][number]
type PaymentMethodOption = FinancePlannerFormOptions["paymentMethods"][number]
type CardMethod = PaymentMethodOption & {
  paymentCard: NonNullable<PaymentMethodOption["paymentCard"]>
}
type ViewMode = "cards" | "list"
type TranslationFn = ReturnType<typeof useTranslations>

type CardPurchaseFormState = {
  name: string
  amount: string
  currency: string
  purchaseDate: string
  dueDate: string
  installmentNumber: string
  installmentTotal: string
  isPaid: boolean
}

const currencies = ["BRL", "USD", "EUR"] as const

const emptyPurchaseForm: CardPurchaseFormState = {
  name: "",
  amount: "",
  currency: "BRL",
  purchaseDate: "",
  dueDate: "",
  installmentNumber: "",
  installmentTotal: "",
  isPaid: false,
}

export function CardExpensesBoard() {
  const dispatch = useAppDispatch()
  const locale = useLocale()
  const t = useTranslations("financePlannerPage")
  const dateLocale = locale === "pt" ? ptBR : enUS

  const selectedYear = useAppSelector(selectSelectedYear)
  const selectedMonth = useAppSelector(selectSelectedMonth)
  const isLoading = useAppSelector(selectFinanceLoading)
  const error = useAppSelector(selectFinanceError)
  const paymentMethods = useAppSelector(selectPaymentMethodsOptions)
  const creditCardExpenses = useAppSelector(selectCreditCardExpenses)
  const creditCardTotal = useAppSelector(selectSummaryCreditCardTotal)

  const [yearInput, setYearInput] = useState(String(selectedYear))
  const [monthInput, setMonthInput] = useState(String(selectedMonth))
  const [viewMode, setViewMode] = useState<ViewMode>("cards")
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    dispatch(fetchMonthlyPlan({ year: selectedYear, month: selectedMonth }))
    dispatch(fetchFinanceFormOptions())
  }, [dispatch, selectedYear, selectedMonth])

  const cards = useMemo<CardMethod[]>(
    () =>
      paymentMethods.filter(
        (method): method is CardMethod => method.type === "CREDIT_CARD" && !!method.paymentCard
      ),
    [paymentMethods]
  )

  const expensesByCard = useMemo(() => {
    const map = new Map<string, PlannedExpenseRow[]>()
    for (const expense of creditCardExpenses) {
      const key = expense.paymentCardId ?? expense.paymentMethodId ?? "unknown-card"
      const current = map.get(key)
      if (current) current.push(expense)
      else map.set(key, [expense])
    }
    return map
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

  async function createCardPurchase(card: CardMethod, form: CardPurchaseFormState) {
    setFormError(null)
    if (!form.name.trim() || Number(form.amount) <= 0) {
      setFormError(t("form.validation"))
      return
    }

    await dispatch(
      createPlannedExpenseAction({
        year: selectedYear,
        month: selectedMonth,
        name: form.name.trim(),
        amount: Number(form.amount),
        currency: form.currency,
        expenseBucket: "CREDIT_CARD",
        paymentMethodId: card.id,
        paymentCardId: card.paymentCard.id,
        purchaseDate: toDateOrUndefined(form.purchaseDate),
        dueDate: toDateOrUndefined(form.dueDate),
        installmentNumber: toOptionalNumber(form.installmentNumber),
        installmentTotal: toOptionalNumber(form.installmentTotal),
        isPaid: form.isPaid,
        paidAt: form.isPaid ? new Date() : null,
      })
    ).unwrap()
  }

  async function togglePaid(expense: PlannedExpenseRow) {
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

  async function removeExpense(expense: PlannedExpenseRow) {
    if (!window.confirm(t("form.confirmDelete"))) return
    await dispatch(deletePlannedExpenseAction(expense.id)).unwrap()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Button asChild variant="ghost" className="-ml-3 mb-2">
            <LocaleLink href="/finance-planner">
              <ArrowLeft className="size-4" />
              {t("cards.backToPlanner")}
            </LocaleLink>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{t("cards.pageTitle")}</h1>
          <p className="text-muted-foreground">
            {t("cards.pageSubtitle", { month: monthLabel })}
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-2">
          <MonthSelector
            monthInput={monthInput}
            yearInput={yearInput}
            setMonthInput={setMonthInput}
            setYearInput={setYearInput}
            onApply={applyMonthFilter}
            isLoading={isLoading}
            t={t}
          />
          <ViewToggle value={viewMode} onChange={setViewMode} t={t} />
        </div>
      </div>

      {error || formError ? (
        <p className="text-sm text-destructive" role="alert">
          {formError ?? error}
        </p>
      ) : null}

      <Card>
        <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t("summary.creditCardTotal")}
            </p>
            <p className="mt-1 text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(creditCardTotal, "BRL")}
            </p>
          </div>
          <p className="max-w-xl text-sm text-muted-foreground">{t("cards.syncHint")}</p>
        </CardContent>
      </Card>

      {cards.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-14 text-center">
            <Settings className="mb-3 size-8 text-muted-foreground" />
            <p className="max-w-md text-sm text-muted-foreground">
              {t("cards.noCards")}
            </p>
            <Button asChild className="mt-4">
              <LocaleLink href="/settings">{t("cards.managePaymentMethods")}</LocaleLink>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
          {cards.map((card) => (
            <CardColumn
              key={card.paymentCard.id}
              card={card}
              rows={expensesByCard.get(card.paymentCard.id) ?? []}
              viewMode={viewMode}
              isLoading={isLoading}
              onCreate={createCardPurchase}
              onTogglePaid={togglePaid}
              onDelete={removeExpense}
              t={t}
              dateLocale={dateLocale}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function CardColumn({
  card,
  rows,
  viewMode,
  isLoading,
  onCreate,
  onTogglePaid,
  onDelete,
  t,
  dateLocale,
}: {
  card: CardMethod
  rows: PlannedExpenseRow[]
  viewMode: ViewMode
  isLoading: boolean
  onCreate: (card: CardMethod, form: CardPurchaseFormState) => Promise<void>
  onTogglePaid: (expense: PlannedExpenseRow) => Promise<void>
  onDelete: (expense: PlannedExpenseRow) => Promise<void>
  t: TranslationFn
  dateLocale: Locale
}) {
  const [form, setForm] = useState(emptyPurchaseForm)
  const total = rows.reduce((sum, row) => sum + Number(row.amount), 0)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await onCreate(card, form)
    setForm(emptyPurchaseForm)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-3">
          <span className="flex min-w-0 items-center gap-2">
            <CreditCard className="size-4 text-emerald-600" />
            <span className="truncate">{card.paymentCard.nickname}</span>
          </span>
          <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(total, "BRL")}
          </span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {card.paymentCard.last4
            ? t("cards.endingIn", { last4: card.paymentCard.last4 })
            : card.name}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <CardPurchaseForm
          form={form}
          setForm={setForm}
          isLoading={isLoading}
          onSubmit={submit}
          t={t}
        />
        <CardPurchaseList
          rows={rows}
          viewMode={viewMode}
          onTogglePaid={onTogglePaid}
          onDelete={onDelete}
          t={t}
          dateLocale={dateLocale}
        />
      </CardContent>
    </Card>
  )
}

function CardPurchaseForm({
  form,
  setForm,
  isLoading,
  onSubmit,
  t,
}: {
  form: CardPurchaseFormState
  setForm: Dispatch<SetStateAction<CardPurchaseFormState>>
  isLoading: boolean
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  t: TranslationFn
}) {
  return (
    <form onSubmit={onSubmit} className="rounded-lg border bg-muted/20 p-3">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <Plus className="size-4 text-emerald-600" />
        {t("cards.addPurchase")}
      </h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          value={form.name}
          onChange={(event) =>
            setForm((current) => ({ ...current, name: event.target.value }))
          }
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
          value={form.purchaseDate}
          onChange={(event) =>
            setForm((current) => ({ ...current, purchaseDate: event.target.value }))
          }
        />
        <Input
          type="date"
          value={form.dueDate}
          onChange={(event) =>
            setForm((current) => ({ ...current, dueDate: event.target.value }))
          }
        />
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            min={1}
            value={form.installmentNumber}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                installmentNumber: event.target.value,
              }))
            }
            placeholder={t("cards.installmentNumber")}
          />
          <Input
            type="number"
            min={1}
            value={form.installmentTotal}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                installmentTotal: event.target.value,
              }))
            }
            placeholder={t("cards.installmentTotal")}
          />
        </div>
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
      <Button type="submit" className="mt-3" disabled={isLoading}>
        {isLoading ? t("form.saving") : t("form.save")}
      </Button>
    </form>
  )
}

function CardPurchaseList({
  rows,
  viewMode,
  onTogglePaid,
  onDelete,
  t,
  dateLocale,
}: {
  rows: PlannedExpenseRow[]
  viewMode: ViewMode
  onTogglePaid: (expense: PlannedExpenseRow) => Promise<void>
  onDelete: (expense: PlannedExpenseRow) => Promise<void>
  t: TranslationFn
  dateLocale: Locale
}) {
  if (rows.length === 0) {
    return (
      <p className="rounded-lg border p-4 text-sm text-muted-foreground">
        {t("cards.emptyPurchases")}
      </p>
    )
  }

  if (viewMode === "list") {
    return (
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[520px] text-sm">
          <thead className="bg-muted/40">
            <tr className="border-b text-left">
              <th className="p-2 font-medium">{t("table.date")}</th>
              <th className="p-2 font-medium">{t("table.name")}</th>
              <th className="p-2 text-right font-medium">{t("table.amount")}</th>
              <th className="p-2 text-right font-medium">{t("table.installment")}</th>
              <th className="p-2 text-right font-medium">{t("table.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b last:border-0">
                <td className="p-2 text-muted-foreground">
                  {row.purchaseDate
                    ? format(new Date(row.purchaseDate), "P", { locale: dateLocale })
                    : "-"}
                </td>
                <td className="p-2">{row.name}</td>
                <td className="p-2 text-right">
                  {formatCurrency(Number(row.amount), row.currency)}
                </td>
                <td className="p-2 text-right text-muted-foreground">
                  {formatInstallment(row)}
                </td>
                <td className="p-2">
                  <PurchaseActions
                    row={row}
                    onTogglePaid={onTogglePaid}
                    onDelete={onDelete}
                    t={t}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="grid gap-2">
      {rows.map((row) => (
        <div key={row.id} className="rounded-lg border bg-background/60 p-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-medium">{row.name}</p>
              <p className="text-sm text-muted-foreground">
                {row.purchaseDate
                  ? format(new Date(row.purchaseDate), "P", { locale: dateLocale })
                  : t("cards.noPurchaseDate")}
                {" · "}
                {formatInstallment(row)}
              </p>
            </div>
            <p className="font-semibold">{formatCurrency(Number(row.amount), row.currency)}</p>
          </div>
          <div className="mt-3">
            <PurchaseActions row={row} onTogglePaid={onTogglePaid} onDelete={onDelete} t={t} />
          </div>
        </div>
      ))}
    </div>
  )
}

function PurchaseActions({
  row,
  onTogglePaid,
  onDelete,
  t,
}: {
  row: PlannedExpenseRow
  onTogglePaid: (expense: PlannedExpenseRow) => Promise<void>
  onDelete: (expense: PlannedExpenseRow) => Promise<void>
  t: TranslationFn
}) {
  return (
    <div className="flex flex-wrap justify-end gap-2">
      <Button type="button" size="sm" variant="outline" onClick={() => onTogglePaid(row)}>
        {row.isPaid ? t("expense.markPending") : t("expense.markPaid")}
      </Button>
      <Button type="button" size="sm" variant="ghost" onClick={() => onDelete(row)}>
        {t("form.delete")}
      </Button>
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
      <Button onClick={onApply} disabled={isLoading}>
        {isLoading ? t("filters.loading") : t("filters.apply")}
      </Button>
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
      <Button
        type="button"
        size="sm"
        variant={value === "cards" ? "default" : "ghost"}
        onClick={() => onChange("cards")}
      >
        <LayoutGrid className="size-4" />
        {t("view.cards")}
      </Button>
      <Button
        type="button"
        size="sm"
        variant={value === "list" ? "default" : "ghost"}
        onClick={() => onChange("list")}
      >
        <List className="size-4" />
        {t("view.list")}
      </Button>
    </div>
  )
}

function formatInstallment(row: PlannedExpenseRow) {
  return row.installmentNumber && row.installmentTotal
    ? `${row.installmentNumber}/${row.installmentTotal}`
    : "-"
}

function toDateOrUndefined(value: string) {
  return value ? new Date(`${value}T00:00:00`) : undefined
}

function toOptionalNumber(value: string) {
  return value ? Number(value) : undefined
}
