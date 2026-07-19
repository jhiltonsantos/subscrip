"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
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

export type ComparisonChartPoint = {
  metric: string
  monthA: number
  monthB: number
}

type ComparisonBarChartProps = {
  data: ComparisonChartPoint[]
  config: ChartConfig
  monthALabel: string
  monthBLabel: string
}

export function ComparisonBarChart({
  data,
  config,
  monthALabel,
  monthBLabel,
}: ComparisonBarChartProps) {
  const locale = useLocale()
  const chartConfig = {
    ...config,
    monthA: { label: monthALabel, color: "var(--chart-2)" },
    monthB: { label: monthBLabel, color: "var(--chart-3)" },
  }

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-[320px] w-full">
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="metric"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
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
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="monthA" fill="var(--color-monthA)" radius={4} />
        <Bar dataKey="monthB" fill="var(--color-monthB)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}
