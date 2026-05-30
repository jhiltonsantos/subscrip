import { SettingsForm } from "@/components/settings/settings-form"
import { PaymentMethodsManager } from "@/components/settings/payment-methods-manager"
import { Container } from "@/components/ui/container"
import { getPaymentMethods } from "@/server/actions/payment-methods"
import { getUser } from "@/server/actions/user"
import { getTranslations } from "next-intl/server"

export const revalidate = 0

export default async function SettingsPage() {
  const t = await getTranslations("settingsPage")
  const [userResult, paymentMethodsResult] = await Promise.all([
    getUser(),
    getPaymentMethods(),
  ])

  if (!userResult.success || !userResult.data) {
    return (
      <Container>
        <p className="text-destructive py-8">
          {userResult.error ?? t("loadError")}
        </p>
      </Container>
    )
  }

  return (
    <Container>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground mt-2">{t("subtitle")}</p>
        </div>

        <SettingsForm user={userResult.data} />
        <PaymentMethodsManager
          initialMethods={
            paymentMethodsResult.success ? paymentMethodsResult.data : []
          }
        />
      </div>
    </Container>
  )
}
