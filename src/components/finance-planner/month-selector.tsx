import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { TranslationFn } from "./types"

export function MonthSelector({
  monthInput,
  yearInput,
  selectedMonth,
  selectedYear,
  setMonthInput,
  setYearInput,
  onApply,
  isLoading,
  t,
}: {
  monthInput: string
  yearInput: string
  selectedMonth: number
  selectedYear: number
  setMonthInput: (value: string) => void
  setYearInput: (value: string) => void
  onApply: () => void
  isLoading: boolean
  t: TranslationFn
}) {
  const monthStatus = getMonthStatus(selectedMonth, selectedYear)

  return (
    <div className="grid w-full grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)_auto] items-end gap-2 sm:w-auto">
      <span
        className={[
          "mb-1 flex h-9 items-center rounded-full border px-3 text-xs font-medium",
          getMonthStatusClasses(monthStatus),
        ].join(" ")}
      >
        {t(`filters.${monthStatus}`)}
      </span>
      <NumberField label={t("filters.month")} value={monthInput} onChange={setMonthInput} />
      <NumberField label={t("filters.year")} value={yearInput} onChange={setYearInput} />
      <Button className="h-9 px-4" onClick={onApply} disabled={isLoading}>
        {isLoading ? t("filters.loading") : t("filters.apply")}
      </Button>
    </div>
  )
}

function getMonthStatus(month: number, year: number) {
  if (Number.isNaN(month) || Number.isNaN(year) || month < 1 || month > 12) {
    return "current"
  }

  const now = new Date()
  const selectedMonthIndex = year * 12 + month
  const currentMonthIndex = now.getFullYear() * 12 + now.getMonth() + 1

  if (selectedMonthIndex < currentMonthIndex) return "past"
  if (selectedMonthIndex > currentMonthIndex) return "future"
  return "current"
}

function getMonthStatusClasses(status: string) {
  if (status === "past") return "border-muted-foreground/30 bg-muted/30 text-muted-foreground"
  if (status === "future") return "border-blue-500/30 bg-blue-500/10 text-blue-400"
  return "border-primary/30 bg-primary/10 text-primary"
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="min-w-0">
      <label className="mb-1 block text-xs text-muted-foreground">{label}</label>
      <Input
        type="number"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full min-w-0"
      />
    </div>
  )
}
