"use client"

import { useEffect, useState, useTransition } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, type Resolver } from "react-hook-form"
import { addMonths } from "date-fns"
import {
  BillingCycle,
  Category,
  Currency,
} from "@prisma/client"
import { subscriptionCreateSchema } from "@/lib/validations/subscription"
import {
  createSubscription,
  updateSubscription,
  type SerializedSubscription,
  type SubscriptionFormOptions,
} from "@/server/actions/subscriptions"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils/helpers"

const selectClassName = cn(
  "border-input bg-background h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs outline-none",
  "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
  "disabled:cursor-not-allowed disabled:opacity-50"
)

type SubscriptionFormValues = {
  name: string
  planLabel: string | null
  price: number
  currency: Currency
  billingCycle: BillingCycle
  category: Category
  startDate: Date
  nextBillingDate: Date
  active: boolean
  serviceTemplateId: string | null
  paymentMethodId: string | null
}

function createEmptyDefaults(): SubscriptionFormValues {
  const start = new Date()
  return {
    name: "",
    price: 9.99,
    currency: Currency.BRL,
    billingCycle: BillingCycle.MONTHLY,
    category: Category.OTHER,
    startDate: start,
    nextBillingDate: addMonths(start, 1),
    active: true,
    planLabel: "" as string | null,
    serviceTemplateId: null,
    paymentMethodId: null,
  }
}

function defaultsFromSubscription(subscription: SerializedSubscription): SubscriptionFormValues {
  return {
    name: subscription.name,
    planLabel: subscription.planLabel ?? null,
    price: Number(subscription.price),
    currency: subscription.currency as Currency,
    billingCycle: subscription.billingCycle as BillingCycle,
    category: subscription.category as Category,
    startDate: new Date(subscription.startDate),
    nextBillingDate: new Date(subscription.nextBillingDate),
    active: subscription.active,
    serviceTemplateId: subscription.serviceTemplate?.id ?? null,
    paymentMethodId: subscription.paymentMethod?.id ?? null,
  }
}

type SubscriptionFormProps = {
  mode: "create" | "edit"
  subscription?: SerializedSubscription
  options: SubscriptionFormOptions
  open: boolean
  onSuccess: () => void
  onCancel: () => void
}

export function SubscriptionForm({
  mode,
  subscription,
  options,
  open,
  onSuccess,
  onCancel,
}: SubscriptionFormProps) {
  const t = useTranslations("subscriptionsPage")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const form = useForm<SubscriptionFormValues>({
    resolver: zodResolver(
      subscriptionCreateSchema
    ) as Resolver<SubscriptionFormValues>,
    defaultValues: createEmptyDefaults(),
  })

  useEffect(() => {
    if (!open) return
    if (mode === "edit" && subscription) {
      form.reset(defaultsFromSubscription(subscription))
    } else {
      form.reset(createEmptyDefaults())
    }
  }, [open, mode, subscription, form])

  function onSubmit(values: SubscriptionFormValues) {
    setError(null)
    const payload = {
      ...values,
      planLabel: values.planLabel?.trim() || null,
      serviceTemplateId: values.serviceTemplateId || null,
      paymentMethodId: values.paymentMethodId || null,
    }

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createSubscription(payload)
          : await updateSubscription(subscription!.id, payload)

      if (result.success) {
        onSuccess()
        return
      }
      setError(result.error || t("form.error"))
    })
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {mode === "create" ? t("form.createTitle") : t("form.editTitle")}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {mode === "create" ? t("form.createTitle") : t("form.editTitle")}
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 py-2"
        >
          {error ? (
            <p className="text-destructive text-sm" role="alert">
              {error}
            </p>
          ) : null}

          <FormField
            control={form.control}
            name="serviceTemplateId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("form.serviceTemplate")}</FormLabel>
                <FormControl>
                  <select
                    className={selectClassName}
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const v = e.target.value
                      const newId = v === "" ? null : v
                      field.onChange(newId)
                      if (newId) {
                        const template = options.serviceTemplates.find(
                          (serviceTemplate) => serviceTemplate.id === newId
                        )
                        if (template) {
                          const current = form.getValues("name")
                          if (!current || current.trim() === "") {
                            form.setValue("name", template.name, {
                              shouldValidate: true,
                              shouldDirty: true,
                            })
                          }
                        }
                      }
                    }}
                  >
                    <option value="">{t("form.none")}</option>
                    {options.serviceTemplates.map((serviceTemplate) => (
                      <option key={serviceTemplate.id} value={serviceTemplate.id}>
                        {serviceTemplate.name}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="planLabel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("form.planLabel")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    placeholder={t("form.planLabelHint")}
                    autoComplete="off"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("form.name")}</FormLabel>
                <FormControl>
                  <Input {...field} autoComplete="off" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.price")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      step="0.01"
                      min="0"
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === ""
                            ? undefined
                            : Number(e.target.value)
                        )
                      }
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.currency")}</FormLabel>
                  <FormControl>
                    <select {...field} className={selectClassName}>
                      {Object.values(Currency).map((currency) => (
                        <option key={currency} value={currency}>
                          {currency}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="billingCycle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.billingCycle")}</FormLabel>
                  <FormControl>
                    <select {...field} className={selectClassName}>
                      {Object.values(BillingCycle).map((billingCycle) => (
                        <option key={billingCycle} value={billingCycle}>
                          {billingCycle}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.category")}</FormLabel>
                  <FormControl>
                    <select {...field} className={selectClassName}>
                      {Object.values(Category).map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.startDate")}</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={
                        field.value
                          ? formatYmd(field.value as Date)
                          : ""
                      }
                      onChange={(e) => {
                        const value = e.target.value
                        field.onChange(
                          value ? new Date(value + "T12:00:00") : undefined
                        )
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nextBillingDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.nextBillingDate")}</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={
                        field.value
                          ? formatYmd(field.value as Date)
                          : ""
                      }
                      onChange={(e) => {
                        const value = e.target.value
                        field.onChange(
                          value ? new Date(value + "T12:00:00") : undefined
                        )
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center gap-2 space-y-0">
                <FormControl>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    className="border-input size-4 rounded border"
                  />
                </FormControl>
                <FormLabel className="mt-0! font-normal">
                  {t("form.active")}
                </FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="paymentMethodId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("form.paymentMethod")}</FormLabel>
                <FormControl>
                  <select
                    className={selectClassName}
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const value = e.target.value
                      field.onChange(value === "" ? null : value)
                    }}
                  >
                    <option value="">{t("form.none")}</option>
                    {options.paymentMethods.map((paymentMethod) => (
                      <option key={paymentMethod.id} value={paymentMethod.id}>
                        {paymentMethod.name}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isPending}
            >
              {t("form.cancel")}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? t("form.saving") : t("form.save")}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  )
}

function formatYmd(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}
