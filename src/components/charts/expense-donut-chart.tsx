"use client"

import { Cell, Pie, PieChart } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { formatChartCurrency } from "@/components/charts/format-chart-currency"
import { useLocale } from "next-intl"

export type ExpenseDonutPoint = {
  key: string
  label: string
  value: number
  fill: string
}

type ExpenseDonutChartProps = {
  data: ExpenseDonutPoint[]
  config: ChartConfig
}

export function ExpenseDonutChart({ data, config }: ExpenseDonutChartProps) {
  const locale = useLocale()
  const filtered = data.filter((item) => item.value > 0)

  if (filtered.length === 0) {
    return null
  }

  return (
    <ChartContainer config={config} className="mx-auto aspect-square h-[280px] w-full max-w-[320px]">
      <PieChart>
        <ChartTooltip
          content={
            <ChartTooltipContent
              nameKey="label"
              formatter={(value) =>
                formatChartCurrency(Number(value), locale)
              }
            />
          }
        />
        <Pie
          data={filtered}
          dataKey="value"
          nameKey="label"
          innerRadius={60}
          outerRadius={100}
          strokeWidth={2}
        >
          {filtered.map((entry) => (
            <Cell key={entry.key} fill={entry.fill} />
          ))}
        </Pie>
      </PieChart>
    </ChartContainer>
  )
}
