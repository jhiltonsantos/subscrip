import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ActiveTab, TranslationFn, ViewMode } from "./types"
import { ViewToggle } from "./view-toggle"

export function PlanningToolbar({
  activeTab,
  setActiveTab,
  tabs = ["income", "expenses", "cardCosts"],
  viewMode,
  setViewMode,
  onAdd,
  t,
}: {
  activeTab: ActiveTab
  setActiveTab: (tab: ActiveTab) => void
  tabs?: ActiveTab[]
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
  onAdd: () => void
  t: TranslationFn
}) {
  return (
    <div className="flex flex-col gap-3 border-b pb-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Button
            key={tab}
            type="button"
            size="sm"
            variant={activeTab === tab ? "default" : "outline"}
            className="h-9"
            onClick={() => setActiveTab(tab)}
          >
            {t(`tabs.${tab}`)}
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2 lg:justify-end">
        <ViewToggle value={viewMode} onChange={setViewMode} t={t} />
        <Button type="button" size="sm" variant="outline" className="h-9" onClick={onAdd}>
          <Plus className="size-4" />
          {t(`add.${activeTab}`)}
        </Button>
      </div>
    </div>
  )
}
