import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { TranslationFn } from "./types"

export function MonthSelector({
  monthInput,
  yearInput,
  setMonthInput,
  setYearInput,
  onApply,
  isLoading,
  t,
}: {
  monthInput: string
  yearInput: string
  setMonthInput: (value: string) => void
  setYearInput: (value: string) => void
  onApply: () => void
  isLoading: boolean
  t: TranslationFn
}) {
  return (
    <div className="flex items-end gap-2">
      <NumberField label={t("filters.month")} value={monthInput} onChange={setMonthInput} />
      <NumberField label={t("filters.year")} value={yearInput} onChange={setYearInput} />
      <Button onClick={onApply} disabled={isLoading}>
        {isLoading ? t("filters.loading") : t("filters.apply")}
      </Button>
    </div>
  )
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
    <div>
      <label className="mb-1 block text-xs text-muted-foreground">{label}</label>
      <Input
        type="number"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-24"
      />
    </div>
  )
}
