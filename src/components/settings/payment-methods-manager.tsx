"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { CreditCard, Landmark, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
  const [form, setForm] = useState<PaymentMethodFormState>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const isCard = form.type === "CREDIT_CARD"

  function editMethod(method: SerializedPaymentMethod) {
    setEditingId(method.id)
    setForm({
      name: method.name,
      type: method.type,
      cardNickname: method.paymentCard?.nickname ?? "",
      brand: method.paymentCard?.brand ?? "",
      last4: method.paymentCard?.last4 ?? "",
      closingDay: method.paymentCard?.closingDay?.toString() ?? "",
      dueDay: method.paymentCard?.dueDay?.toString() ?? "",
      limitAmount: method.paymentCard?.limitAmount ?? "",
    })
  }

  function resetForm() {
    setForm(emptyForm)
    setEditingId(null)
  }

  function refreshMethods() {
    router.refresh()
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    startTransition(async () => {
      const payload = buildPayload(form)
      const result = editingId
        ? await updatePaymentMethod(editingId, payload)
        : await createPaymentMethod(payload)

      if (!result.success) {
        setError(result.error)
        return
      }

      resetForm()
      refreshMethods()
    })
  }

  function onDeactivate(method: SerializedPaymentMethod) {
    setError(null)
    startTransition(async () => {
      const result = await deactivatePaymentMethod(method.id)
      if (!result.success) {
        setError(result.error)
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
        <form onSubmit={onSubmit} className="rounded-xl border bg-muted/20 p-4">
          <div className="mb-4 flex items-center gap-2">
            <Plus className="h-4 w-4 text-emerald-600" />
            <h3 className="font-semibold">
              {editingId ? t("form.editTitle") : t("form.createTitle")}
            </h3>
          </div>
          {error ? (
            <p className="mb-3 text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <div className="grid gap-3">
            <Input
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              placeholder={t("form.name")}
            />
            <select
              value={form.type}
              disabled={Boolean(editingId)}
              onChange={(event) =>
                setForm((current) => ({ ...current, type: event.target.value }))
              }
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
            >
              {methodTypes.map((type) => (
                <option key={type} value={type}>
                  {t(`types.${type}`)}
                </option>
              ))}
            </select>

            {isCard ? (
              <div className="grid gap-3 sm:grid-cols-2">
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
                <Input
                  value={form.brand}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, brand: event.target.value }))
                  }
                  placeholder={t("form.brand")}
                />
                <Input
                  value={form.last4}
                  maxLength={4}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, last4: event.target.value }))
                  }
                  placeholder={t("form.last4")}
                />
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
              </div>
            ) : null}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? t("form.saving") : t("form.save")}
            </Button>
            {editingId ? (
              <Button type="button" variant="ghost" onClick={resetForm}>
                {t("form.cancel")}
              </Button>
            ) : null}
          </div>
        </form>

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
    </Card>
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
