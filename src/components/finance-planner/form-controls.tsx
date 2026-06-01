import type { ReactNode } from "react"
import { currencies } from "./constants"

export function Field({
  label,
  tooltip,
  children,
  className,
}: {
  label: string
  tooltip?: string
  children: ReactNode
  className?: string
}) {
  return (
    <label className={["grid gap-1.5 text-sm", className ?? ""].join(" ")}>
      <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        {label}
        {tooltip ? <HelpTooltip label={tooltip} /> : null}
      </span>
      {children}
    </label>
  )
}

export function HelpTooltip({ label }: { label: string }) {
  return (
    <span className="group relative inline-flex">
      <button
        type="button"
        title={label}
        aria-label={label}
        className="flex size-4 items-center justify-center rounded-full border text-[10px] text-muted-foreground"
      >
        ?
      </button>
      <span className="pointer-events-none absolute left-1/2 top-6 z-20 hidden w-56 -translate-x-1/2 rounded-md border bg-popover p-2 text-xs text-popover-foreground shadow-md group-hover:block group-focus-within:block">
        {label}
      </span>
    </span>
  )
}

export function CurrencySelect({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
    >
      {currencies.map((currency) => (
        <option key={currency} value={currency}>
          {currency}
        </option>
      ))}
    </select>
  )
}

export function CheckboxLine({
  checked,
  onChange,
  children,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  children: ReactNode
}) {
  return (
    <label className="flex items-center gap-2 text-sm sm:col-span-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      {children}
    </label>
  )
}
