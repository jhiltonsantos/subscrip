import { PaymentMethodsManager } from "@/components/settings/payment-methods-manager"
import { Container } from "@/components/ui/container"
import { getPaymentMethods } from "@/server/actions/payment-methods"
import { getTranslations } from "next-intl/server"

export const revalidate = 0

export default async function PaymentMethodsPage() {
  const t = await getTranslations("settingsPage.paymentMethods")
  const paymentMethodsResult = await getPaymentMethods()

  return (
    <Container>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="mt-2 text-muted-foreground">{t("description")}</p>
        </div>

        <PaymentMethodsManager
          initialMethods={
            paymentMethodsResult.success ? paymentMethodsResult.data : []
          }
        />
      </div>
    </Container>
  )
}
