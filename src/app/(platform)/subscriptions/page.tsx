import { Container } from "@/components/ui/container"
import { SubscriptionsManager } from "@/components/subscriptions/subscriptions-manager"
import {
  getSubscriptionFormOptions,
  listSubscriptions,
} from "@/server/actions/subscriptions"
import { getTranslations } from "next-intl/server"

export const revalidate = 0

export default async function SubscriptionsPage() {
  const t = await getTranslations("subscriptionsPage")

  const [listRes, optionsRes] = await Promise.all([
    listSubscriptions(),
    getSubscriptionFormOptions(),
  ])

  if (!listRes.success) {
    return (
      <Container>
        <p className="text-destructive py-8">{t("loadError")}</p>
      </Container>
    )
  }

  const formOptions = optionsRes.success
    ? optionsRes.data
    : { serviceTemplates: [], paymentMethods: [] }

  return (
    <Container>
      {!optionsRes.success ? (
        <p className="text-amber-600 dark:text-amber-500 mb-4 text-sm">
          {t("optionsError")}
        </p>
      ) : null}
      <SubscriptionsManager
        initialItems={listRes.data}
        formOptions={formOptions}
      />
    </Container>
  )
}
