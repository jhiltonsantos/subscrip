"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InputOTP } from "@/components/ui/input-otp"
import { authClient } from "@/lib/auth-client"
import { UserPlus, Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

type Step = "form" | "otp"

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("form")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "sign-in",
      })

      if (error) {
        setError(error.message || "Erro ao enviar código")
        return
      }

      setStep("otp")
    } catch {
      setError("Erro ao enviar código. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const { error } = await authClient.signIn.emailOtp({
        email,
        otp,
        name: name || undefined,
      })

      if (error) {
        setError(error.message || "Código inválido")
        return
      }

      router.push("/dashboard")
      router.refresh()
    } catch {
      setError("Erro ao verificar código. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    setStep("form")
    setOtp("")
    setError("")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-emerald-50 via-background to-emerald-100/50 dark:from-emerald-950/30 dark:via-background dark:to-emerald-900/20 p-4">
      <Card className="w-full max-w-[420px]">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto bg-emerald-100 dark:bg-emerald-900/50 w-14 h-14 flex items-center justify-center rounded-full mb-2">
            <UserPlus className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {step === "form" ? "Create account" : "Enter the code"}
          </CardTitle>
          <CardDescription>
            {step === "form"
              ? "Fill in your details to create your account."
              : `We sent a 6-digit code to ${email}`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          {step === "form" ? (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <Input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                className="h-11"
              />

              <Input
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="h-11"
              />

              <Button
                className="w-full h-11 text-base font-medium"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Create account"
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground px-4">
                By continuing, you agree to our Terms of Service and Privacy Policy.
              </p>

              <p className="text-sm text-center text-muted-foreground">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <InputOTP
                length={6}
                value={otp}
                onChange={setOtp}
                disabled={isLoading}
              />

              <Button
                className="w-full h-11 text-base font-medium"
                type="submit"
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify and create account"
                )}
              </Button>

              <div className="flex flex-col gap-2 text-center">
                <button
                  type="button"
                  onClick={handleBack}
                  className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Back and edit details
                </button>
                <button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={isLoading}
                  className="text-sm text-primary hover:underline disabled:opacity-50"
                >
                  Resend code
                </button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
