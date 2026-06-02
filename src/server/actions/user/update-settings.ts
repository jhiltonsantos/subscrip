"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  darkThemeVariantSchema,
  userSettingsSchema,
} from "@/lib/validations/user-settings"
import { getTranslations } from "next-intl/server"
import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import type { ZodError } from "zod"

const userSettingsSelect = {
  id: true,
  name: true,
  email: true,
  image: true,
  language: true,
  preferredCurrency: true,
  theme: true,
  darkThemeVariant: true,
  defaultReminderDays: true,
  defaultReminderChannel: true,
} as const

type UserSettingsActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> }

function formatZodError(err: ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {}
  for (const issue of err.issues) {
    const path = issue.path.join(".") || "_root"
    if (!fieldErrors[path]) fieldErrors[path] = []
    fieldErrors[path].push(issue.message)
  }
  return fieldErrors
}

export async function updateUserSettings(
  raw: unknown
): Promise<
  UserSettingsActionResult<{
    id: string
    name: string | null
    email: string
    image: string | null
    language: string
    preferredCurrency: "BRL" | "USD" | "EUR"
    theme: "LIGHT" | "DARK" | "SYSTEM"
    darkThemeVariant: "BLUE" | "BLACK"
    defaultReminderDays: number
    defaultReminderChannel: "EMAIL" | "PUSH" | "BOTH"
  }>
> {
  const t = await getTranslations()
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    return { success: false, error: t("common.unauthorized") }
  }

  const parsed = userSettingsSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      success: false,
      error: t("common.invalidData"),
      fieldErrors: formatZodError(parsed.error),
    }
  }

  const data = parsed.data
  const name = data.name?.trim() || null

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name,
      preferredCurrency: data.preferredCurrency,
      theme: data.theme,
      darkThemeVariant: data.darkThemeVariant,
      language: data.language,
      defaultReminderDays: data.defaultReminderDays,
      defaultReminderChannel: data.defaultReminderChannel,
    },
    select: userSettingsSelect,
  })

  revalidatePath("/settings")
  revalidatePath("/dashboard")

  return { success: true, data: user }
}

export async function updateDarkThemeVariant(
  raw: unknown
): Promise<
  UserSettingsActionResult<{
    darkThemeVariant: "BLUE" | "BLACK"
  }>
> {
  const t = await getTranslations()
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    return { success: false, error: t("common.unauthorized") }
  }

  const parsed = darkThemeVariantSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      success: false,
      error: t("common.invalidData"),
      fieldErrors: formatZodError(parsed.error),
    }
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      darkThemeVariant: parsed.data.darkThemeVariant,
    },
    select: {
      darkThemeVariant: true,
    },
  })

  revalidatePath("/settings")

  return { success: true, data: user }
}
