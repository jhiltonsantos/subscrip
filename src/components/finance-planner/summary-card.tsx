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
  const formattedValue = formatCurrency(value, "BRL")

  return (
    <Card className="h-full">
      <CardContent className="grid min-h-32 grid-rows-[auto_1fr] gap-2 px-4 pb-4 pt-3 sm:min-h-36">
        <p className="self-start text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">
          {title}
        </p>
        <p
          className={[
            "flex min-w-0 items-center justify-center text-center font-semibold leading-tight tracking-tight",
            getValueTextSize(formattedValue),
            positive === undefined ? "" : positive ? "text-emerald-600" : "text-red-600",
          ].join(" ")}
        >
          <span className="max-w-full wrap-break-word">{formattedValue}</span>
        </p>
      </CardContent>
    </Card>
  )
}

function getValueTextSize(value: string) {
  if (value.length > 16) return "text-lg sm:text-xl lg:text-lg xl:text-xl"
  if (value.length > 12) return "text-xl sm:text-2xl lg:text-xl xl:text-2xl"
  return "text-2xl sm:text-3xl lg:text-2xl xl:text-3xl"
}
