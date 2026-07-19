"use client"

import { useMemo, useState } from "react"
import { Pie, PieChart, Sector } from "recharts"
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

type PieSectorProps = PieSectorDataItem & {
  isActive?: boolean
  payload?: EnrichedDonutPoint
}

type ExpenseDonutChartProps = {
  data: ExpenseDonutPoint[]
  config: ChartConfig
  compact?: boolean
}

const MIN_LABEL_PERCENT = 8

export function ExpenseDonutChart({
  data,
  config,
  compact = false,
}: ExpenseDonutChartProps) {
  const locale = useLocale()
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const enriched = useMemo(() => enrichDonutData(data), [data])
  const total = useMemo(
    () => enriched.reduce((sum, item) => sum + item.value, 0),
    [enriched]
  )

  if (enriched.length === 0) {
    return null
  }

  // Compact (landing): chart-only, larger, centered — no side/bottom legend
  const chartSize = compact ? "h-[240px]" : "h-[260px]"
  const chartMaxWidth = compact ? "max-w-[240px]" : "max-w-[280px]"
  const innerRadius = 58
  const outerRadius = 96

  return (
    <div
      className={
        compact
          ? "flex w-full items-center justify-center"
          : "flex w-full flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-center"
      }
    >
      <div className={`relative mx-auto w-full shrink-0 ${chartMaxWidth}`}>
        <ChartContainer
          config={config}
          className={`mx-auto aspect-square w-full ${chartSize}`}
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
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              strokeWidth={2}
              labelLine={false}
              label={
                compact
                  ? undefined
                  : (props) => renderSegmentLabel(props, locale)
              }
              shape={(props) =>
                renderPieSector(props as PieSectorProps, hoveredIndex)
              }
              onMouseEnter={(_, index) => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
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

      {!compact ? (
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
      ) : null}
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

function renderPieSector(
  props: PieSectorProps,
  hoveredIndex: number | null
) {
  const {
    cx = 0,
    cy = 0,
    innerRadius = 0,
    outerRadius = 0,
    startAngle = 0,
    endAngle = 0,
    isActive = false,
    payload,
  } = props

  const fill = payload?.fill ?? props.fill ?? "currentColor"
  const isHovered = hoveredIndex !== null
  const opacity = isHovered && !isActive ? 0.45 : 1

  return (
    <Sector
      cx={cx}
      cy={cy}
      innerRadius={innerRadius}
      outerRadius={isActive ? outerRadius + 8 : outerRadius}
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
      stroke={isActive ? "var(--foreground)" : undefined}
      strokeWidth={isActive ? 2 : 0}
      opacity={opacity}
      className="transition-opacity duration-150"
    />
  )
}
