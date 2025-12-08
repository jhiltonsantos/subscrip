"use server"

import { signIn } from "@/auth"

export async function login(formData: FormData) {
  return signIn("nodemailer", formData)
}
