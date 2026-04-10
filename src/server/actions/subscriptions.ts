"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  subscriptionCreateSchema,
  subscriptionUpdateSchema,
} from "@/lib/validations/subscription"
import { Prisma } from "@prisma/client"
import type { ZodError } from "zod"
import { revalidatePath } from "next/cache"
import { headers } from "next/headers"

const subscriptionInclude = {
  serviceTemplate: true,
  paymentMethod: true,
  reminders: true,
} satisfies Prisma.SubscriptionInclude

export type SubscriptionWithRelations = Prisma.SubscriptionGetPayload<{
  include: typeof subscriptionInclude
}>

function serializeSubscription(row: SubscriptionWithRelations) {
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

async function getUserIdOrNull(): Promise<string | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  return session?.user?.id ?? null
}

async function assertPaymentMethodOwnedByUser(
  userId: string,
  paymentMethodId: string | null | undefined
): Promise<SubscriptionActionResult<never> | null> {
  if (!paymentMethodId) return null
  const pm = await prisma.paymentMethod.findFirst({
    where: { id: paymentMethodId, userId },
  })
  if (!pm) {
    return {
      success: false,
      error: "Método de pagamento não encontrado ou não pertence ao usuário.",
    }
  }
  return null
}

async function assertServiceTemplateExists(
  serviceTemplateId: string | null | undefined
): Promise<SubscriptionActionResult<never> | null> {
  if (!serviceTemplateId) return null
  const st = await prisma.serviceTemplate.findUnique({
    where: { id: serviceTemplateId },
  })
  if (!st) {
    return {
      success: false,
      error: "Template de serviço não encontrado.",
    }
  }
  return null
}

function formatZodError(err: ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {}
  for (const issue of err.issues) {
    const path = issue.path.join(".") || "_root"
    if (!fieldErrors[path]) fieldErrors[path] = []
    fieldErrors[path].push(issue.message)
  }
  return fieldErrors
}

export async function listSubscriptions(): Promise<
  SubscriptionActionResult<SerializedSubscription[]>
> {
  const userId = await getUserIdOrNull()
  if (!userId) {
    return { success: false, error: "Não autenticado." }
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

export async function getSubscription(
  id: string
): Promise<SubscriptionActionResult<SerializedSubscription>> {
  const userId = await getUserIdOrNull()
  if (!userId) {
    return { success: false, error: "Não autenticado." }
  }

  const row = await prisma.subscription.findFirst({
    where: { id, userId },
    include: subscriptionInclude,
  })

  if (!row) {
    return { success: false, error: "Assinatura não encontrada." }
  }

  return { success: true, data: serializeSubscription(row) }
}

export async function createSubscription(
  raw: unknown
): Promise<SubscriptionActionResult<SerializedSubscription>> {
  const userId = await getUserIdOrNull()
  if (!userId) {
    return { success: false, error: "Não autenticado." }
  }

  const parsed = subscriptionCreateSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      success: false,
      error: "Dados inválidos.",
      fieldErrors: formatZodError(parsed.error),
    }
  }

  const data = parsed.data

  const pmErr = await assertPaymentMethodOwnedByUser(userId, data.paymentMethodId)
  if (pmErr) return pmErr

  const stErr = await assertServiceTemplateExists(data.serviceTemplateId)
  if (stErr) return stErr

  const row = await prisma.subscription.create({
    data: {
      name: data.name,
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

  revalidatePath("/dashboard")
  return { success: true, data: serializeSubscription(row) }
}

export async function updateSubscription(
  id: string,
  raw: unknown
): Promise<SubscriptionActionResult<SerializedSubscription>> {
  const userId = await getUserIdOrNull()
  if (!userId) {
    return { success: false, error: "Não autenticado." }
  }

  const parsed = subscriptionUpdateSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      success: false,
      error: "Dados inválidos.",
      fieldErrors: formatZodError(parsed.error),
    }
  }

  const data = parsed.data
  if (Object.keys(data).length === 0) {
    return { success: false, error: "Nenhum campo para atualizar." }
  }

  const existing = await prisma.subscription.findFirst({
    where: { id, userId },
  })
  if (!existing) {
    return { success: false, error: "Assinatura não encontrada." }
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
  return { success: true, data: serializeSubscription(row) }
}

export async function deleteSubscription(
  id: string
): Promise<SubscriptionActionResult<{ id: string }>> {
  const userId = await getUserIdOrNull()
  if (!userId) {
    return { success: false, error: "Não autenticado." }
  }

  const existing = await prisma.subscription.findFirst({
    where: { id, userId },
    select: { id: true },
  })
  if (!existing) {
    return { success: false, error: "Assinatura não encontrada." }
  }

  await prisma.subscription.delete({
    where: { id },
  })

  revalidatePath("/dashboard")
  return { success: true, data: { id } }
}
