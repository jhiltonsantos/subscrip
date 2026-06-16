import type { FormEvent } from "react"
import { Input } from "@/components/ui/input"
import { CheckboxLine, CurrencySelect, Field } from "./form-controls"
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
      <Field label={t("form.titleLabel")}>
        <Input
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          placeholder={t("form.namePlaceholder")}
        />
      </Field>
      <Field label={t("form.amount")}>
        <Input
          type="number"
          min="0"
          step="0.01"
          value={form.amount}
          onChange={(event) => setForm({ ...form, amount: event.target.value })}
          placeholder={t("form.amountPlaceholder")}
        />
      </Field>
      <Field label={t("form.currency")}>
        <CurrencySelect
          value={form.currency}
          onChange={(currency) => setForm({ ...form, currency })}
        />
      </Field>
      <Field label={t("income.expectedDate")} tooltip={t("tooltips.incomeExpectedDate")}>
        <Input
          type="date"
          value={form.expectedDate}
          onChange={(event) => setForm({ ...form, expectedDate: event.target.value })}
        />
      </Field>
      <Field label={t("form.description")} className="sm:col-span-2">
        <textarea
          value={form.description}
          onChange={(event) => setForm({ ...form, description: event.target.value })}
          placeholder={t("form.descriptionPlaceholder")}
          className="min-h-20 rounded-md border border-input bg-transparent px-3 py-2 text-sm"
        />
      </Field>
      <CheckboxLine
        checked={form.isMonthlyRecurring}
        onChange={(checked) =>
          setForm({
            ...form,
            isMonthlyRecurring: checked,
            isFixedRecurring: checked ? false : form.isFixedRecurring,
            recurrenceMonths: checked ? "" : form.recurrenceMonths,
          })
        }
      >
        {t("income.isMonthlyRecurring")}
      </CheckboxLine>
      <CheckboxLine
        checked={form.isFixedRecurring}
        onChange={(checked) =>
          setForm({
            ...form,
            isFixedRecurring: checked,
            isMonthlyRecurring: checked ? false : form.isMonthlyRecurring,
            recurrenceMonths: checked ? form.recurrenceMonths : "",
          })
        }
      >
        {t("income.isFixedRecurring")}
      </CheckboxLine>
      {form.isFixedRecurring ? (
        <Field
          label={t("income.recurrenceMonths")}
          tooltip={t("tooltips.incomeRecurrenceMonths")}
          className="sm:col-span-2"
        >
          <Input
            type="number"
            min={1}
            max={120}
            value={form.recurrenceMonths}
            onChange={(event) => setForm({ ...form, recurrenceMonths: event.target.value })}
            placeholder={t("income.recurrenceMonthsPlaceholder")}
          />
        </Field>
      ) : null}
      <CheckboxLine
        checked={form.isReceived}
        onChange={(checked) => setForm({ ...form, isReceived: checked })}
      >
        {t("income.markReceived")}
      </CheckboxLine>
    </form>
  )
}
