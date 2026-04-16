"use server"

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";

export async function getUser() {
  const t = await getTranslations()
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) {
    return { success: false, error: t("common.unauthorized") }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id},
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      language: true,
      preferredCurrency: true,
      theme: true,
      defaultReminderDays: true,
    }
  })

  if (!user) {
    return { success: false, error: t("common.notFound") }
  }

  return { success: true, data: user }
}