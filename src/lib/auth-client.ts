import { createAuthClient } from "better-auth/react"
import { emailOTPClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
  baseURL: process.env.APP_URL || "http://localhost:3000",
  plugins: [
    emailOTPClient(),
  ],
})

export const {
  signIn,
  signOut,
  useSession,
  emailOtp,
} = authClient
