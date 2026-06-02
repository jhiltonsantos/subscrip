"use client"

import type { Dispatch, FormEvent, ReactNode, SetStateAction } from "react"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { CreditCard, Landmark, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Field } from "@/components/finance-planner/form-controls"
import {
  createPaymentMethod,
  deactivatePaymentMethod,
  updatePaymentMethod,
  type SerializedPaymentMethod,
} from "@/server/actions/payment-methods"

type PaymentMethodFormState = {
  name: string
  type: string
  cardNickname: string
  brand: string
  last4: string
  closingDay: string
  dueDay: string
  limitAmount: string
}

type PaymentMethodsManagerProps = {
  initialMethods: SerializedPaymentMethod[]
}

type PaymentMethodTranslation = ReturnType<typeof useTranslations>

const methodTypes = [
  "CREDIT_CARD",
  "DEBIT_CARD",
  "PIX",
  "BANK_TRANSFER",
  "BOLETO",
  "CASH",
  "OTHER",
] as const

const emptyForm: PaymentMethodFormState = {
  name: "",
  type: "CREDIT_CARD",
  cardNickname: "",
  brand: "",
  last4: "",
  closingDay: "",
  dueDay: "",
  limitAmount: "",
}

export function PaymentMethodsManager({ initialMethods }: PaymentMethodsManagerProps) {
  const t = useTranslations("settingsPage.paymentMethods")
  const router = useRouter()
  const [createForm, setCreateForm] = useState<PaymentMethodFormState>(emptyForm)
  const [editForm, setEditForm] = useState<PaymentMethodFormState>(emptyForm)
  const [editingMethod, setEditingMethod] = useState<SerializedPaymentMethod | null>(null)
  const [createError, setCreateError] = useState<string | null>(null)
  const [editError, setEditError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function getFormFromMethod(method: SerializedPaymentMethod): PaymentMethodFormState {
    return {
      name: method.name,
      type: method.type,
      cardNickname: method.paymentCard?.nickname ?? "",
      brand: method.paymentCard?.brand ?? "",
      last4: method.paymentCard?.last4 ?? "",
      closingDay: method.paymentCard?.closingDay?.toString() ?? "",
      dueDay: method.paymentCard?.dueDay?.toString() ?? "",
      limitAmount: method.paymentCard?.limitAmount ?? "",
    }
  }

  function editMethod(method: SerializedPaymentMethod) {
    setEditingMethod(method)
    setEditForm(getFormFromMethod(method))
    setEditError(null)
  }

  function resetCreateForm() {
    setCreateForm(emptyForm)
    setCreateError(null)
  }

  function closeEditDialog() {
    setEditingMethod(null)
    setEditForm(emptyForm)
    setEditError(null)
  }

  function refreshMethods() {
    router.refresh()
  }

  function onCreateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setCreateError(null)

    startTransition(async () => {
      const result = await createPaymentMethod(buildPayload(createForm))

      if (!result.success) {
        setCreateError(result.error)
        return
      }

      resetCreateForm()
      refreshMethods()
    })
  }

  function onEditSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!editingMethod) return
    setEditError(null)

    startTransition(async () => {
      const result = await updatePaymentMethod(editingMethod.id, buildPayload(editForm))

      if (!result.success) {
        setEditError(result.error)
        return
      }

      closeEditDialog()
      refreshMethods()
    })
  }

  function onDeactivate(method: SerializedPaymentMethod) {
    setCreateError(null)
    startTransition(async () => {
      const result = await deactivatePaymentMethod(method.id)
      if (!result.success) {
        setCreateError(result.error)
        return
      }

      refreshMethods()
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-xl border bg-muted/20 p-4">
          <div className="mb-4 flex items-center gap-2">
            <Plus className="h-4 w-4 text-emerald-600" />
            <h3 className="font-semibold">{t("form.createTitle")}</h3>
          </div>
          {createError ? (
            <p className="mb-3 text-sm text-destructive" role="alert">
              {createError}
            </p>
          ) : null}
          <PaymentMethodForm
            formId="payment-method-create-form"
            form={createForm}
            setForm={setCreateForm}
            onSubmit={onCreateSubmit}
            t={t}
          >
            <Button type="submit" disabled={isPending}>
              {isPending ? t("form.saving") : t("form.save")}
            </Button>
          </PaymentMethodForm>
        </div>

        <div className="grid gap-3">
          {initialMethods.length === 0 ? (
            <p className="rounded-xl border p-4 text-sm text-muted-foreground">
              {t("empty")}
            </p>
          ) : (
            initialMethods.map((method) => (
              <div
                key={method.id}
                className="rounded-xl border bg-background/60 p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex gap-3">
                    <span className="rounded-lg border bg-muted/30 p-2">
                      {method.type === "CREDIT_CARD" ? (
                        <CreditCard className="h-4 w-4" />
                      ) : (
                        <Landmark className="h-4 w-4" />
                      )}
                    </span>
                    <div>
                      <p className="font-medium">{method.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {t(`types.${method.type}`)}
                        {method.paymentCard?.last4
                          ? ` · ${t("last4", { last4: method.paymentCard.last4 })}`
                          : ""}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-muted px-2 py-1 text-xs">
                    {method.isActive ? t("active") : t("inactive")}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => editMethod(method)}
                  >
                    {t("form.edit")}
                  </Button>
                  {method.isActive ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => onDeactivate(method)}
                    >
                      {t("deactivate")}
                    </Button>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>

      <Dialog
        open={Boolean(editingMethod)}
        onOpenChange={(open) => {
          if (!open) closeEditDialog()
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("form.editTitle")}</DialogTitle>
            <DialogDescription>{t("description")}</DialogDescription>
          </DialogHeader>
          {editError ? (
            <p className="text-sm text-destructive" role="alert">
              {editError}
            </p>
          ) : null}
          <PaymentMethodForm
            formId="payment-method-edit-form"
            form={editForm}
            setForm={setEditForm}
            onSubmit={onEditSubmit}
            disableType
            t={t}
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeEditDialog}>
              {t("form.cancel")}
            </Button>
            <Button type="submit" form="payment-method-edit-form" disabled={isPending}>
              {isPending ? t("form.saving") : t("form.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

function PaymentMethodForm({
  formId,
  form,
  setForm,
  onSubmit,
  disableType = false,
  t,
  children,
}: {
  formId: string
  form: PaymentMethodFormState
  setForm: Dispatch<SetStateAction<PaymentMethodFormState>>
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  disableType?: boolean
  t: PaymentMethodTranslation
  children?: ReactNode
}) {
  const isCard = form.type === "CREDIT_CARD"

  return (
    <form id={formId} onSubmit={onSubmit} className="grid gap-3">
      <Field label={requiredLabel(t("form.name"))}>
        <Input
          value={form.name}
          onChange={(event) =>
            setForm((current) => ({ ...current, name: event.target.value }))
          }
          placeholder={t("form.name")}
        />
      </Field>
      <Field label={requiredLabel(t("form.type"))} tooltip={t("tooltips.type")}>
        <select
          value={form.type}
          disabled={disableType}
          onChange={(event) =>
            setForm((current) => ({ ...current, type: event.target.value }))
          }
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
        >
          {methodTypes.map((type) => (
            <option key={type} value={type}>
              {t(`types.${type}`)}
            </option>
          ))}
        </select>
      </Field>

      {isCard ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            label={requiredLabel(t("form.cardNickname"))}
            tooltip={t("tooltips.cardNickname")}
          >
            <Input
              value={form.cardNickname}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  cardNickname: event.target.value,
                }))
              }
              placeholder={t("form.cardNickname")}
            />
          </Field>
          <Field label={t("form.brand")}>
            <Input
              value={form.brand}
              onChange={(event) =>
                setForm((current) => ({ ...current, brand: event.target.value }))
              }
              placeholder={t("form.brand")}
            />
          </Field>
          <Field label={t("form.last4")} tooltip={t("tooltips.last4")}>
            <Input
              value={form.last4}
              maxLength={4}
              onChange={(event) =>
                setForm((current) => ({ ...current, last4: event.target.value }))
              }
              placeholder={t("form.last4")}
            />
          </Field>
          <Field label={t("form.closingDay")} tooltip={t("tooltips.closingDay")}>
            <Input
              type="number"
              min={1}
              max={31}
              value={form.closingDay}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  closingDay: event.target.value,
                }))
              }
              placeholder={t("form.closingDay")}
            />
          </Field>
          <Field label={t("form.dueDay")} tooltip={t("tooltips.dueDay")}>
            <Input
              type="number"
              min={1}
              max={31}
              value={form.dueDay}
              onChange={(event) =>
                setForm((current) => ({ ...current, dueDay: event.target.value }))
              }
              placeholder={t("form.dueDay")}
            />
          </Field>
          <Field label={t("form.limitAmount")} tooltip={t("tooltips.limitAmount")}>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={form.limitAmount}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  limitAmount: event.target.value,
                }))
              }
              placeholder={t("form.limitAmount")}
            />
          </Field>
        </div>
      ) : null}

      {children ? <div className="mt-1 flex flex-wrap gap-2">{children}</div> : null}
    </form>
  )
}

function buildPayload(form: PaymentMethodFormState) {
  return {
    name: form.name,
    type: form.type,
    cardNickname: form.cardNickname,
    brand: form.brand,
    last4: form.last4,
    closingDay: form.closingDay,
    dueDay: form.dueDay,
    limitAmount: form.limitAmount,
  }
}

function requiredLabel(label: string) {
  return `${label} *`
}
