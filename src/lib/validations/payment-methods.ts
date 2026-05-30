import { PaymentMethodType } from "@prisma/client"
import { z } from "zod"

const nullableString = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null))
  .nullable()
  .optional()

const nullableDay = z
  .union([z.coerce.number().int().min(1).max(31), z.literal("").transform(() => null)])
  .nullable()
  .optional()

const nullableAmount = z
  .union([z.coerce.number().positive(), z.literal("").transform(() => null)])
  .nullable()
  .optional()

const basePaymentMethodSchema = z.object({
    name: z.string().trim().min(1).max(120),
    type: z.nativeEnum(PaymentMethodType),
    cardNickname: nullableString,
    brand: nullableString,
    last4: z
      .string()
      .trim()
      .regex(/^\d{4}$/, "Use the last 4 digits")
      .nullable()
      .optional()
      .or(z.literal("").transform(() => null)),
    closingDay: nullableDay,
    dueDay: nullableDay,
    limitAmount: nullableAmount,
  })

export const paymentMethodCreateSchema = basePaymentMethodSchema
  .superRefine((data, ctx) => {
    if (data.type === PaymentMethodType.CREDIT_CARD && !data.cardNickname) {
      ctx.addIssue({
        code: "custom",
        path: ["cardNickname"],
        message: "Card nickname is required",
      })
    }
  })

export const paymentMethodUpdateSchema = basePaymentMethodSchema
  .omit({ type: true })
  .extend({
    name: z.string().trim().min(1).max(120).optional(),
    isActive: z.boolean().optional(),
  })

export type PaymentMethodCreateInput = z.infer<typeof paymentMethodCreateSchema>
export type PaymentMethodUpdateInput = z.infer<typeof paymentMethodUpdateSchema>
