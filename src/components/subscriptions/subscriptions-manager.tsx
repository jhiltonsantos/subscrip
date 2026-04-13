"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { format } from "date-fns"
import { ptBR, enUS } from "date-fns/locale"
import { useLocale } from "next-intl"
import { ExternalLink, Pencil, Plus, Trash2 } from "lucide-react"
import { deleteSubscription, type SerializedSubscription, type SubscriptionFormOptions } from "@/server/actions/subscriptions"
import { formatCurrency } from "@/lib/utils/formatters"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { LocaleLink } from "@/components/global"
import { SubscriptionForm } from "./subscription-form"

type SubscriptionsManagerProps = {
  initialItems: SerializedSubscription[]
  formOptions: SubscriptionFormOptions
}

export function SubscriptionsManager({
  initialItems,
  formOptions,
}: SubscriptionsManagerProps) {
  const t = useTranslations("subscriptionsPage")
  const locale = useLocale()
  const router = useRouter()
  const dateLocale = locale === "pt" ? ptBR : enUS

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<SerializedSubscription | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<SerializedSubscription | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isDeleting, startDelete] = useTransition()

  function handleFormSuccess() {
    setFormOpen(false)
    setEditing(null)
    router.refresh()
  }

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(subscription: SerializedSubscription) {
    setEditing(subscription)
    setFormOpen(true)
  }

  function handleFormOpenChange(open: boolean) {
    setFormOpen(open)
    if (!open) setEditing(null)
  }

  function confirmDelete() {
    if (!deleteTarget) return
    setDeleteError(null)
    startDelete(async () => {
      const result = await deleteSubscription(deleteTarget!.id)
      if (result.success) {
        setDeleteTarget(null)
        router.refresh()
        return
      }
      setDeleteError(result.error)
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Button onClick={openCreate} className="shrink-0 gap-2">
          <Plus className="size-4" />
          {t("add")}
        </Button>
      </div>

      {initialItems.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-muted-foreground max-w-sm">{t("empty")}</p>
            <Button className="mt-4 gap-2" onClick={openCreate}>
              <Plus className="size-4" />
              {t("add")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-muted/50">
              <tr className="border-b text-left">
                <th className="p-3 font-medium">{t("table.name")}</th>
                <th className="p-3 font-medium">{t("table.price")}</th>
                <th className="p-3 font-medium">{t("table.nextBilling")}</th>
                <th className="p-3 font-medium">{t("table.status")}</th>
                <th className="p-3 font-medium text-right">{t("table.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {initialItems.map((subscription) => (
                <tr key={subscription.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="p-3">
                    <div className="font-medium">{subscription.name}</div>
                    {subscription.planLabel?.trim() ? (
                      <div className="text-muted-foreground text-xs mt-0.5">
                        {subscription.planLabel}
                      </div>
                    ) : null}
                  </td>
                  <td className="p-3">
                    {formatCurrency(Number(subscription.price), subscription.currency)}
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {format(
                      new Date(subscription.nextBillingDate),
                      "PPP",
                      { locale: dateLocale }
                    )}
                  </td>
                  <td className="p-3">
                    <span
                      className={
                        subscription.active
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-muted-foreground"
                      }
                    >
                      {subscription.active ? t("status.active") : t("status.inactive")}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" asChild title={t("rowActions.open")}>
                        <LocaleLink href={`/subscriptions/${subscription.id}`}>
                          <ExternalLink className="size-4" />
                        </LocaleLink>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title={t("rowActions.edit")}
                        onClick={() => openEdit(subscription)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        title={t("rowActions.delete")}
                        onClick={() => {
                          setDeleteError(null)
                          setDeleteTarget(subscription)
                        }}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={handleFormOpenChange}>
        <DialogContent
          className="sm:max-w-lg max-h-[90vh] overflow-y-auto"
          showCloseButton
        >
          <SubscriptionForm
            mode={editing ? "edit" : "create"}
            subscription={editing ?? undefined}
            options={formOptions}
            open={formOpen}
            onSuccess={handleFormSuccess}
            onCancel={() => handleFormOpenChange(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null)
            setDeleteError(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("delete.title")}</DialogTitle>
            <DialogDescription>
              {deleteTarget ? (
                <>
                  <span className="font-medium text-foreground">{deleteTarget!.name}</span>
                  {" — "}
                  {t("delete.description")}
                </>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          {deleteError ? (
            <p className="text-destructive text-sm" role="alert">
              {deleteError}
            </p>
          ) : null}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
            >
              {t("delete.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? t("delete.deleting") : t("delete.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
