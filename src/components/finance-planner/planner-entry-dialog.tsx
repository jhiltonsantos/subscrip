import type { FormEvent } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CardCostDialogForm } from "./card-cost-dialog-form"
import { ExpenseDialogForm } from "./expense-dialog-form"
import { IncomeDialogForm } from "./income-dialog-form"
import type {
  ActiveTab,
  CardCostForm,
  ExpenseForm,
  IncomeForm,
  PaymentMethodOption,
  TranslationFn,
} from "./types"
import { getDialogDescription, getDialogFormId, getDialogTitle } from "./utils"

export function PlannerEntryDialog({
  activeTab,
  open,
  onOpenChange,
  isEditing,
  formError,
  incomeForm,
  setIncomeForm,
  expenseForm,
  setExpenseForm,
  cardCostForm,
  setCardCostForm,
  paymentMethods,
  cardMethods,
  onSaveIncome,
  onSaveExpense,
  onSaveCardCost,
  isLoading,
  t,
}: {
  activeTab: ActiveTab
  open: boolean
  onOpenChange: (open: boolean) => void
  isEditing: boolean
  formError: string | null
  incomeForm: IncomeForm
  setIncomeForm: (form: IncomeForm) => void
  expenseForm: ExpenseForm
  setExpenseForm: (form: ExpenseForm) => void
  cardCostForm: CardCostForm
  setCardCostForm: (form: CardCostForm) => void
  paymentMethods: PaymentMethodOption[]
  cardMethods: PaymentMethodOption[]
  onSaveIncome: (event: FormEvent<HTMLFormElement>) => void
  onSaveExpense: (event: FormEvent<HTMLFormElement>) => void
  onSaveCardCost: (event: FormEvent<HTMLFormElement>) => void
  isLoading: boolean
  t: TranslationFn
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{getDialogTitle(activeTab, isEditing, t)}</DialogTitle>
          <DialogDescription>{getDialogDescription(activeTab, t)}</DialogDescription>
        </DialogHeader>
        {formError ? (
          <p className="text-sm text-destructive" role="alert">
            {formError}
          </p>
        ) : null}
        {activeTab === "income" ? (
          <IncomeDialogForm
            form={incomeForm}
            setForm={setIncomeForm}
            onSubmit={onSaveIncome}
            t={t}
          />
        ) : null}
        {activeTab === "expenses" ? (
          <ExpenseDialogForm
            form={expenseForm}
            setForm={setExpenseForm}
            paymentMethods={paymentMethods}
            onSubmit={onSaveExpense}
            t={t}
          />
        ) : null}
        {activeTab === "cardCosts" ? (
          <CardCostDialogForm
            form={cardCostForm}
            setForm={setCardCostForm}
            cardMethods={cardMethods}
            onSubmit={onSaveCardCost}
            t={t}
          />
        ) : null}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t("form.cancel")}
          </Button>
          <Button type="submit" form={getDialogFormId(activeTab)} disabled={isLoading}>
            {isLoading ? t("form.saving") : t("form.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
