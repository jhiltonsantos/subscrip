"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import {
  getUserIdOrNull,
  type SubscriptionActionResult,
} from "./shared"
import { getTranslations } from "next-intl/server"

export async function deleteSubscription(
  id: string
): Promise<SubscriptionActionResult<{ id: string }>> {
  const t = await getTranslations()

  const userId = await getUserIdOrNull()
  if (!userId) {
    return { success: false, error: t("common.unauthorized") }
  }

  const existing = await prisma.subscription.findFirst({
    where: { id, userId },
    select: { id: true },
  })
  if (!existing) {
    return { success: false, error: t("common.notFound") }
  }

  await prisma.subscription.delete({
    where: { id },
  })

  revalidatePath("/dashboard")
  revalidatePath("/subscriptions")
  return { success: true, data: { id } }
}
