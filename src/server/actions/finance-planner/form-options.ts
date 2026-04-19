"use server"

import { prisma } from "@/lib/prisma"
import { getTranslations } from "next-intl/server"
import {
  getUserIdOrNull,
  type FinancePlannerActionResult,
} from "./shared"

export type FinancePlannerFormOptions = {
  paymentMethods: {
    id: string
    name: string
    type: string
    paymentCard: {
      id: string
      nickname: string
      brand: string | null
      last4: string | null
    } | null
  }[]
  subscriptions: {
    id: string
    name: string
    price: string
    currency: string
    paymentMethodId: string | null
  }[]
}

export async function getFinancePlannerFormOptions(): Promise<
  FinancePlannerActionResult<FinancePlannerFormOptions>
> {
  const t = await getTranslations()

  const userId = await getUserIdOrNull()
  if (!userId) {
    return { success: false, error: t("common.unauthorized") }
  }

  const [paymentMethods, subscriptions] = await Promise.all([
    prisma.paymentMethod.findMany({
      where: { userId, isActive: true },
      select: {
        id: true,
        name: true,
        type: true,
        paymentCard: {
          select: {
            id: true,
            nickname: true,
            brand: true,
            last4: true,
          },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.subscription.findMany({
      where: { userId, active: true },
      select: {
        id: true,
        name: true,
        price: true,
        currency: true,
        paymentMethodId: true,
      },
      orderBy: { name: "asc" },
    }),
  ])

  return {
    success: true,
    data: {
      paymentMethods,
      subscriptions: subscriptions.map((subscription) => ({
        ...subscription,
        price: subscription.price.toString(),
      })),
    },
  }
}
