import { z } from "zod"
import { BillingCycle, Category, Currency } from "@prisma/client"
import { getTranslations } from "next-intl/server"

const t = await getTranslations()

export const subscriptionCreateSchema = z.object({
  name: z.string().min(1, t("common.required")).max(200),
  planLabel: z.string().max(120).nullable().optional(),
  price: z.coerce.number().positive(t("common.positive")),
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
