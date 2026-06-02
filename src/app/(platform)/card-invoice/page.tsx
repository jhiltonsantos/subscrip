import { Container } from "@/components/ui/container"
import { CardInvoiceBoard } from "@/components/finance-planner/card-invoice-board"

export const revalidate = 0

export default function CardInvoicePage() {
  return (
    <Container>
      <CardInvoiceBoard />
    </Container>
  )
}
