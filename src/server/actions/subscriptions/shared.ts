import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"
import type { ZodError } from "zod"
import { headers } from "next/headers"
import { getTranslations } from "next-intl/server"

export const subscriptionInclude = {
  serviceTemplate: true,
  paymentMethod: true,
  reminders: true,
} satisfies Prisma.SubscriptionInclude

export type SubscriptionWithRelations = Prisma.SubscriptionGetPayload<{
  include: typeof subscriptionInclude
}>

export function serializeSubscription(row: SubscriptionWithRelations) {
  return {
    ...row,
    price: row.price.toString(),
    startDate: row.startDate.toISOString(),
    nextBillingDate: row.nextBillingDate.toISOString(),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    serviceTemplate: row.serviceTemplate
      ? {
          ...row.serviceTemplate,
          createdAt: row.serviceTemplate.createdAt.toISOString(),
          updatedAt: row.serviceTemplate.updatedAt.toISOString(),
        }
      : null,
    paymentMethod: row.paymentMethod
      ? {
          ...row.paymentMethod,
          createdAt: row.paymentMethod.createdAt.toISOString(),
          updatedAt: row.paymentMethod.updatedAt.toISOString(),
        }
      : null,
    reminders: row.reminders.map((r) => ({
      id: r.id,
      daysBefore: r.daysBefore,
      channel: r.channel,
      preferredTime: r.preferredTime,
      enabled: r.enabled,
      lastSentAt: r.lastSentAt ? r.lastSentAt.toISOString() : null,
      subscriptionId: r.subscriptionId,
      userId: r.userId,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    })),
  }
}

export type SerializedSubscription = ReturnType<typeof serializeSubscription>

export type SubscriptionActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> }

export async function getUserIdOrNull(): Promise<string | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  return session?.user?.id ?? null
}

export async function assertPaymentMethodOwnedByUser(
  userId: string,
  paymentMethodId: string | null | undefined
): Promise<SubscriptionActionResult<never> | null> {
  if (!paymentMethodId) return null
  const pm = await prisma.paymentMethod.findFirst({
    where: { id: paymentMethodId, userId },
  })
  if (!pm) {
    const t = await getTranslations()
    return {
      success: false,
      error: t("actions.subscriptions.assertPaymentMethodOwnedByUser.error"),
    }
  }
  return null
}

export async function assertServiceTemplateExists(
  serviceTemplateId: string | null | undefined
): Promise<SubscriptionActionResult<never> | null> {
  if (!serviceTemplateId) return null
  const st = await prisma.serviceTemplate.findUnique({
    where: { id: serviceTemplateId },
  })
  if (!st) {
    const t = await getTranslations()
    return {
      success: false,
      error: t("actions.subscriptions.assertServiceTemplateExists.error"),
    }
  }
  return null
}

export function formatZodError(err: ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {}
  for (const issue of err.issues) {
    const path = issue.path.join(".") || "_root"
    if (!fieldErrors[path]) fieldErrors[path] = []
    fieldErrors[path].push(issue.message)
  }
  return fieldErrors
}
