"use server"

import { prisma } from "@/lib/prisma"
import {
  getUserIdOrNull,
  serializeSubscription,
  subscriptionInclude,
  type SerializedSubscription,
  type SubscriptionActionResult,
} from "./shared"
import { getTranslations } from "next-intl/server"

export async function getSubscription(
  id: string
): Promise<SubscriptionActionResult<SerializedSubscription>> {
  const t = await getTranslations()
  
  const userId = await getUserIdOrNull()
  if (!userId) {
    return { success: false, error: t("common.unauthorized") }
  }

  const row = await prisma.subscription.findFirst({
    where: { id, userId },
    include: subscriptionInclude,
  })

  if (!row) {
    return { success: false, error: t("common.notFound") }
  }

  return { success: true, data: serializeSubscription(row) }
}
