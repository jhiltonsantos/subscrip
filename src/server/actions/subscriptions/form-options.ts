"use server"

import { prisma } from "@/lib/prisma"
import { getTranslations } from "next-intl/server"
import { getUserIdOrNull } from "./shared"

export type SubscriptionFormOptions = {
  serviceTemplates: { id: string; name: string }[]
  paymentMethods: { id: string; name: string; type: string }[]
}

export async function getSubscriptionFormOptions(): Promise<
  | { success: true; data: SubscriptionFormOptions }
  | { success: false; error: string }
> {
  const t = await getTranslations()
  const userId = await getUserIdOrNull()
  if (!userId) {
    return { success: false, error: t("common.unauthorized") }
  }

  const [serviceTemplates, paymentMethods] = await Promise.all([
    prisma.serviceTemplate.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.paymentMethod.findMany({
      where: { userId, isActive: true },
      select: { id: true, name: true, type: true },
      orderBy: { name: "asc" },
    }),
  ])

  return {
    success: true,
    data: { serviceTemplates, paymentMethods },
  }
}
