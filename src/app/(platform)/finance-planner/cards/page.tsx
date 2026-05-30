import { CardExpensesBoard } from "@/components/finance-planner/card-expenses-board"
import { Container } from "@/components/ui/container"

export const revalidate = 0

export default function FinancePlannerCardsPage() {
  return (
    <Container className="xl:max-w-384">
      <CardExpensesBoard />
    </Container>
  )
}
