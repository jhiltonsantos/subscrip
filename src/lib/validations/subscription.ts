import { z } from "zod"
import {
  BILLING_CYCLE_VALUES,
  CATEGORY_VALUES,
  CURRENCY_VALUES,
} from "@/lib/subscription-constants"

export const subscriptionCreateSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(200),
  planLabel: z.string().max(120).nullable().optional(),
  price: z.coerce.number().positive("Preço deve ser maior que zero"),
  currency: z.enum(CURRENCY_VALUES),
  billingCycle: z.enum(BILLING_CYCLE_VALUES),
  category: z.enum(CATEGORY_VALUES),
  startDate: z.coerce.date(),
  nextBillingDate: z.coerce.date(),
  active: z.boolean().optional().default(true),
  serviceTemplateId: z.string().uuid().optional().nullable(),
  paymentMethodId: z.string().uuid().optional().nullable(),
})

export type SubscriptionCreateInput = z.infer<typeof subscriptionCreateSchema>

export const subscriptionUpdateSchema = subscriptionCreateSchema.partial()

export type SubscriptionUpdateInput = z.infer<typeof subscriptionUpdateSchema>
