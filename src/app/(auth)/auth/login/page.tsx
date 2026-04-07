"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InputOTP } from "@/components/ui/input-otp"
import { authClient } from "@/lib/auth-client"
import { Mail, Loader2, ArrowLeft } from "lucide-react"
import { LocaleLink } from "@/components/global"
import { useTranslations } from "next-intl"

type Step = "email" | "otp"

export default function LoginPage() {
  const t = useTranslations("auth.login")
  const router = useRouter()
  const [step, setStep] = useState<Step>("email")
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
        setError(error.message || t("errorSendCode"))
        return
      }

      setStep("otp")
    } catch {
      setError(t("errorSendCodeRetry"))
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
      })

      if (error) {
        setError(error.message || t("errorInvalidCode"))
        return
      }

      router.push("/dashboard")
      router.refresh()
    } catch {
      setError(t("errorVerifyCode"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    setStep("email")
    setOtp("")
    setError("")
  }

  return (
    <Card className="w-full max-w-[400px]">
      <CardHeader className="text-center space-y-2">
        <div className="mx-auto bg-emerald-100 dark:bg-emerald-900/50 w-14 h-14 flex items-center justify-center rounded-full mb-2">
          <Mail className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
        </div>
        <CardTitle className="text-2xl font-bold">
          {step === "email" ? t("title") : t("titleOtp")}
        </CardTitle>
        <CardDescription>
          {step === "email"
            ? t("description")
            : t("descriptionOtp", { email })
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        {step === "email" ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <Input
              type="email"
              placeholder={t("emailPlaceholder")}
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
                  {t("sending")}
                </>
              ) : (
                t("sendCode")
              )}
            </Button>

            <p className="text-sm text-center text-muted-foreground">
              {t("noAccount")}{" "}
              <LocaleLink href="/auth/register" className="text-primary hover:underline">
                {t("createAccount")}
              </LocaleLink>
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
                  {t("verifying")}
                </>
              ) : (
                t("verifyCode")
              )}
            </Button>

            <div className="flex flex-col gap-2 text-center">
              <button
                type="button"
                onClick={handleBack}
                className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center justify-center gap-1"
              >
                <ArrowLeft className="h-3 w-3" />
                {t("backEmail")}
              </button>
              <button
                type="button"
                onClick={handleSendOTP}
                disabled={isLoading}
                className="text-sm text-primary hover:underline disabled:opacity-50"
              >
                {t("resendCode")}
              </button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
