"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { format } from "date-fns"
import { useTranslations } from "next-intl"
import { LocaleLink } from "@/components/global"
import { formatCurrency } from "@/lib/utils/formatters"

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
}

const AUTO_ADVANCE_MS = 5000
const CARD_MIN_HEIGHT = "min-h-[5.5rem]"
const CARD_WIDTH = "w-[10.5rem] max-w-full shrink-0"

export function DashboardUpcomingCarousel({
  nextBill,
  nextSubscription,
}: DashboardUpcomingCarouselProps) {
  const t = useTranslations("dashboard.upcoming")
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [paused, setPaused] = useState(false)
  const slideIndexRef = useRef(0)

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
    slideIndexRef.current = index
  }, [])

  useEffect(() => {
    if (slides.length <= 1 || paused) return

    const timer = window.setInterval(() => {
      const next = (slideIndexRef.current + 1) % slides.length
      scrollToIndex(next)
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
      slideIndexRef.current = Math.min(Math.max(index, 0), slides.length - 1)
    }

    scroller.addEventListener("scroll", onScroll, { passive: true })
    return () => scroller.removeEventListener("scroll", onScroll)
  }, [slides.length])

  if (slides.length === 0) {
    return (
      <div
        className={`flex ${CARD_MIN_HEIGHT} ${CARD_WIDTH} items-center rounded-2xl border border-border/50 bg-card/80 px-3 py-3 shadow-sm backdrop-blur-sm`}
      >
        <p className="text-xs text-muted-foreground">{t("empty")}</p>
      </div>
    )
  }

  return (
    <div
      className={CARD_WIDTH}
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
        {slides.map((slide) => (
          <LocaleLink
            key={slide.key}
            href={slide.href}
            className="w-full min-w-full shrink-0 snap-start"
          >
            <div
              className={`flex ${CARD_MIN_HEIGHT} flex-col justify-between rounded-2xl border border-border/50 bg-card/85 px-3 py-3 shadow-sm backdrop-blur-sm transition-colors hover:bg-card`}
            >
              <div className="space-y-1">
                <p className="truncate text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  {slide.label}
                </p>
                <p className="truncate text-sm font-semibold leading-tight">
                  {slide.name}
                </p>
              </div>
              <div className="mt-1.5 space-y-0.5">
                <p className="truncate text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  {slide.amountLabel}
                </p>
                <p className="truncate text-[10px] text-muted-foreground">
                  {slide.dueLabel}
                </p>
              </div>
            </div>
          </LocaleLink>
        ))}
      </div>
    </div>
  )
}
