"use server"

import { prisma } from "@/lib/prisma"
import { localeToLanguage, Locale } from "@/lib/i18n/config"
import { getTranslations } from "next-intl/server"
import { getUser } from "./get"

export async function changeUserLanguage(locale: Locale) {
  const t = await getTranslations()
  const userResult = await getUser()

  if (!userResult.success || !userResult.data) {
    return { success: false, error: userResult.error ?? t("common.notFound") }
  }
  const user = userResult.data
  const language = localeToLanguage[locale]

  await prisma.user.upsert({
    where: { id: user.id },
    create: { id: user.id, email: user.email, language },
    update: { language },
  })
}