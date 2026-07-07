import { BillingCycle } from "@prisma/client"

export type SubscriptionBillingInput = {
  active?: boolean
  billingCycle: BillingCycle | string
  billingDay?: number | null
  hiredAt?: Date | string | null
  nextBillingDate?: Date | string | null
}

export type YearMonth = { year: number; month: number }

function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value)
}

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function lastDayOfMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate()
}

function addMonths(year: number, month: number, delta: number): YearMonth {
  const index = year * 12 + (month - 1) + delta
  return {
    year: Math.floor(index / 12),
    month: (index % 12) + 1,
  }
}

function monthIndex(year: number, month: number) {
  return year * 12 + month
}

export function buildChargeDate(year: number, month: number, day: number) {
  const clampedDay = Math.min(Math.max(day, 1), lastDayOfMonth(year, month))
  return new Date(year, month - 1, clampedDay)
}

export function resolveMonthlyChargeDate(
  billingDay: number,
  year: number,
  month: number
) {
  return buildChargeDate(year, month, billingDay)
}

export function resolveYearlyChargeDate(anniversary: Date, year: number) {
  return buildChargeDate(year, anniversary.getMonth() + 1, anniversary.getDate())
}

/** Maps a charge date to the card invoice month using closingDay. */
export function resolveInvoiceMonth(
  chargeDate: Date,
  closingDay: number | null | undefined
): YearMonth {
  const year = chargeDate.getFullYear()
  const month = chargeDate.getMonth() + 1
  const day = chargeDate.getDate()

  if (closingDay == null) {
    return { year, month }
  }

  if (day <= closingDay) {
    return { year, month }
  }

  return addMonths(year, month, 1)
}

function isOnOrAfterHiredAt(chargeDate: Date, hiredAt: Date | string | null | undefined) {
  if (!hiredAt) return true
  return startOfLocalDay(chargeDate) >= startOfLocalDay(toDate(hiredAt))
}

/**
 * Charge date that belongs to the given invoice month, or null if none.
 * For cards: invoice month M closing on day C covers charges from (C+1 of M-1) through (C of M).
 */
export function resolveChargeForInvoiceMonth(
  subscription: SubscriptionBillingInput,
  invoiceYear: number,
  invoiceMonth: number,
  closingDay?: number | null
): Date | null {
  if (subscription.active === false) return null

  const cycle = subscription.billingCycle

  if (cycle === BillingCycle.MONTHLY || cycle === BillingCycle.WEEKLY) {
    if (!subscription.billingDay) return null

    const chargeMonth =
      closingDay != null && subscription.billingDay > closingDay
        ? addMonths(invoiceYear, invoiceMonth, -1)
        : { year: invoiceYear, month: invoiceMonth }

    const chargeDate = resolveMonthlyChargeDate(
      subscription.billingDay,
      chargeMonth.year,
      chargeMonth.month
    )

    const invoice = resolveInvoiceMonth(chargeDate, closingDay)
    if (
      invoice.year !== invoiceYear ||
      invoice.month !== invoiceMonth ||
      !isOnOrAfterHiredAt(chargeDate, subscription.hiredAt)
    ) {
      return null
    }

    return chargeDate
  }

  if (cycle === BillingCycle.YEARLY) {
    if (!subscription.nextBillingDate) return null

    const anniversary = toDate(subscription.nextBillingDate)
    // Candidate years: invoice year, and previous year when charge spills into next invoice month
    const candidateYears = [invoiceYear, invoiceYear - 1]

    for (const year of candidateYears) {
      const chargeDate = resolveYearlyChargeDate(anniversary, year)
      const invoice = resolveInvoiceMonth(chargeDate, closingDay)
      if (
        invoice.year === invoiceYear &&
        invoice.month === invoiceMonth &&
        isOnOrAfterHiredAt(chargeDate, subscription.hiredAt)
      ) {
        return chargeDate
      }
    }

    return null
  }

  return null
}

/** Whether the charge date is still in the future (local calendar day). */
export function isChargeAwaiting(
  dueDate: Date | string | null | undefined,
  today: Date = new Date()
) {
  if (!dueDate) return false
  return startOfLocalDay(toDate(dueDate)) > startOfLocalDay(today)
}

/** Next upcoming charge date for list/dashboard display. */
export function resolveNextChargeDate(
  subscription: SubscriptionBillingInput,
  from: Date = new Date()
): Date | null {
  if (subscription.active === false) return null

  const fromDay = startOfLocalDay(from)
  const cycle = subscription.billingCycle

  if (cycle === BillingCycle.MONTHLY || cycle === BillingCycle.WEEKLY) {
    if (!subscription.billingDay) return null

    let year = fromDay.getFullYear()
    let month = fromDay.getMonth() + 1

    for (let i = 0; i < 24; i++) {
      const chargeDate = resolveMonthlyChargeDate(subscription.billingDay, year, month)
      if (
        startOfLocalDay(chargeDate) >= fromDay &&
        isOnOrAfterHiredAt(chargeDate, subscription.hiredAt)
      ) {
        return chargeDate
      }
      const next = addMonths(year, month, 1)
      year = next.year
      month = next.month
    }

    return null
  }

  if (cycle === BillingCycle.YEARLY) {
    if (!subscription.nextBillingDate) return null

    const anniversary = toDate(subscription.nextBillingDate)
    let year = fromDay.getFullYear()

    for (let i = 0; i < 5; i++) {
      const chargeDate = resolveYearlyChargeDate(anniversary, year)
      if (
        startOfLocalDay(chargeDate) >= fromDay &&
        isOnOrAfterHiredAt(chargeDate, subscription.hiredAt)
      ) {
        return chargeDate
      }
      year += 1
    }

    return null
  }

  return null
}

export function formatBillingSummary(
  subscription: SubscriptionBillingInput,
  locale: "pt" | "en" = "en"
): string | null {
  const cycle = subscription.billingCycle

  if (
    (cycle === BillingCycle.MONTHLY || cycle === BillingCycle.WEEKLY) &&
    subscription.billingDay
  ) {
    return locale === "pt"
      ? `Todo dia ${subscription.billingDay}`
      : `Every day ${subscription.billingDay}`
  }

  if (cycle === BillingCycle.YEARLY && subscription.nextBillingDate) {
    const next = resolveNextChargeDate(subscription)
    if (!next) return null
    const day = String(next.getDate()).padStart(2, "0")
    const month = String(next.getMonth() + 1).padStart(2, "0")
    const year = next.getFullYear()
    return locale === "pt" ? `${day}/${month}/${year}` : `${month}/${day}/${year}`
  }

  return null
}

export function isSameOrAfterMonth(target: YearMonth, anchor: YearMonth) {
  return monthIndex(target.year, target.month) >= monthIndex(anchor.year, anchor.month)
}
