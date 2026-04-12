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

export async function listSubscriptions(): Promise<
  SubscriptionActionResult<SerializedSubscription[]>
> {

  const t = await getTranslations()
  const userId = await getUserIdOrNull()
  if (!userId) {
    return { success: false, error: t("common.unauthorized") }
  }

  const rows = await prisma.subscription.findMany({
    where: { userId },
    include: subscriptionInclude,
    orderBy: { nextBillingDate: "asc" },
  })

  return {
    success: true,
    data: rows.map(serializeSubscription),
  }
}
