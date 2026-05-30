"use server"

import { prisma } from "@/lib/prisma"
import {
  paymentMethodCreateSchema,
  paymentMethodUpdateSchema,
} from "@/lib/validations/payment-methods"
import { Prisma, PaymentMethodType } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { getTranslations } from "next-intl/server"
import { formatZodError, getUserIdOrNull } from "@/server/actions/subscriptions/shared"

type PaymentMethodActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> }

const paymentMethodInclude = {
  paymentCard: true,
} satisfies Prisma.PaymentMethodInclude

type PaymentMethodWithCard = Prisma.PaymentMethodGetPayload<{
  include: typeof paymentMethodInclude
}>

export type SerializedPaymentMethod = ReturnType<typeof serializePaymentMethod>

export async function getPaymentMethods(): Promise<
  PaymentMethodActionResult<SerializedPaymentMethod[]>
> {
  const t = await getTranslations()
  const userId = await getUserIdOrNull()
  if (!userId) {
    return { success: false, error: t("common.unauthorized") }
  }

  const rows = await prisma.paymentMethod.findMany({
    where: { userId },
    include: paymentMethodInclude,
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
  })

  return { success: true, data: rows.map(serializePaymentMethod) }
}

export async function createPaymentMethod(
  raw: unknown
): Promise<PaymentMethodActionResult<{ id: string }>> {
  const t = await getTranslations()
  const userId = await getUserIdOrNull()
  if (!userId) {
    return { success: false, error: t("common.unauthorized") }
  }

  const parsed = paymentMethodCreateSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      success: false,
      error: t("common.invalidData"),
      fieldErrors: formatZodError(parsed.error),
    }
  }

  const data = parsed.data
  const row = await prisma.paymentMethod.create({
    data: {
      userId,
      name: data.name,
      type: data.type,
      paymentCard:
        data.type === PaymentMethodType.CREDIT_CARD
          ? {
              create: {
                userId,
                nickname: data.cardNickname ?? data.name,
                brand: data.brand,
                last4: data.last4,
                closingDay: data.closingDay,
                dueDay: data.dueDay,
                limitAmount:
                  data.limitAmount === null || data.limitAmount === undefined
                    ? null
                    : new Prisma.Decimal(data.limitAmount),
              },
            }
          : undefined,
    },
    select: { id: true },
  })

  revalidatePaymentMethodPaths()
  return { success: true, data: row }
}

export async function updatePaymentMethod(
  id: string,
  raw: unknown
): Promise<PaymentMethodActionResult<{ id: string }>> {
  const t = await getTranslations()
  const userId = await getUserIdOrNull()
  if (!userId) {
    return { success: false, error: t("common.unauthorized") }
  }

  const parsed = paymentMethodUpdateSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      success: false,
      error: t("common.invalidData"),
      fieldErrors: formatZodError(parsed.error),
    }
  }

  const existing = await prisma.paymentMethod.findFirst({
    where: { id, userId },
    include: { paymentCard: true },
  })
  if (!existing) {
    return { success: false, error: t("common.notFound") }
  }

  const data = parsed.data
  await prisma.paymentMethod.update({
    where: { id },
    data: {
      name: data.name,
      isActive: data.isActive,
    },
  })

  const shouldUpdateCard =
    existing.type === PaymentMethodType.CREDIT_CARD &&
    (data.name !== undefined ||
      data.cardNickname !== undefined ||
      data.brand !== undefined ||
      data.last4 !== undefined ||
      data.closingDay !== undefined ||
      data.dueDay !== undefined ||
      data.limitAmount !== undefined)

  if (shouldUpdateCard) {
    await prisma.paymentCard.upsert({
      where: { paymentMethodId: id },
      create: {
        userId,
        paymentMethodId: id,
        nickname: data.cardNickname ?? data.name ?? existing.name,
        brand: data.brand,
        last4: data.last4,
        closingDay: data.closingDay,
        dueDay: data.dueDay,
        limitAmount: toNullableDecimal(data.limitAmount),
      },
      update: {
        nickname: data.cardNickname ?? existing.paymentCard?.nickname ?? existing.name,
        brand: data.brand,
        last4: data.last4,
        closingDay: data.closingDay,
        dueDay: data.dueDay,
        limitAmount: toNullableDecimal(data.limitAmount),
      },
    })
  }

  revalidatePaymentMethodPaths()
  return { success: true, data: { id } }
}

export async function deactivatePaymentMethod(
  id: string
): Promise<PaymentMethodActionResult<{ id: string }>> {
  return updatePaymentMethod(id, { isActive: false })
}

function serializePaymentMethod(row: PaymentMethodWithCard) {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    paymentCard: row.paymentCard
      ? {
          id: row.paymentCard.id,
          nickname: row.paymentCard.nickname,
          brand: row.paymentCard.brand,
          last4: row.paymentCard.last4,
          closingDay: row.paymentCard.closingDay,
          dueDay: row.paymentCard.dueDay,
          limitAmount: row.paymentCard.limitAmount?.toString() ?? null,
        }
      : null,
  }
}

function revalidatePaymentMethodPaths() {
  revalidatePath("/settings")
  revalidatePath("/finance-planner")
  revalidatePath("/subscriptions")
  revalidatePath("/dashboard")
}

function toNullableDecimal(value: number | null | undefined) {
  if (value === undefined) return undefined
  return value === null ? null : new Prisma.Decimal(value)
}
