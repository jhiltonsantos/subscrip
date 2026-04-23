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
  creditCardInvoices: {
    id: string
    year: number
    month: number
    status: string
    total: string
    currency: string
    paymentCardId: string
  }[]
  installmentPurchases: {
    id: string
    name: string
    totalAmount: string
    currency: string
    installmentCount: number
    paymentCardId: string
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

  const [paymentMethods, subscriptions, creditCardInvoices, installmentPurchases] =
    await Promise.all([
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
    prisma.creditCardInvoice.findMany({
      where: { userId },
      select: {
        id: true,
        year: true,
        month: true,
        status: true,
        total: true,
        currency: true,
        paymentCardId: true,
      },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    }),
    prisma.installmentPurchase.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        totalAmount: true,
        currency: true,
        installmentCount: true,
        paymentCardId: true,
      },
      orderBy: { createdAt: "desc" },
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
      creditCardInvoices: creditCardInvoices.map((invoice) => ({
        ...invoice,
        total: invoice.total.toString(),
      })),
      installmentPurchases: installmentPurchases.map((installment) => ({
        ...installment,
        totalAmount: installment.totalAmount.toString(),
      })),
    },
  }
}
