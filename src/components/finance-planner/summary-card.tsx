import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils/formatters"

export function SummaryCard({
  title,
  value,
  positive,
}: {
  title: string
  value: number
  positive?: boolean
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {title}
        </p>
        <p
          className={[
            "mt-2 text-lg font-semibold",
            positive === undefined ? "" : positive ? "text-emerald-600" : "text-red-600",
          ].join(" ")}
        >
          {formatCurrency(value, "BRL")}
        </p>
      </CardContent>
    </Card>
  )
}
