"use client"

import { useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CardGrid } from "@/components/finance-planner/entry-list-parts"
import { ViewToggle } from "@/components/finance-planner/view-toggle"
import type { ViewMode } from "@/components/finance-planner/types"
import {
  formatSubscriptionDueDate,
  getBillingCycleLabel,
  getCategoryLabel,
} from "@/lib/subscription-labels"
import { formatCurrency } from "@/lib/utils/formatters"

export type DashboardSubscriptionItem = {
  id: string
  name: string
  category: string
  billingCycle: string
  price: number
  currency: string
  nextChargeIso: string | null
}

type DashboardSubscriptionsSectionProps = {
  subscriptions: DashboardSubscriptionItem[]
}

export function DashboardSubscriptionsSection({
  subscriptions,
}: DashboardSubscriptionsSectionProps) {
  const t = useTranslations("dashboard")
  const viewT = useTranslations("financePlannerPage")
  const subscriptionsT = useTranslations("subscriptionsPage")
  const locale = useLocale()
  const [viewMode, setViewMode] = useState<ViewMode>("list")

  function formatDueLabel(nextChargeIso: string | null) {
    if (!nextChargeIso) return null

    return t("subscriptions.due", {
      date: formatSubscriptionDueDate(new Date(nextChargeIso), locale),
    })
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>{t("subscriptions.title")}</CardTitle>
        {subscriptions.length > 0 ? (
          <ViewToggle value={viewMode} onChange={setViewMode} t={viewT} />
        ) : null}
      </CardHeader>
      <CardContent>
        {subscriptions.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">{t("subscriptions.empty")}</p>
            <Button variant="link" className="mt-2 text-primary">
              {t("subscriptions.addFirst")}
            </Button>
          </div>
        ) : viewMode === "list" ? (
          <div className="space-y-3">
            {subscriptions.map((sub) => (
              <SubscriptionListRow
                key={sub.id}
                subscription={sub}
                metaLabel={formatSubscriptionMeta(sub, subscriptionsT)}
                dueLabel={formatDueLabel(sub.nextChargeIso)}
              />
            ))}
          </div>
        ) : (
          <CardGrid>
            {subscriptions.map((sub) => (
              <SubscriptionGridCard
                key={sub.id}
                subscription={sub}
                metaLabel={formatSubscriptionMeta(sub, subscriptionsT)}
                dueLabel={formatDueLabel(sub.nextChargeIso)}
              />
            ))}
          </CardGrid>
        )}
      </CardContent>
    </Card>
  )
}

function formatSubscriptionMeta(
  subscription: DashboardSubscriptionItem,
  t: ReturnType<typeof useTranslations<"subscriptionsPage">>
) {
  return `${getCategoryLabel(subscription.category, t)} • ${getBillingCycleLabel(subscription.billingCycle, t)}`
}

function SubscriptionListRow({
  subscription,
  metaLabel,
  dueLabel,
}: {
  subscription: DashboardSubscriptionItem
  metaLabel: string
  dueLabel: string | null
}) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-muted/30 p-4 transition-colors hover:bg-muted/50">
      <div className="flex flex-col">
        <span className="font-medium">{subscription.name}</span>
        <span className="text-xs text-muted-foreground">{metaLabel}</span>
      </div>
      <div className="text-right">
        <div className="font-bold text-emerald-600 dark:text-emerald-400">
          {formatCurrency(subscription.price, subscription.currency)}
        </div>
        {dueLabel ? <div className="text-xs text-muted-foreground">{dueLabel}</div> : null}
      </div>
    </div>
  )
}

function SubscriptionGridCard({
  subscription,
  metaLabel,
  dueLabel,
}: {
  subscription: DashboardSubscriptionItem
  metaLabel: string
  dueLabel: string | null
}) {
  return (
    <div className="rounded-xl border bg-muted/20 p-4 shadow-sm transition-colors hover:bg-muted/40">
      <div className="space-y-3">
        <div>
          <p className="font-medium">{subscription.name}</p>
          <p className="mt-1 text-xs text-muted-foreground">{metaLabel}</p>
        </div>
        <div>
          <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(subscription.price, subscription.currency)}
          </p>
          {dueLabel ? <p className="mt-1 text-xs text-muted-foreground">{dueLabel}</p> : null}
        </div>
      </div>
    </div>
  )
}
