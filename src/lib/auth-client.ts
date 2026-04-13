import { createAuthClient } from "better-auth/react"
import { emailOTPClient } from "better-auth/client/plugins"

function getAuthBaseURL(): string {
  if (typeof window !== "undefined") {
    return window.location.origin
  }
  return (
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000"
  )
}

export const authClient = createAuthClient({
  baseURL: getAuthBaseURL(),
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
