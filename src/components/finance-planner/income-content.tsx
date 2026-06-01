import { formatCurrency } from "@/lib/utils/formatters"
import { CardGrid, EmptyState, EntryCard, RowActions, TableView } from "./entry-list-parts"
import type { PlannedIncome, TranslationFn, ViewMode } from "./types"

export function IncomeContent({
  rows,
  viewMode,
  onToggle,
  onEdit,
  onDelete,
  t,
}: {
  rows: PlannedIncome[]
  viewMode: ViewMode
  onToggle: (row: PlannedIncome) => void
  onEdit: (row: PlannedIncome) => void
  onDelete: (row: PlannedIncome) => void
  t: TranslationFn
}) {
  if (rows.length === 0) return <EmptyState>{t("income.empty")}</EmptyState>
  if (viewMode === "list") {
    return (
      <TableView
        rows={rows}
        columns={[
          { key: "name", label: t("table.name"), render: (row) => row.name },
          {
            key: "status",
            label: t("table.status"),
            render: (row) => (row.isReceived ? t("income.received") : t("income.pending")),
          },
          {
            key: "amount",
            label: t("table.amount"),
            align: "right",
            render: (row) => formatCurrency(Number(row.amount), row.currency),
          },
        ]}
        actions={(row) => (
          <RowActions
            toggleLabel={row.isReceived ? t("income.markPending") : t("income.markReceived")}
            onToggle={() => onToggle(row)}
            onEdit={() => onEdit(row)}
            onDelete={() => onDelete(row)}
            t={t}
          />
        )}
        getRowTone={(row) => (row.isReceived ? "success" : "default")}
        t={t}
      />
    )
  }

  return (
    <CardGrid>
      {rows.map((row) => (
        <EntryCard
          key={row.id}
          title={row.name}
          meta={formatCurrency(Number(row.amount), row.currency)}
          status={row.isReceived ? t("income.received") : t("income.pending")}
          tone={row.isReceived ? "success" : "default"}
        >
          <RowActions
            toggleLabel={row.isReceived ? t("income.markPending") : t("income.markReceived")}
            onToggle={() => onToggle(row)}
            onEdit={() => onEdit(row)}
            onDelete={() => onDelete(row)}
            t={t}
          />
        </EntryCard>
      ))}
    </CardGrid>
  )
}
