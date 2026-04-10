import { z } from "zod"
import { BillingCycle, Category, Currency } from "@prisma/client"

export const subscriptionCreateSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(200),
  price: z.coerce.number().positive("Preço deve ser maior que zero"),
  currency: z.nativeEnum(Currency),
  billingCycle: z.nativeEnum(BillingCycle),
  category: z.nativeEnum(Category),
  startDate: z.coerce.date(),
  nextBillingDate: z.coerce.date(),
  active: z.boolean().optional().default(true),
  serviceTemplateId: z.string().uuid().optional().nullable(),
  paymentMethodId: z.string().uuid().optional().nullable(),
})

export type SubscriptionCreateInput = z.infer<typeof subscriptionCreateSchema>

export const subscriptionUpdateSchema = subscriptionCreateSchema.partial()

export type SubscriptionUpdateInput = z.infer<typeof subscriptionUpdateSchema>
