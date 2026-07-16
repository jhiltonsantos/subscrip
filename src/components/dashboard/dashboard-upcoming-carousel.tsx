"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { format } from "date-fns"
import { CalendarClock, CreditCard } from "lucide-react"
import { useTranslations } from "next-intl"
import { LocaleLink } from "@/components/global"
import { formatCurrency } from "@/lib/utils/formatters"
import { cn } from "@/lib/utils/helpers"

export type DashboardUpcomingBill = {
  id: string
  name: string
  amount: number
  currency: string
  dueDateIso: string
  href: "/finance-planner" | "/card-invoice"
}

export type DashboardUpcomingSubscription = {
  id: string
  name: string
  price: number
  currency: string
  nextChargeIso: string
}

type DashboardUpcomingCarouselProps = {
  nextBill: DashboardUpcomingBill | null
  nextSubscription: DashboardUpcomingSubscription | null
}

type UpcomingSlide = {
  key: string
  href: string
  label: string
  name: string
  amountLabel: string
  dueLabel: string
  icon: "bill" | "subscription"
}

const AUTO_ADVANCE_MS = 5000

export function DashboardUpcomingCarousel({
  nextBill,
  nextSubscription,
}: DashboardUpcomingCarouselProps) {
  const t = useTranslations("dashboard.upcoming")
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  const slides = useMemo<UpcomingSlide[]>(() => {
    const items: UpcomingSlide[] = []

    if (nextBill) {
      items.push({
        key: `bill-${nextBill.id}`,
        href: nextBill.href,
        label: t("nextBill"),
        name: nextBill.name,
        amountLabel: formatCurrency(nextBill.amount, nextBill.currency),
        dueLabel: t("dueOn", {
          date: format(new Date(nextBill.dueDateIso), "dd/MM"),
        }),
        icon: "bill",
      })
    }

    if (nextSubscription) {
      items.push({
        key: `sub-${nextSubscription.id}`,
        href: `/subscriptions/${nextSubscription.id}`,
        label: t("nextSubscription"),
        name: nextSubscription.name,
        amountLabel: formatCurrency(
          nextSubscription.price,
          nextSubscription.currency
        ),
        dueLabel: t("dueOn", {
          date: format(new Date(nextSubscription.nextChargeIso), "dd/MM"),
        }),
        icon: "subscription",
      })
    }

    return items
  }, [nextBill, nextSubscription, t])

  const scrollToIndex = useCallback((index: number) => {
    const scroller = scrollerRef.current
    if (!scroller) return
    const child = scroller.children[index] as HTMLElement | undefined
    if (!child) return
    scroller.scrollTo({ left: child.offsetLeft, behavior: "smooth" })
  }, [])

  useEffect(() => {
    if (slides.length <= 1 || paused) return

    const timer = window.setInterval(() => {
      setActiveIndex((current) => {
        const next = (current + 1) % slides.length
        scrollToIndex(next)
        return next
      })
    }, AUTO_ADVANCE_MS)

    return () => window.clearInterval(timer)
  }, [paused, scrollToIndex, slides.length])

  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return

    const onScroll = () => {
      const width = scroller.clientWidth
      if (width <= 0) return
      const index = Math.round(scroller.scrollLeft / width)
      setActiveIndex(Math.min(Math.max(index, 0), slides.length - 1))
    }

    scroller.addEventListener("scroll", onScroll, { passive: true })
    return () => scroller.removeEventListener("scroll", onScroll)
  }, [slides.length])

  if (slides.length === 0) {
    return (
      <div className="min-w-0 max-w-[58%] rounded-2xl border border-border/50 bg-card/80 px-3 py-2.5 shadow-sm backdrop-blur-sm">
        <p className="text-xs text-muted-foreground">{t("empty")}</p>
      </div>
    )
  }

  return (
    <div
      className="min-w-0 max-w-[58%] shrink-0"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <div
        ref={scrollerRef}
        role="region"
        aria-label={t("regionLabel")}
        aria-roledescription="carousel"
        className="flex snap-x snap-mandatory overflow-x-auto rounded-2xl [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((slide) => {
          const Icon = slide.icon === "bill" ? CalendarClock : CreditCard

          return (
            <LocaleLink
              key={slide.key}
              href={slide.href}
              className="w-full min-w-full shrink-0 snap-start"
            >
              <div className="rounded-2xl border border-border/50 bg-card/85 px-3 py-2.5 shadow-sm backdrop-blur-sm transition-colors hover:bg-card">
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
                    <Icon className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      {slide.label}
                    </p>
                    <p className="truncate text-sm font-semibold leading-tight">
                      {slide.name}
                    </p>
                    <div className="mt-0.5 flex items-baseline justify-between gap-2">
                      <span className="truncate text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        {slide.amountLabel}
                      </span>
                      <span className="shrink-0 text-[10px] text-muted-foreground">
                        {slide.dueLabel}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </LocaleLink>
          )
        })}
      </div>

      {slides.length > 1 ? (
        <div className="mt-1.5 flex items-center justify-center gap-1.5">
          {slides.map((slide, index) => (
            <button
              key={slide.key}
              type="button"
              aria-label={t("goToSlide", { index: index + 1 })}
              className={cn(
                "h-1.5 rounded-full transition-all",
                index === activeIndex
                  ? "w-4 bg-emerald-500"
                  : "w-1.5 bg-muted-foreground/35"
              )}
              onClick={() => {
                setActiveIndex(index)
                scrollToIndex(index)
              }}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
