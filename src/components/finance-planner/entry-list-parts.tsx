import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import type { TranslationFn } from "./types"

export type EntryTone = "default" | "success" | "paid"

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
  tone = "default",
  children,
}: {
  title: string
  meta: string
  status: string
  tone?: EntryTone
  children: ReactNode
}) {
  const toneClasses = getToneClasses(tone)
  return (
    <div className={["rounded-xl border p-4", toneClasses.card].join(" ")}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-medium">{title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{meta}</p>
        </div>
        <span className={["rounded-full px-2 py-1 text-xs", toneClasses.badge].join(" ")}>
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
  toggleLabel: string
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
  t: TranslationFn
}) {
  return (
    <div className="flex flex-wrap justify-end gap-2">
      <Button type="button" size="sm" variant="outline" onClick={onToggle}>
        {toggleLabel}
      </Button>
      <Button type="button" size="sm" variant="ghost" onClick={onEdit}>
        {t("form.edit")}
      </Button>
      <Button type="button" size="sm" variant="ghost" onClick={onDelete}>
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
  return {
    card: "bg-background/60",
    badge: "bg-muted",
    row: "",
  }
}
