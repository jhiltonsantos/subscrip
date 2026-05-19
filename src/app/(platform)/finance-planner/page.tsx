import { Container } from "@/components/ui/container"
import { FinancePlannerBoard } from "@/components/finance-planner/finance-planner-board"

export const revalidate = 0

export default function FinancePlannerPage() {
  return (
    <Container>
      <FinancePlannerBoard />
    </Container>
  )
}
