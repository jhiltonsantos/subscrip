import type { FormEvent } from "react"
import { Input } from "@/components/ui/input"
import { CheckboxLine, CurrencySelect, Field } from "./form-controls"
import type { CardCostForm, PaymentMethodOption, TranslationFn } from "./types"
import { toCardDueDateInput } from "./utils"

export function CardCostDialogForm({
  form,
  setForm,
  cardMethods,
  selectedYear,
  selectedMonth,
  onSubmit,
  t,
}: {
  form: CardCostForm
  setForm: (form: CardCostForm) => void
  cardMethods: PaymentMethodOption[]
  selectedYear: number
  selectedMonth: number
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  t: TranslationFn
}) {
  return (
    <form id="finance-card-cost-form" onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
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
      <Field label={t("cards.merchantName")}>
        <Input
          value={form.merchantName}
          onChange={(event) => setForm({ ...form, merchantName: event.target.value })}
          placeholder={t("cards.merchantPlaceholder")}
        />
      </Field>
      <Field label={t("cards.card")}>
        <select
          value={form.paymentMethodId}
          onChange={(event) => {
            const paymentMethodId = event.target.value
            const method = cardMethods.find((item) => item.id === paymentMethodId)
            setForm({
              ...form,
              paymentMethodId,
              dueDate: method?.paymentCard
                ? toCardDueDateInput(selectedYear, selectedMonth, method.paymentCard.dueDay)
                : "",
            })
          }}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
        >
          <option value="">{t("cards.selectCard")}</option>
          {cardMethods.map((method) => (
            <option key={method.id} value={method.id}>
              {method.paymentCard?.nickname ?? method.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label={t("form.currency")}>
        <CurrencySelect
          value={form.currency}
          onChange={(currency) => setForm({ ...form, currency })}
        />
      </Field>
      <Field label={t("cards.dueDate")} tooltip={t("tooltips.dueDate")}>
        <Input
          type="date"
          value={form.dueDate}
          readOnly
          className="bg-muted/40"
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
        checked={form.isInstallment}
        onChange={(checked) =>
          setForm({
            ...form,
            isInstallment: checked,
            createPreviousInstallments: checked ? form.createPreviousInstallments : false,
            installmentNumber: checked ? form.installmentNumber : "",
            installmentTotal: checked ? form.installmentTotal : "",
          })
        }
      >
        {t("cards.isInstallment")}
      </CheckboxLine>
      {form.isInstallment ? (
        <>
          <Field label={t("cards.installmentNumber")} tooltip={t("tooltips.installmentNumber")}>
            <Input
              type="number"
              min={1}
              value={form.installmentNumber}
              onChange={(event) => setForm({ ...form, installmentNumber: event.target.value })}
            />
          </Field>
          <Field label={t("cards.installmentTotal")} tooltip={t("tooltips.installmentTotal")}>
            <Input
              type="number"
              min={1}
              value={form.installmentTotal}
              onChange={(event) => setForm({ ...form, installmentTotal: event.target.value })}
            />
          </Field>
          <div className="sm:col-span-2">
            <CheckboxLine
              checked={form.createPreviousInstallments}
              onChange={(checked) =>
                setForm({ ...form, createPreviousInstallments: checked })
              }
            >
              {t("cards.createPreviousInstallments")}
            </CheckboxLine>
          </div>
        </>
      ) : null}
    </form>
  )
}
