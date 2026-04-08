import { betterAuth } from "better-auth"
import { prismaAdapter } from "@better-auth/prisma-adapter"
import { emailOTP } from "better-auth/plugins"
import { nextCookies } from "better-auth/next-js"
import { prisma } from "@/lib/prisma"
import { Resend } from "resend"
import { serverT } from "@/lib/i18n/server-translations"
import { cookies } from "next/headers"

const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null

async function getLocaleFromCookie(): Promise<string> {
  try {
    const cookieStore = await cookies()
    return cookieStore.get("NEXT_LOCALE")?.value || "en"
  } catch {
    return "en"
  }
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: false,
  },
  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: 300, // 5 minutes
      async sendVerificationOTP({ email, otp, type }) {
        const locale = await getLocaleFromCookie()

        if (!resend) {
          console.log(`[DEV] OTP for ${email}: ${otp} (type: ${type}, locale: ${locale})`)
          return
        }

        const subjectKeys: Record<string, string> = {
          "sign-in": "email.otp.signIn",
          "email-verification": "email.otp.emailVerification",
          "forget-password": "email.otp.forgetPassword",
        }

        const bodyKeys: Record<string, string> = {
          "sign-in": "email.otp.signInBody",
          "email-verification": "email.otp.emailVerificationBody",
          "forget-password": "email.otp.forgetPasswordBody",
        }

        const subject = await serverT(locale, subjectKeys[type] || "email.otp.fallback")
        const bodyText = await serverT(locale, bodyKeys[type] || "email.otp.signInBody")
        const expires = await serverT(locale, "email.otp.expires")
        const ignore = await serverT(locale, "email.otp.ignore")

        await resend.emails.send({
          from: process.env.EMAIL_FROM || "Subscrip <noreply@subscrip.dev>",
          to: email,
          subject,
          html: `
            <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #10B981; margin-bottom: 20px;">Subscrip</h2>
              <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">
                ${bodyText}
              </p>
              <div style="background: #F3F4F6; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 20px;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #111827;">${otp}</span>
              </div>
              <p style="color: #6B7280; font-size: 14px;">
                ${expires}
              </p>
              <p style="color: #9CA3AF; font-size: 12px; margin-top: 20px;">
                ${ignore}
              </p>
            </div>
          `,
        })
      },
    }),
    nextCookies(),
  ],
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },
  trustedOrigins: [
    process.env.BETTER_AUTH_URL || "http://localhost:3000",
  ],
})

export type Session = typeof auth.$Infer.Session
