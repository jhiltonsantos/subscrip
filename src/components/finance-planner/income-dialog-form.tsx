import type { FormEvent } from "react"
import { Input } from "@/components/ui/input"
import { CheckboxLine, CurrencySelect } from "./form-controls"
import type { IncomeForm, TranslationFn } from "./types"

export function IncomeDialogForm({
  form,
  setForm,
  onSubmit,
  t,
}: {
  form: IncomeForm
  setForm: (form: IncomeForm) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  t: TranslationFn
}) {
  return (
    <form id="finance-income-form" onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
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
      <CurrencySelect
        value={form.currency}
        onChange={(currency) => setForm({ ...form, currency })}
      />
      <Input
        type="date"
        value={form.expectedDate}
        onChange={(event) => setForm({ ...form, expectedDate: event.target.value })}
      />
      <CheckboxLine
        checked={form.isReceived}
        onChange={(checked) => setForm({ ...form, isReceived: checked })}
      >
        {t("income.markReceived")}
      </CheckboxLine>
    </form>
  )
}
