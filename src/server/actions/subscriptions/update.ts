"use server"

import { prisma } from "@/lib/prisma"
import { subscriptionUpdateSchema } from "@/lib/validations/subscription"
import { Prisma } from "@prisma/client"
import { revalidatePath } from "next/cache"
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
import { getTranslations } from "next-intl/server"

export async function updateSubscription(
  id: string,
  raw: unknown
): Promise<SubscriptionActionResult<SerializedSubscription>> {
  const t = await getTranslations()
  
  const userId = await getUserIdOrNull()
  if (!userId) {
    return { success: false, error: t("common.unauthorized") }
  }

  const parsed = subscriptionUpdateSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      success: false,
      error: t("common.invalidData"),
      fieldErrors: formatZodError(parsed.error),
    }
  }

  const data = parsed.data
  if (Object.keys(data).length === 0) {
    return { success: false, error: t("common.invalidData") }
  }

  const existing = await prisma.subscription.findFirst({
    where: { id, userId },
  })
  if (!existing) {
    return { success: false, error: t("common.notFound") }
  }

  if (data.paymentMethodId !== undefined) {
    const pmErr = await assertPaymentMethodOwnedByUser(userId, data.paymentMethodId)
    if (pmErr) return pmErr
  }

  if (data.serviceTemplateId !== undefined) {
    const stErr = await assertServiceTemplateExists(data.serviceTemplateId)
    if (stErr) return stErr
  }

  const updateData: Prisma.SubscriptionUpdateInput = {}

  if (data.name !== undefined) updateData.name = data.name
  if (data.planLabel !== undefined) {
    updateData.planLabel =
      data.planLabel && data.planLabel.trim() !== ""
        ? data.planLabel.trim()
        : null
  }
  if (data.price !== undefined) updateData.price = new Prisma.Decimal(data.price)
  if (data.currency !== undefined) updateData.currency = data.currency
  if (data.billingCycle !== undefined) updateData.billingCycle = data.billingCycle
  if (data.category !== undefined) updateData.category = data.category
  if (data.startDate !== undefined) updateData.startDate = data.startDate
  if (data.nextBillingDate !== undefined)
    updateData.nextBillingDate = data.nextBillingDate
  if (data.active !== undefined) updateData.active = data.active
  if (data.serviceTemplateId !== undefined)
    updateData.serviceTemplate = data.serviceTemplateId
      ? { connect: { id: data.serviceTemplateId } }
      : { disconnect: true }
  if (data.paymentMethodId !== undefined)
    updateData.paymentMethod = data.paymentMethodId
      ? { connect: { id: data.paymentMethodId } }
      : { disconnect: true }

  const row = await prisma.subscription.update({
    where: { id },
    data: updateData,
    include: subscriptionInclude,
  })

  revalidatePath("/dashboard")
  revalidatePath("/subscriptions")
  return { success: true, data: serializeSubscription(row) }
}
