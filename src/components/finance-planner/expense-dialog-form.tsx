import type { FormEvent } from "react"
import { Input } from "@/components/ui/input"
import { expenseBuckets } from "./constants"
import { CheckboxLine, CurrencySelect } from "./form-controls"
import type { ExpenseForm, PaymentMethodOption, TranslationFn } from "./types"

export function ExpenseDialogForm({
  form,
  setForm,
  paymentMethods,
  onSubmit,
  t,
}: {
  form: ExpenseForm
  setForm: (form: ExpenseForm) => void
  paymentMethods: PaymentMethodOption[]
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  t: TranslationFn
}) {
  return (
    <form id="finance-expense-form" onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
      <Input
        value={form.name}
        onChange={(event) => setForm({ ...form, name: event.target.value })}
        placeholder={t("form.namePlaceholder")}
      />
      <Input
        type="number"
        min="0"
        step="0.01"
        value={form.amount}
        onChange={(event) => setForm({ ...form, amount: event.target.value })}
        placeholder={t("form.amountPlaceholder")}
      />
      <select
        value={form.expenseBucket}
        onChange={(event) => setForm({ ...form, expenseBucket: event.target.value })}
        className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
      >
        {expenseBuckets.map((bucket) => (
          <option key={bucket} value={bucket}>
            {t(`buckets.${bucket}`)}
          </option>
        ))}
      </select>
      <CurrencySelect
        value={form.currency}
        onChange={(currency) => setForm({ ...form, currency })}
      />
      <Input
        type="date"
        value={form.dueDate}
        onChange={(event) => setForm({ ...form, dueDate: event.target.value })}
      />
      <Input
        type="date"
        value={form.purchaseDate}
        onChange={(event) => setForm({ ...form, purchaseDate: event.target.value })}
      />
      <select
        value={form.paymentMethodId}
        onChange={(event) => setForm({ ...form, paymentMethodId: event.target.value })}
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
      <CheckboxLine
        checked={form.isPaid}
        onChange={(checked) => setForm({ ...form, isPaid: checked })}
      >
        {t("expense.markPaid")}
      </CheckboxLine>
    </form>
  )
}
