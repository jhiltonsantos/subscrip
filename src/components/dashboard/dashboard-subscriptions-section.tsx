"use client"

import { useState } from "react"
import { format } from "date-fns"
import { enUS, ptBR } from "date-fns/locale"
import { useLocale, useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CardGrid } from "@/components/finance-planner/entry-list-parts"
import { ViewToggle } from "@/components/finance-planner/view-toggle"
import type { ViewMode } from "@/components/finance-planner/types"
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
  const viewT = useTranslations("financePlanner")
  const locale = useLocale()
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const dateLocale = locale === "pt" ? ptBR : enUS

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
                dueLabel={t("subscriptions.due", {
                  date: sub.nextChargeIso
                    ? format(new Date(sub.nextChargeIso), "dd 'de' MMMM", {
                        locale: dateLocale,
                      })
                    : "",
                })}
              />
            ))}
          </div>
        ) : (
          <CardGrid>
            {subscriptions.map((sub) => (
              <SubscriptionGridCard
                key={sub.id}
                subscription={sub}
                dueLabel={
                  sub.nextChargeIso
                    ? t("subscriptions.due", {
                        date: format(new Date(sub.nextChargeIso), "dd 'de' MMMM", {
                          locale: dateLocale,
                        }),
                      })
                    : null
                }
              />
            ))}
          </CardGrid>
        )}
      </CardContent>
    </Card>
  )
}

function SubscriptionListRow({
  subscription,
  dueLabel,
}: {
  subscription: DashboardSubscriptionItem
  dueLabel: string
}) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-muted/30 p-4 transition-colors hover:bg-muted/50">
      <div className="flex flex-col">
        <span className="font-medium">{subscription.name}</span>
        <span className="text-xs capitalize text-muted-foreground">
          {subscription.category.toLowerCase()} • {subscription.billingCycle.toLowerCase()}
        </span>
      </div>
      <div className="text-right">
        <div className="font-bold text-emerald-600 dark:text-emerald-400">
          {formatCurrency(subscription.price, subscription.currency)}
        </div>
        {subscription.nextChargeIso ? (
          <div className="text-xs text-muted-foreground">{dueLabel}</div>
        ) : null}
      </div>
    </div>
  )
}

function SubscriptionGridCard({
  subscription,
  dueLabel,
}: {
  subscription: DashboardSubscriptionItem
  dueLabel: string | null
}) {
  return (
    <div className="rounded-xl border bg-muted/20 p-4 shadow-sm transition-colors hover:bg-muted/40">
      <div className="space-y-3">
        <div>
          <p className="font-medium">{subscription.name}</p>
          <p className="mt-1 text-xs capitalize text-muted-foreground">
            {subscription.category.toLowerCase()} • {subscription.billingCycle.toLowerCase()}
          </p>
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
