import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import type { TranslationFn } from "./types"

export type EntryTone = "default" | "success" | "paid" | "pending"

export type TableColumn<T> = {
  key: string
  label: string
  align?: "left" | "right"
  render: (row: T) => ReactNode
}

export function TableView<T extends { id: string }>({
  rows,
  columns,
  actions,
  getRowTone,
  t,
}: {
  rows: T[]
  columns: TableColumn<T>[]
  actions: (row: T) => ReactNode
  getRowTone?: (row: T) => EntryTone
  t: TranslationFn
}) {
  return (
    <div className="overflow-x-auto rounded-lg border bg-background/60">
      <table className="w-full min-w-[760px] text-sm">
        <thead className="bg-muted/40">
          <tr className="border-b text-left">
            {columns.map((column) => (
              <th
                key={column.key}
                className={[
                  "p-3 font-medium",
                  column.align === "right" ? "text-right" : "text-left",
                ].join(" ")}
              >
                {column.label}
              </th>
            ))}
            <th className="p-3 text-right font-medium">{t("table.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className={[
                "border-b last:border-0",
                getToneClasses(getRowTone?.(row) ?? "default").row,
              ].join(" ")}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={[
                    "p-3",
                    column.align === "right" ? "text-right" : "text-left",
                  ].join(" ")}
                >
                  {column.render(row)}
                </td>
              ))}
              <td className="p-3">{actions(row)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function CardGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{children}</div>
}

export function EntryCard({
  title,
  meta,
  status,
  badge,
  tone = "default",
  children,
}: {
  title: string
  meta: string
  status: string
  badge?: string | null
  tone?: EntryTone
  children: ReactNode
}) {
  const toneClasses = getToneClasses(tone)
  return (
    <div className={["rounded-xl border p-4 shadow-sm sm:shadow-none", toneClasses.card].join(" ")}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium">{title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{meta}</p>
          {badge ? (
            <span
              className={[
                "mt-2 inline-flex rounded-full px-2.5 py-1 text-xs",
                toneClasses.badge,
              ].join(" ")}
            >
              {badge}
            </span>
          ) : null}
        </div>
        <span className="mt-0.5 shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs">
          {status}
        </span>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  )
}

export function RowActions({
  toggleLabel,
  onToggle,
  onEdit,
  onDelete,
  t,
}: {
  toggleLabel?: string
  onToggle?: () => void
  onEdit: () => void
  onDelete: () => void
  t: TranslationFn
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end">
      {toggleLabel && onToggle ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="col-span-2 w-full sm:col-span-1 sm:w-auto"
          onClick={onToggle}
        >
          {toggleLabel}
        </Button>
      ) : null}
      <Button type="button" size="sm" variant="ghost" className="w-full sm:w-auto" onClick={onEdit}>
        {t("form.edit")}
      </Button>
      <Button type="button" size="sm" variant="ghost" className="w-full sm:w-auto" onClick={onDelete}>
        {t("form.delete")}
      </Button>
    </div>
  )
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="rounded-lg border p-6 text-sm text-muted-foreground">{children}</p>
}

function getToneClasses(tone: EntryTone) {
  if (tone === "success") {
    return {
      card: "border-primary/40 bg-primary/10",
      badge: "bg-primary text-primary-foreground",
      row: "bg-primary/5",
    }
  }
  if (tone === "paid") {
    return {
      card: "border-blue-500/40 bg-blue-500/10",
      badge: "bg-blue-500 text-white",
      row: "bg-blue-500/5",
    }
  }
  if (tone === "pending") {
    return {
      card: "border-amber-500/40 bg-amber-500/10",
      badge: "bg-amber-500 text-white",
      row: "bg-amber-500/5",
    }
  }
  return {
    card: "bg-background/60",
    badge: "bg-muted",
    row: "",
  }
}
