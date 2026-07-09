"use client"

import { useMemo, useState } from "react"
import { Cell, Pie, PieChart, Sector } from "recharts"
import type { PieSectorDataItem } from "recharts/types/polar/Pie"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  formatChartCurrency,
  formatChartPercent,
} from "@/components/charts/format-chart-currency"
import { useLocale } from "next-intl"

export type ExpenseDonutPoint = {
  key: string
  label: string
  value: number
  fill: string
}

type EnrichedDonutPoint = ExpenseDonutPoint & {
  percent: number
}

type ExpenseDonutChartProps = {
  data: ExpenseDonutPoint[]
  config: ChartConfig
}

const MIN_LABEL_PERCENT = 8

export function ExpenseDonutChart({ data, config }: ExpenseDonutChartProps) {
  const locale = useLocale()
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const enriched = useMemo(() => enrichDonutData(data), [data])
  const total = useMemo(
    () => enriched.reduce((sum, item) => sum + item.value, 0),
    [enriched]
  )

  if (enriched.length === 0) {
    return null
  }

  return (
    <div className="flex w-full flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-center">
      <div className="relative mx-auto w-full max-w-[280px] shrink-0">
        <ChartContainer
          config={config}
          className="mx-auto aspect-square h-[260px] w-full"
        >
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value, _name, item) => {
                    const point = item.payload as EnrichedDonutPoint
                    return (
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium">{point.label}</span>
                        <span>
                          {formatChartCurrency(Number(value), locale)} ·{" "}
                          {formatChartPercent(point.percent, locale)}
                        </span>
                      </div>
                    )
                  }}
                />
              }
            />
            <Pie
              data={enriched}
              dataKey="value"
              nameKey="label"
              innerRadius={58}
              outerRadius={96}
              strokeWidth={2}
              labelLine={false}
              label={(props) => renderSegmentLabel(props, locale)}
              activeIndex={activeIndex ?? undefined}
              activeShape={renderActiveShape}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {enriched.map((entry, index) => (
                <Cell
                  key={entry.key}
                  fill={entry.fill}
                  opacity={
                    activeIndex !== null && activeIndex !== index ? 0.45 : 1
                  }
                  className="transition-opacity duration-150"
                />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Total
          </span>
          <span className="text-lg font-semibold tabular-nums">
            {formatChartCurrency(total, locale)}
          </span>
        </div>
      </div>

      <ul className="w-full min-w-0 flex-1 space-y-2.5 sm:max-w-[240px]">
        {enriched.map((entry) => (
          <li
            key={entry.key}
            className="flex items-center gap-2.5 text-sm"
          >
            <span
              className="size-3 shrink-0 rounded-sm"
              style={{ backgroundColor: entry.fill }}
              aria-hidden
            />
            <span className="min-w-0 flex-1 truncate font-medium">
              {entry.label}
            </span>
            <span className="shrink-0 tabular-nums text-muted-foreground">
              {formatChartCurrency(entry.value, locale)}
            </span>
            <span className="w-12 shrink-0 text-right tabular-nums text-muted-foreground">
              {formatChartPercent(entry.percent, locale)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function enrichDonutData(data: ExpenseDonutPoint[]): EnrichedDonutPoint[] {
  const filtered = data.filter((item) => item.value > 0)
  const total = filtered.reduce((sum, item) => sum + item.value, 0)

  return filtered.map((item) => ({
    ...item,
    percent: total > 0 ? (item.value / total) * 100 : 0,
  }))
}

function renderSegmentLabel(
  props: PieSectorDataItem,
  locale: string
) {
  const percent = (props.percent ?? 0) * 100
  if (percent < MIN_LABEL_PERCENT) {
    return null
  }

  const value = Number(props.value ?? 0)
  const cx = props.cx ?? 0
  const cy = props.cy ?? 0
  const midAngle = props.midAngle ?? 0
  const innerRadius = props.innerRadius ?? 0
  const outerRadius = props.outerRadius ?? 0
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos((-midAngle * Math.PI) / 180)
  const y = cy + radius * Math.sin((-midAngle * Math.PI) / 180)

  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="central"
      className="fill-foreground text-[9px] font-medium sm:text-[10px]"
    >
      <tspan x={x} dy="-0.5em">
        {formatChartCurrency(value, locale)}
      </tspan>
      <tspan x={x} dy="1.2em">
        {formatChartPercent(percent, locale)}
      </tspan>
    </text>
  )
}

function renderActiveShape(props: PieSectorDataItem) {
  const {
    cx = 0,
    cy = 0,
    innerRadius = 0,
    outerRadius = 0,
    startAngle = 0,
    endAngle = 0,
    fill = "currentColor",
  } = props

  return (
    <Sector
      cx={cx}
      cy={cy}
      innerRadius={innerRadius}
      outerRadius={outerRadius + 8}
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
      stroke="var(--foreground)"
      strokeWidth={2}
    />
  )
}
