import { formatCurrency } from "@/lib/utils/formatters"
import { CardGrid, EmptyState, EntryCard, RowActions, TableView } from "./entry-list-parts"
import type { PlannedExpense, TranslationFn, ViewMode } from "./types"
import { formatExpenseInstallment } from "./utils"

export function ExpenseContent({
  rows,
  viewMode,
  onToggle,
  onEdit,
  onDelete,
  t,
}: {
  rows: PlannedExpense[]
  viewMode: ViewMode
  onToggle: (row: PlannedExpense) => void
  onEdit: (row: PlannedExpense) => void
  onDelete: (row: PlannedExpense) => void
  t: TranslationFn
}) {
  if (rows.length === 0) return <EmptyState>{t("expense.empty")}</EmptyState>
  const hasInstallments = rows.some((row) => formatExpenseInstallment(row))
  if (viewMode === "list") {
    return (
      <TableView
        rows={rows}
        columns={[
          { key: "name", label: t("table.name"), render: (row) => row.name },
          {
            key: "bucket",
            label: t("table.bucket"),
            render: (row) => t(`buckets.${row.expenseBucket}`),
          },
          ...(hasInstallments
            ? [
                {
                  key: "installment",
                  label: t("table.installment"),
                  render: (row: PlannedExpense) => formatExpenseInstallment(row) ?? "-",
                },
              ]
            : []),
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
            formatCurrency(Number(row.amount), row.currency),
            t(`buckets.${row.expenseBucket}`),
            row.merchantName,
            formatExpenseInstallment(row),
          ].filter(Boolean).join(" · ")}
          status={row.isPaid ? t("expense.paid") : t("expense.pending")}
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
