"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
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

export type CashFlowChartPoint = {
  label: string
  income: number
  expense: number
}

type CashFlowBarChartProps = {
  data: CashFlowChartPoint[]
  config: ChartConfig
  className?: string
}

export function CashFlowBarChart({
  data,
  config,
  className = "aspect-auto h-[280px] w-full",
}: CashFlowBarChartProps) {
  const locale = useLocale()

  return (
    <ChartContainer config={config} className={className}>
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
        <Bar dataKey="income" fill="var(--color-income)" radius={4} />
        <Bar dataKey="expense" fill="var(--color-expense)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}
