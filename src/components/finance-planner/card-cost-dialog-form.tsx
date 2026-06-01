import type { FormEvent } from "react"
import { Input } from "@/components/ui/input"
import { CheckboxLine, CurrencySelect } from "./form-controls"
import type { CardCostForm, PaymentMethodOption, TranslationFn } from "./types"

export function CardCostDialogForm({
  form,
  setForm,
  cardMethods,
  onSubmit,
  t,
}: {
  form: CardCostForm
  setForm: (form: CardCostForm) => void
  cardMethods: PaymentMethodOption[]
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  t: TranslationFn
}) {
  return (
    <form id="finance-card-cost-form" onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
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
        value={form.paymentMethodId}
        onChange={(event) => setForm({ ...form, paymentMethodId: event.target.value })}
        className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
      >
        <option value="">{t("cards.selectCard")}</option>
        {cardMethods.map((method) => (
          <option key={method.id} value={method.id}>
            {method.paymentCard?.nickname ?? method.name}
          </option>
        ))}
      </select>
      <CurrencySelect
        value={form.currency}
        onChange={(currency) => setForm({ ...form, currency })}
      />
      <Input
        type="date"
        value={form.purchaseDate}
        onChange={(event) => setForm({ ...form, purchaseDate: event.target.value })}
      />
      <Input
        type="date"
        value={form.dueDate}
        onChange={(event) => setForm({ ...form, dueDate: event.target.value })}
      />
      <Input
        type="number"
        min={1}
        value={form.installmentNumber}
        onChange={(event) => setForm({ ...form, installmentNumber: event.target.value })}
        placeholder={t("cards.installmentNumber")}
      />
      <Input
        type="number"
        min={1}
        value={form.installmentTotal}
        onChange={(event) => setForm({ ...form, installmentTotal: event.target.value })}
        placeholder={t("cards.installmentTotal")}
      />
      <CheckboxLine
        checked={form.isPaid}
        onChange={(checked) => setForm({ ...form, isPaid: checked })}
      >
        {t("expense.markPaid")}
      </CheckboxLine>
    </form>
  )
}
