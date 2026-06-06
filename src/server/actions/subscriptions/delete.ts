"use server"

import { prisma } from "@/lib/prisma"
import {
  getUserIdOrNull,
  type SubscriptionActionResult,
} from "./shared"
import {
  deleteSubscriptionExpense,
  revalidateSubscriptionExpenseSyncPaths,
} from "./expense-sync"
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

  await prisma.$transaction(async (tx) => {
    await deleteSubscriptionExpense(userId, id, tx)
    await tx.subscription.delete({
      where: { id },
    })
  })

  revalidateSubscriptionExpenseSyncPaths()
  return { success: true, data: { id } }
}
