import { Container } from "@/components/ui/container"
import { ReportsBoard } from "@/components/reports/reports-board"
import { auth } from "@/lib/auth"
import { localizedRedirect } from "@/lib/i18n/localized-redirect"
import { headers } from "next/headers"
import { getFinanceTrend } from "@/server/actions/finance-planner"

export const revalidate = 0

export default async function ReportsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return localizedRedirect("/auth/login")
  }

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  const trendResult = await getFinanceTrend({ year, month, count: 12 })
  const points = trendResult.success ? trendResult.data.points : []

  return (
    <Container>
      <ReportsBoard
        initialPoints={points}
        initialYear={year}
        initialMonth={month}
      />
    </Container>
  )
}
