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
    <div className="inline-flex h-9 w-full overflow-hidden rounded-md border bg-background sm:w-auto">
      <Button
        type="button"
        size="sm"
        variant={value === "cards" ? "default" : "ghost"}
        className="h-full flex-1 rounded-none px-3 sm:flex-none"
        onClick={() => onChange("cards")}
      >
        <LayoutGrid className="size-4" />
        {t("view.cards")}
      </Button>
      <Button
        type="button"
        size="sm"
        variant={value === "list" ? "default" : "ghost"}
        className="h-full flex-1 rounded-none px-3 sm:flex-none"
        onClick={() => onChange("list")}
      >
        <List className="size-4" />
        {t("view.list")}
      </Button>
    </div>
  )
}
