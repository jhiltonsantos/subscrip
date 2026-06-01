import { format, type Locale } from "date-fns"
import { formatCurrency } from "@/lib/utils/formatters"
import { CardGrid, EmptyState, EntryCard, RowActions, TableView } from "./entry-list-parts"
import type { PlannedExpense, TranslationFn, ViewMode } from "./types"
import { formatInstallment } from "./utils"

export function CardCostsContent({
  rows,
  viewMode,
  onToggle,
  onEdit,
  onDelete,
  t,
  dateLocale,
}: {
  rows: PlannedExpense[]
  viewMode: ViewMode
  onToggle: (row: PlannedExpense) => void
  onEdit: (row: PlannedExpense) => void
  onDelete: (row: PlannedExpense) => void
  t: TranslationFn
  dateLocale: Locale
}) {
  if (rows.length === 0) return <EmptyState>{t("cards.empty")}</EmptyState>
  if (viewMode === "list") {
    return (
      <TableView
        rows={rows}
        columns={[
          { key: "name", label: t("table.name"), render: (row) => row.name },
          {
            key: "card",
            label: t("table.card"),
            render: (row) => row.paymentCard?.nickname ?? row.paymentMethod?.name ?? "-",
          },
          {
            key: "date",
            label: t("table.date"),
            render: (row) =>
              row.purchaseDate ? format(new Date(row.purchaseDate), "P", { locale: dateLocale }) : "-",
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
            toggleLabel={row.isPaid ? t("expense.markPending") : t("expense.markPaid")}
            onToggle={() => onToggle(row)}
            onEdit={() => onEdit(row)}
            onDelete={() => onDelete(row)}
            t={t}
          />
        )}
        getRowTone={(row) => (row.isPaid ? "paid" : "default")}
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
          meta={[
            row.paymentCard?.nickname ?? row.paymentMethod?.name ?? t("tabs.cardCosts"),
            row.merchantName,
            formatInstallment(row),
          ].filter(Boolean).join(" · ")}
          status={formatCurrency(Number(row.amount), row.currency)}
          tone={row.isPaid ? "paid" : "default"}
        >
          <RowActions
            toggleLabel={row.isPaid ? t("expense.markPending") : t("expense.markPaid")}
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
