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
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        {tabs.map((tab) => (
          <Button
            key={tab}
            type="button"
            size="sm"
            variant={activeTab === tab ? "default" : "outline"}
            className="h-9 w-full sm:w-auto"
            onClick={() => setActiveTab(tab)}
          >
            {t(`tabs.${tab}`)}
          </Button>
        ))}
      </div>
      <div className="grid grid-cols-2 items-center gap-2 sm:flex sm:flex-wrap lg:justify-end">
        <ViewToggle value={viewMode} onChange={setViewMode} t={t} />
        <Button type="button" size="sm" variant="outline" className="h-9 w-full sm:w-auto" onClick={onAdd}>
          <Plus className="size-4" />
          {t(`add.${activeTab}`)}
        </Button>
      </div>
    </div>
  )
}
