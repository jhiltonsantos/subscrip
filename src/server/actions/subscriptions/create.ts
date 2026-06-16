"use server"

import { prisma } from "@/lib/prisma"
import { subscriptionCreateSchema } from "@/lib/validations/subscription"
import { Prisma } from "@prisma/client"
import {
  assertPaymentMethodOwnedByUser,
  assertServiceTemplateExists,
  formatZodError,
  getUserIdOrNull,
  serializeSubscription,
  subscriptionInclude,
  type SerializedSubscription,
  type SubscriptionActionResult,
} from "./shared"
import {
  revalidateSubscriptionExpenseSyncPaths,
  upsertSubscriptionExpense,
} from "./expense-sync"
import { getTranslations } from "next-intl/server"

export async function createSubscription(
  raw: unknown
): Promise<SubscriptionActionResult<SerializedSubscription>> {
  const t = await getTranslations()
  
  const userId = await getUserIdOrNull()
  if (!userId) {
    return { success: false, error: t("common.unauthorized") }
  }

  const parsed = subscriptionCreateSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      success: false,
      error: t("common.invalidData"),
      fieldErrors: formatZodError(parsed.error),
    }
  }

  const data = parsed.data

  const pmErr = await assertPaymentMethodOwnedByUser(userId, data.paymentMethodId)
  if (pmErr) return pmErr

  const stErr = await assertServiceTemplateExists(data.serviceTemplateId)
  if (stErr) return stErr

  const planLabel =
    data.planLabel && data.planLabel.trim() !== ""
      ? data.planLabel.trim()
      : null

  const row = await prisma.$transaction(async (tx) => {
    const subscription = await tx.subscription.create({
      data: {
        name: data.name,
        planLabel,
        price: new Prisma.Decimal(data.price),
        currency: data.currency,
        billingCycle: data.billingCycle,
        category: data.category,
        startDate: data.startDate,
        nextBillingDate: data.nextBillingDate,
        active: data.active ?? true,
        serviceTemplateId: data.serviceTemplateId ?? undefined,
        paymentMethodId: data.paymentMethodId ?? undefined,
        userId,
      },
      include: subscriptionInclude,
    })

    await upsertSubscriptionExpense(userId, subscription, tx)

    return subscription
  })

  revalidateSubscriptionExpenseSyncPaths()
  return { success: true, data: serializeSubscription(row) }
}
