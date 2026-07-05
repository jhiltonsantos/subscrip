import { localizedRedirect } from "@/lib/i18n/localized-redirect"

export const revalidate = 0

export default async function FinancePlannerCardsPage() {
  return localizedRedirect("/card-invoice")
}
