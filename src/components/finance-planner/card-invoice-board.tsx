"use client"

import { format } from "date-fns"
import { enUS, ptBR } from "date-fns/locale"
import { Plus } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import type { FormEvent } from "react"
import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CardCostDialogForm } from "./card-cost-dialog-form"
import { CardCostsContent } from "./card-costs-content"
import { emptyCardCostForm } from "./constants"
import { DeleteConfirmDialog } from "./delete-confirm-dialog"
import { DeleteExpenseDialog } from "./delete-expense-dialog"
import { EditScopeDialog } from "./edit-scope-dialog"
import { MonthSelector } from "./month-selector"
import { SummaryCard } from "./summary-card"
import type { CardCostForm, PlannedExpense, ViewMode } from "./types"
import { toCardDueDateInput, toDateInput, toDateOrUndefined, toOptionalNumber } from "./utils"
import { ViewToggle } from "./view-toggle"
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

export function CardInvoiceBoard() {
  const dispatch = useAppDispatch()
  const locale = useLocale()
  const t = useTranslations("financePlannerPage")
  const pageT = useTranslations("cardInvoicePage")
  const dateLocale = locale === "pt" ? ptBR : enUS

  const selectedYear = useAppSelector(selectSelectedYear)
  const selectedMonth = useAppSelector(selectSelectedMonth)
  const isLoading = useAppSelector(selectFinanceLoading)
  const error = useAppSelector(selectFinanceError)
  const cardCosts = useAppSelector(selectCreditCardExpenses)
  const paymentMethods = useAppSelector(selectPaymentMethodsOptions)
  const cardTotal = useAppSelector(selectSummaryCreditCardTotal)

  const [monthInput, setMonthInput] = useState(String(selectedMonth))
  const [yearInput, setYearInput] = useState(String(selectedYear))
  const [viewMode, setViewMode] = useState<ViewMode>("cards")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null)
  const [cardCostForm, setCardCostForm] = useState<CardCostForm>(emptyCardCostForm)
  const [formError, setFormError] = useState<string | null>(null)
  const [pendingDeleteExpense, setPendingDeleteExpense] = useState<PlannedExpense | null>(null)
  const [pendingSimpleDelete, setPendingSimpleDelete] = useState<PlannedExpense | null>(null)
  const [pendingEdit, setPendingEdit] = useState<{
    id: string
    data: unknown
  } | null>(null)

  useEffect(() => {
    dispatch(fetchMonthlyPlan({ year: selectedYear, month: selectedMonth }))
    dispatch(fetchFinanceFormOptions())
  }, [dispatch, selectedMonth, selectedYear])

  const monthLabel = format(new Date(selectedYear, selectedMonth - 1, 1), "LLLL / yyyy", {
    locale: dateLocale,
  })
  const cardMethods = useMemo(
    () => paymentMethods.filter((method) => method.type === "CREDIT_CARD" && method.paymentCard),
    [paymentMethods]
  )
  const paidTotal = useMemo(
    () =>
      cardCosts.reduce(
        (total, expense) => total + (expense.isPaid ? Number(expense.amount) : 0),
        0
      ),
    [cardCosts]
  )
  const pendingTotal = cardTotal - paidTotal

  function applyMonthFilter() {
    const year = Number(yearInput)
    const month = Number(monthInput)
    if (Number.isNaN(year) || Number.isNaN(month) || month < 1 || month > 12) return
    dispatch(setSelectedMonth({ year, month }))
  }

  function openCreateDialog() {
    const defaultCardMethod = cardMethods[0]
    setFormError(null)
    setEditingExpenseId(null)
    setCardCostForm({
      ...emptyCardCostForm,
      paymentMethodId: defaultCardMethod?.id ?? "",
      dueDate: defaultCardMethod?.paymentCard
        ? toCardDueDateInput(selectedYear, selectedMonth, defaultCardMethod.paymentCard.dueDay)
        : "",
    })
    setDialogOpen(true)
  }

  function openCardCostEdit(row: PlannedExpense) {
    const method = cardMethods.find((item) => item.id === row.paymentMethodId)
    setFormError(null)
    setEditingExpenseId(row.id)
    setCardCostForm({
      name: row.name,
      merchantName: row.merchantName ?? "",
      description: row.description ?? "",
      amount: row.amount,
      currency: row.currency,
      dueDate:
        toDateInput(row.dueDate) ||
        (method?.paymentCard
          ? toCardDueDateInput(selectedYear, selectedMonth, method.paymentCard.dueDay)
          : ""),
      paymentMethodId: row.paymentMethodId ?? "",
      isInstallment: Boolean(row.installmentNumber && row.installmentTotal),
      createPreviousInstallments: false,
      installmentNumber: row.installmentNumber?.toString() ?? "",
      installmentTotal: row.installmentTotal?.toString() ?? "",
    })
    setDialogOpen(true)
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
      dueDate: toDateOrUndefined(cardCostForm.dueDate),
      installmentNumber: cardCostForm.isInstallment
        ? toOptionalNumber(cardCostForm.installmentNumber)
        : null,
      installmentTotal: cardCostForm.isInstallment
        ? toOptionalNumber(cardCostForm.installmentTotal)
        : null,
      createFutureInstallments: !editingExpenseId && cardCostForm.isInstallment,
      createPreviousInstallments:
        !editingExpenseId && cardCostForm.isInstallment && cardCostForm.createPreviousInstallments,
    }

    if (editingExpenseId) {
      const editingExpense = cardCosts.find((expense) => expense.id === editingExpenseId)
      if (editingExpense?.recurrenceGroupId) {
        setPendingEdit({ id: editingExpenseId, data })
        setDialogOpen(false)
        return
      }
      await dispatch(updatePlannedExpenseAction({ id: editingExpenseId, data })).unwrap()
    } else {
      await dispatch(createPlannedExpenseAction(data)).unwrap()
    }

    closeDialog()
  }

  function removeCardCost(row: PlannedExpense) {
    if (row.recurrenceGroupId) {
      setPendingDeleteExpense(row)
      return
    }
    setPendingSimpleDelete(row)
  }

  async function confirmSimpleDelete() {
    if (!pendingSimpleDelete) return
    await dispatch(deletePlannedExpenseAction(pendingSimpleDelete.id)).unwrap()
    setPendingSimpleDelete(null)
  }

  async function confirmDeleteExpense(mode: "single" | "future") {
    if (!pendingDeleteExpense) return
    await dispatch(
      deletePlannedExpenseAction({ id: pendingDeleteExpense.id, mode })
    ).unwrap()
    setPendingDeleteExpense(null)
  }

  async function confirmEditScope(mode: "single" | "future") {
    if (!pendingEdit) return
    await dispatch(
      updatePlannedExpenseAction({
        id: pendingEdit.id,
        data: pendingEdit.data,
        mode,
      })
    ).unwrap()
    setPendingEdit(null)
    closeDialog()
  }

  function closeDialog() {
    setDialogOpen(false)
    setEditingExpenseId(null)
    setFormError(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold tracking-tight">{pageT("title")}</h1>
          <p className="text-muted-foreground">{pageT("subtitle")}</p>
        </div>
        <MonthSelector
          monthInput={monthInput}
          yearInput={yearInput}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
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

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        <SummaryCard title={pageT("summary.total")} value={cardTotal} />
        <SummaryCard title={pageT("summary.paid")} value={paidTotal} positive />
        <div className="col-span-2 sm:col-span-1">
          <SummaryCard title={pageT("summary.pending")} value={pendingTotal} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{pageT("monthTitle", { month: monthLabel })}</CardTitle>
          <p className="max-w-2xl text-sm text-muted-foreground">
            {pageT("description")}
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-2 gap-2 border-b pb-4 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
            <ViewToggle value={viewMode} onChange={setViewMode} t={t} />
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-9 w-full sm:w-auto"
              onClick={openCreateDialog}
            >
              <Plus className="size-4" />
              {t("add.cardCosts")}
            </Button>
          </div>

          <CardCostsContent
            rows={cardCosts}
            viewMode={viewMode}
            onEdit={openCardCostEdit}
            onDelete={removeCardCost}
            t={t}
            dateLocale={dateLocale}
          />
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={(open) => (open ? setDialogOpen(true) : closeDialog())}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingExpenseId ? t("cards.editCost") : t("cards.addCost")}
            </DialogTitle>
            <DialogDescription>{t("modal.cardCostDescription")}</DialogDescription>
          </DialogHeader>
          {formError ? (
            <p className="text-sm text-destructive" role="alert">
              {formError}
            </p>
          ) : null}
          <CardCostDialogForm
            form={cardCostForm}
            setForm={setCardCostForm}
            cardMethods={cardMethods}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            onSubmit={saveCardCost}
            t={t}
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => closeDialog()}>
              {t("form.cancel")}
            </Button>
            <Button type="submit" form="finance-card-cost-form" disabled={isLoading}>
              {isLoading ? t("form.saving") : t("form.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={Boolean(pendingSimpleDelete)}
        itemName={pendingSimpleDelete?.name}
        isPending={isLoading}
        onOpenChange={(open) => {
          if (!open) setPendingSimpleDelete(null)
        }}
        onConfirm={confirmSimpleDelete}
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
      <EditScopeDialog
        open={Boolean(pendingEdit)}
        onOpenChange={(open) => {
          if (!open) setPendingEdit(null)
        }}
        onEditSingle={() => confirmEditScope("single")}
        onEditFuture={() => confirmEditScope("future")}
        t={t}
      />
    </div>
  )
}
