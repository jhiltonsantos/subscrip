"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import type { ExpenseBucket } from "@prisma/client"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { formatChartCurrency } from "@/components/charts/format-chart-currency"
import { useLocale } from "next-intl"

const BUCKET_KEYS: ExpenseBucket[] = [
  "MONTHLY_BILLS",
  "FIXED_CARD",
  "CREDIT_CARD",
  "OTHER",
]

export type ExpenseStackChartPoint = {
  label: string
} & Record<ExpenseBucket, number>

type ExpenseStackBarChartProps = {
  data: ExpenseStackChartPoint[]
  config: ChartConfig
}

export function ExpenseStackBarChart({ data, config }: ExpenseStackBarChartProps) {
  const locale = useLocale()

  return (
    <ChartContainer config={config} className="aspect-auto h-[300px] w-full">
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="label"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) =>
                formatChartCurrency(Number(value), locale)
              }
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        {BUCKET_KEYS.map((bucket) => (
          <Bar
            key={bucket}
            dataKey={bucket}
            stackId="expenses"
            fill={`var(--color-${bucket})`}
            radius={bucket === "OTHER" ? [4, 4, 0, 0] : [0, 0, 0, 0]}
          />
        ))}
      </BarChart>
    </ChartContainer>
  )
}
