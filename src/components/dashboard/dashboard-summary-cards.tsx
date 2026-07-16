"use client"

import type { LucideIcon } from "lucide-react"
import {
  CalendarDays,
  CreditCard,
  DollarSign,
  TrendingDown,
  TrendingUp,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { LocaleLink } from "@/components/global"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils/formatters"
import { cn } from "@/lib/utils/helpers"

type SummaryCardId =
  | "plannedIncome"
  | "plannedExpenses"
  | "activeSubscriptions"
  | "totalOutflow"
  | "projectedBalance"

type DashboardSummaryCardsProps = {
  plannedIncomeTotal: number
  plannedExpenseTotal: number
  activeCount: number
  totalOutflow: number
  projectedBalance: number
  projectedBalanceFooter: string
}

type CardConfig = {
  id: SummaryCardId
  href: string
  titleKey:
    | "cards.plannedIncome"
    | "cards.plannedExpenses"
    | "cards.activeSubscriptions"
    | "cards.totalOutflow"
    | "cards.projectedBalance"
  icon: LucideIcon
  iconWrapperClass: string
  iconClass: string
  valueClass: string
  getValue: (props: DashboardSummaryCardsProps) => string
  getFooter: (props: DashboardSummaryCardsProps, t: ReturnType<typeof useTranslations>) => string
}

const CARD_CONFIGS: CardConfig[] = [
  {
    id: "plannedIncome",
    href: "/finance-planner",
    titleKey: "cards.plannedIncome",
    icon: TrendingUp,
    iconWrapperClass: "bg-emerald-100 dark:bg-emerald-900/50",
    iconClass: "text-emerald-600 dark:text-emerald-400",
    valueClass: "text-emerald-600 dark:text-emerald-400",
    getValue: (props) => formatCurrency(props.plannedIncomeTotal, "BRL"),
    getFooter: (_, t) => t("cards.currentMonth"),
  },
  {
    id: "plannedExpenses",
    href: "/finance-planner",
    titleKey: "cards.plannedExpenses",
    icon: TrendingDown,
    iconWrapperClass: "bg-red-100 dark:bg-red-900/50",
    iconClass: "text-red-600 dark:text-red-400",
    valueClass: "text-red-600 dark:text-red-400",
    getValue: (props) => formatCurrency(props.plannedExpenseTotal, "BRL"),
    getFooter: (_, t) => t("cards.currentMonth"),
  },
  {
    id: "activeSubscriptions",
    href: "/subscriptions",
    titleKey: "cards.activeSubscriptions",
    icon: CreditCard,
    iconWrapperClass: "bg-blue-100 dark:bg-blue-900/50",
    iconClass: "text-blue-600 dark:text-blue-400",
    valueClass: "text-blue-600 dark:text-blue-400",
    getValue: (props) => String(props.activeCount),
    getFooter: (props, t) => t("cards.subscriptionCount", { count: props.activeCount }),
  },
  {
    id: "totalOutflow",
    href: "/finance-planner",
    titleKey: "cards.totalOutflow",
    icon: DollarSign,
    iconWrapperClass: "bg-amber-100 dark:bg-amber-900/50",
    iconClass: "text-amber-600 dark:text-amber-400",
    valueClass: "text-amber-600 dark:text-amber-400",
    getValue: (props) => formatCurrency(props.totalOutflow, "BRL"),
    getFooter: (_, t) => t("cards.plannedPlusSubscriptions"),
  },
  {
    id: "projectedBalance",
    href: "/finance-planner",
    titleKey: "cards.projectedBalance",
    icon: CalendarDays,
    iconWrapperClass: "bg-violet-100 dark:bg-violet-900/50",
    iconClass: "text-violet-600 dark:text-violet-400",
    valueClass: "text-violet-600 dark:text-violet-400",
    getValue: (props) => formatCurrency(props.projectedBalance, "BRL"),
    getFooter: (props) => props.projectedBalanceFooter,
  },
]

export function DashboardSummaryCards(props: DashboardSummaryCardsProps) {
  const t = useTranslations("dashboard")

  return (
    <div
      role="region"
      aria-label={t("cards.regionLabel")}
      className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 snap-x snap-mandatory lg:mx-0 lg:grid lg:grid-cols-2 lg:gap-4 lg:overflow-visible lg:px-0 lg:pb-0 lg:snap-none xl:grid-cols-5"
    >
      {CARD_CONFIGS.map((config) => {
        const Icon = config.icon

        return (
          <LocaleLink
            key={config.id}
            href={config.href}
            className="min-w-[70vw] shrink-0 snap-start rounded-xl transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:min-w-[220px] lg:min-w-0"
          >
            <Card className="h-full cursor-pointer gap-3 border-transparent py-4 hover:border-border/60 lg:gap-6 lg:py-6">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 pb-1 lg:px-6 lg:pb-2">
                <CardTitle className="text-sm font-medium">{t(config.titleKey)}</CardTitle>
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full",
                    config.iconWrapperClass
                  )}
                >
                  <Icon className={cn("h-4 w-4", config.iconClass)} />
                </div>
              </CardHeader>
              <CardContent className="px-4 lg:px-6">
                <div
                  className={cn(
                    "text-xl font-bold lg:text-2xl",
                    config.valueClass
                  )}
                >
                  {config.getValue(props)}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {config.getFooter(props, t)}
                </p>
              </CardContent>
            </Card>
          </LocaleLink>
        )
      })}
    </div>
  )
}
