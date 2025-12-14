"use server"

import { signIn } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export async function login(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase()
  if (!email) {
    redirect("/auth/login")
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true }
  })

  if (!user) {
    redirect(`/auth/login?error=user_not_found&email=${encodeURIComponent(email)}`)
  }

  return signIn("nodemailer", formData)
}

export async function register(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase()
  const nameRaw = formData.get("name")
  const name = typeof nameRaw === "string" ? nameRaw.trim() : ""

  if (!email) {
    redirect("/auth/register")
  }

  await prisma.user.upsert({
    where: { email },
    create: {
      email,
      name: name || null
    },
    update: {
      name: name || undefined
    },
    select: { id: true }
  })

  const fd = new FormData()
  fd.set("email", email)
  return signIn("nodemailer", fd)
}
