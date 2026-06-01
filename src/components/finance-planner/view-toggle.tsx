import { LayoutGrid, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { TranslationFn, ViewMode } from "./types"

export function ViewToggle({
  value,
  onChange,
  t,
}: {
  value: ViewMode
  onChange: (value: ViewMode) => void
  t: TranslationFn
}) {
  return (
    <div className="inline-flex h-9 overflow-hidden rounded-md border bg-background">
      <Button
        type="button"
        size="sm"
        variant={value === "cards" ? "default" : "ghost"}
        className="h-full rounded-none px-3"
        onClick={() => onChange("cards")}
      >
        <LayoutGrid className="size-4" />
        {t("view.cards")}
      </Button>
      <Button
        type="button"
        size="sm"
        variant={value === "list" ? "default" : "ghost"}
        className="h-full rounded-none px-3"
        onClick={() => onChange("list")}
      >
        <List className="size-4" />
        {t("view.list")}
      </Button>
    </div>
  )
}
