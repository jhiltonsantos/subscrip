import { format, type Locale } from "date-fns"
import { isChargeAwaiting } from "@/lib/subscription-billing"
import { formatCurrency } from "@/lib/utils/formatters"
import { CardGrid, EmptyState, EntryCard, RowActions, TableView } from "./entry-list-parts"
import type { PlannedExpense, TranslationFn, ViewMode } from "./types"
import { formatExpenseInstallment } from "./utils"

function isSubscriptionCharge(row: PlannedExpense) {
  return Boolean(row.subscriptionId || row.source === "SUBSCRIPTION")
}

export function CardCostsContent({
  rows,
  viewMode,
  onEdit,
  onDelete,
  t,
  dateLocale,
}: {
  rows: PlannedExpense[]
  viewMode: ViewMode
  onEdit: (row: PlannedExpense) => void
  onDelete: (row: PlannedExpense) => void
  t: TranslationFn
  dateLocale: Locale
}) {
  if (rows.length === 0) return <EmptyState>{t("cards.empty")}</EmptyState>
  const hasInstallments = rows.some((row) => formatExpenseInstallment(row))
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
              row.dueDate ? format(new Date(row.dueDate), "P", { locale: dateLocale }) : "-",
          },
          {
            key: "status",
            label: t("table.status"),
            render: (row) =>
              isSubscriptionCharge(row) && isChargeAwaiting(row.dueDate)
                ? t("cards.pendingCharge")
                : row.isPaid
                  ? t("expense.paid")
                  : t("expense.pending"),
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
            onEdit={() => onEdit(row)}
            onDelete={() => onDelete(row)}
            t={t}
          />
        )}
        getRowTone={(row) => {
          if (isSubscriptionCharge(row) && isChargeAwaiting(row.dueDate)) return "pending"
          return row.isPaid ? "paid" : "default"
        }}
        t={t}
      />
    )
  }

  return (
    <CardGrid>
      {rows.map((row) => {
        const awaiting = isSubscriptionCharge(row) && isChargeAwaiting(row.dueDate)
        const chargeDate = row.dueDate
          ? format(new Date(row.dueDate), "P", { locale: dateLocale })
          : null

        return (
          <EntryCard
            key={row.id}
            title={row.name}
            meta={[
              row.paymentCard?.nickname ?? row.paymentMethod?.name ?? t("tabs.cardCosts"),
              row.merchantName,
              formatExpenseInstallment(row),
              chargeDate
                ? awaiting
                  ? t("cards.chargeDate", { date: chargeDate })
                  : chargeDate
                : null,
            ]
              .filter(Boolean)
              .join(" · ")}
            status={formatCurrency(Number(row.amount), row.currency)}
            badge={awaiting ? t("cards.pendingCharge") : null}
            tone={awaiting ? "pending" : row.isPaid ? "paid" : "default"}
          >
            <RowActions
              onEdit={() => onEdit(row)}
              onDelete={() => onDelete(row)}
              t={t}
            />
          </EntryCard>
        )
      })}
    </CardGrid>
  )
}
