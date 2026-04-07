import { betterAuth } from "better-auth"
import { prismaAdapter } from "@better-auth/prisma-adapter"
import { emailOTP } from "better-auth/plugins"
import { nextCookies } from "better-auth/next-js"
import { prisma } from "@/lib/prisma"
import { Resend } from "resend"

const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null

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
        if (!resend) {
          console.log(`[DEV] OTP for ${email}: ${otp} (type: ${type})`)
          return
        }

        const subjects: Record<string, string> = {
          "sign-in": "Your access code - Subscrip",
          "email-verification": "Verify your email - Subscrip",
          "forget-password": "Reset password - Subscrip",
        }

        const subject = subjects[type] || "Verification code - Subscrip"

        await resend.emails.send({
          from: process.env.EMAIL_FROM || "Subscrip <noreply@subscrip.dev>",
          to: email,
          subject,
          html: `
            <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #10B981; margin-bottom: 20px;">Subscrip</h2>
              <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">
                ${type === "sign-in" ? "Use the code below to access your account:" : ""}
                ${type === "email-verification" ? "Use the code below to verify your email:" : ""}
                ${type === "forget-password" ? "Use the code below to reset your password:" : ""}
              </p>
              <div style="background: #F3F4F6; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 20px;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #111827;">${otp}</span>
              </div>
              <p style="color: #6B7280; font-size: 14px;">
                This code expires in 5 minutes.
              </p>
              <p style="color: #9CA3AF; font-size: 12px; margin-top: 20px;">
                If you didn't request this code, ignore this email.
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
