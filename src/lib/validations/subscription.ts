import { z } from "zod"
import {
  BILLING_CYCLE_VALUES,
  CATEGORY_VALUES,
  CURRENCY_VALUES,
} from "@/lib/subscription-constants"

const subscriptionBaseSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(200),
  planLabel: z.string().max(120).nullable().optional(),
  price: z.coerce.number().positive("Preço deve ser maior que zero"),
  currency: z.enum(CURRENCY_VALUES),
  billingCycle: z.enum(BILLING_CYCLE_VALUES),
  category: z.enum(CATEGORY_VALUES),
  hiredAt: z.coerce.date().nullable().optional(),
  billingDay: z.coerce.number().int().min(1).max(31).nullable().optional(),
  nextBillingDate: z.coerce.date().nullable().optional(),
  active: z.boolean().optional().default(true),
  serviceTemplateId: z.string().uuid().optional().nullable(),
  paymentMethodId: z.string().uuid().optional().nullable(),
})

function refineBillingFields(
  data: {
    billingCycle: string
    billingDay?: number | null
    nextBillingDate?: Date | null
  },
  ctx: z.RefinementCtx
) {
  if (data.billingCycle === "MONTHLY" || data.billingCycle === "WEEKLY") {
    if (data.billingDay == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Dia da cobrança é obrigatório",
        path: ["billingDay"],
      })
    }
  }

  if (data.billingCycle === "YEARLY") {
    if (!data.nextBillingDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Data da próxima cobrança é obrigatória",
        path: ["nextBillingDate"],
      })
    }
  }
}

export const subscriptionCreateSchema = subscriptionBaseSchema.superRefine(refineBillingFields)

export type SubscriptionCreateInput = z.infer<typeof subscriptionCreateSchema>

export const subscriptionUpdateSchema = subscriptionBaseSchema.partial().superRefine((data, ctx) => {
  if (!data.billingCycle) return
  refineBillingFields(
    {
      billingCycle: data.billingCycle,
      billingDay: data.billingDay,
      nextBillingDate: data.nextBillingDate,
    },
    ctx
  )
})

export type SubscriptionUpdateInput = z.infer<typeof subscriptionUpdateSchema>
