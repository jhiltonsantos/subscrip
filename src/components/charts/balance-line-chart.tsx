"use client"

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { formatChartCurrency } from "@/components/charts/format-chart-currency"
import { useLocale } from "next-intl"

export type BalanceChartPoint = {
  label: string
  balance: number
}

type BalanceLineChartProps = {
  data: BalanceChartPoint[]
  config: ChartConfig
}

export function BalanceLineChart({ data, config }: BalanceLineChartProps) {
  const locale = useLocale()

  return (
    <ChartContainer config={config} className="aspect-auto h-[280px] w-full">
      <LineChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) =>
            formatChartCurrency(Number(value), locale)
          }
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
        <Line
          type="monotone"
          dataKey="balance"
          stroke="var(--color-balance)"
          strokeWidth={2}
          dot={{ fill: "var(--color-balance)", r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ChartContainer>
  )
}
