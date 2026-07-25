import { describe, expect, it, vi, beforeAll, afterAll } from "vitest"
import { BillingCycle } from "@prisma/client"
import {
  buildChargeDate,
  resolveMonthlyChargeDate,
  resolveYearlyChargeDate,
  resolveInvoiceMonth,
  resolveChargeForInvoiceMonth,
  isChargeAwaiting,
  resolveNextChargeDate,
  formatBillingSummary,
  isSameOrAfterMonth,
  type SubscriptionBillingInput,
} from "./subscription-billing"

// ----------------------------------------------------------------
// Freeze "today" so formatBillingSummary (which calls
// resolveNextChargeDate without an explicit `from`) is deterministic.
// ----------------------------------------------------------------
beforeAll(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(2026, 6, 15)) // July 15, 2026
})

afterAll(() => {
  vi.useRealTimers()
})

// ---------------------------------------------------------------------------
// buildChargeDate
// ---------------------------------------------------------------------------
describe("buildChargeDate", () => {
  it("returns the given day in a normal month", () => {
    const d = buildChargeDate(2026, 7, 15)
    expect(d.getFullYear()).toBe(2026)
    expect(d.getMonth()).toBe(6) // July (0-indexed)
    expect(d.getDate()).toBe(15)
  })

  it("clamps day to the last day of the month when day exceeds month length", () => {
    // Feb 2026 has 28 days (2026 is not a leap year)
    const d = buildChargeDate(2026, 2, 30)
    expect(d.getFullYear()).toBe(2026)
    expect(d.getMonth()).toBe(1) // February
    expect(d.getDate()).toBe(28)
  })

  it("accepts day 1 as valid", () => {
    const d = buildChargeDate(2026, 7, 1)
    expect(d.getDate()).toBe(1)
  })

  it("accepts day 31 in a 31-day month", () => {
    const d = buildChargeDate(2026, 1, 31)
    expect(d.getFullYear()).toBe(2026)
    expect(d.getMonth()).toBe(0) // January
    expect(d.getDate()).toBe(31)
  })

  it("clamps day below 1 to 1", () => {
    const result = buildChargeDate(2026, 7, 0)
    expect(result.getDate()).toBe(1)
    expect(result.getMonth()).toBe(6) // July = month index 6
  })

  it("clamps negative day to 1", () => {
    const result = buildChargeDate(2026, 7, -5)
    expect(result.getDate()).toBe(1)
  })

  it("does not clamp Feb 29 on a leap year", () => {
    const result = buildChargeDate(2024, 2, 29) // 2024 is a leap year
    expect(result.getDate()).toBe(29)
  })

  it("clamps Feb 29 to 28 on a non-leap year", () => {
    const result = buildChargeDate(2025, 2, 29)
    expect(result.getDate()).toBe(28)
  })
})

// ---------------------------------------------------------------------------
// resolveMonthlyChargeDate
// ---------------------------------------------------------------------------
describe("resolveMonthlyChargeDate", () => {
  it("delegates to buildChargeDate with the same year and month", () => {
    const d = resolveMonthlyChargeDate(15, 2026, 6)
    expect(d.getFullYear()).toBe(2026)
    expect(d.getMonth()).toBe(5) // June
    expect(d.getDate()).toBe(15)
  })
})

// ---------------------------------------------------------------------------
// resolveYearlyChargeDate
// ---------------------------------------------------------------------------
describe("resolveYearlyChargeDate", () => {
  it("returns the anniversary month/day in the given year", () => {
    const anniversary = new Date(2025, 2, 10) // March 10, 2025
    const d = resolveYearlyChargeDate(anniversary, 2026)
    expect(d.getFullYear()).toBe(2026)
    expect(d.getMonth()).toBe(2) // March
    expect(d.getDate()).toBe(10)
  })

  it("handles an anniversary in a different month correctly", () => {
    const anniversary = new Date(2024, 11, 25) // December 25, 2024
    const d = resolveYearlyChargeDate(anniversary, 2026)
    expect(d.getFullYear()).toBe(2026)
    expect(d.getMonth()).toBe(11) // December
    expect(d.getDate()).toBe(25)
  })
})

// ---------------------------------------------------------------------------
// resolveInvoiceMonth
// ---------------------------------------------------------------------------
describe("resolveInvoiceMonth", () => {
  it("returns the same year/month when closingDay is null", () => {
    const cd = new Date(2026, 0, 5)
    expect(resolveInvoiceMonth(cd, null)).toEqual({ year: 2026, month: 1 })
  })

  it("returns the same year/month when closingDay is undefined", () => {
    const cd = new Date(2026, 0, 5)
    expect(resolveInvoiceMonth(cd, undefined)).toEqual({ year: 2026, month: 1 })
  })

  it("returns same month when charge day is before or on closing day", () => {
    const cd = new Date(2026, 0, 5) // Jan 5
    expect(resolveInvoiceMonth(cd, 10)).toEqual({ year: 2026, month: 1 })
  })

  it("rolls to next month when charge day is after closing day", () => {
    const cd = new Date(2026, 0, 20) // Jan 20
    expect(resolveInvoiceMonth(cd, 10)).toEqual({ year: 2026, month: 2 })
  })

  it("handles year boundary roll-over", () => {
    const cd = new Date(2026, 11, 20) // Dec 20
    expect(resolveInvoiceMonth(cd, 10)).toEqual({ year: 2027, month: 1 })
  })
})

// ---------------------------------------------------------------------------
// resolveChargeForInvoiceMonth
// ---------------------------------------------------------------------------
describe("resolveChargeForInvoiceMonth", () => {
  // -- MONTHLY / WEEKLY ----------------------------------------------------
  it("returns charge date for an active MONTHLY subscription (no closingDay)", () => {
    const sub: SubscriptionBillingInput = {
      active: true,
      billingCycle: BillingCycle.MONTHLY,
      billingDay: 15,
    }
    const result = resolveChargeForInvoiceMonth(sub, 2026, 7)
    expect(result).not.toBeNull()
    expect(result!.getFullYear()).toBe(2026)
    expect(result!.getMonth()).toBe(6) // July
    expect(result!.getDate()).toBe(15)
  })

  it("returns charge from the previous month when billingDay > closingDay", () => {
    // Invoice July 2026, closingDay = 10, billingDay = 15 (> 10)
    // => charge is calculated for June 15 (previous month) which spills into July's invoice
    const sub: SubscriptionBillingInput = {
      active: true,
      billingCycle: BillingCycle.MONTHLY,
      billingDay: 15,
    }
    const result = resolveChargeForInvoiceMonth(sub, 2026, 7, 10)
    expect(result).not.toBeNull()
    expect(result!.getFullYear()).toBe(2026)
    expect(result!.getMonth()).toBe(5) // June
    expect(result!.getDate()).toBe(15)
  })

  it("returns null for an inactive subscription", () => {
    const sub: SubscriptionBillingInput = {
      active: false,
      billingCycle: BillingCycle.MONTHLY,
      billingDay: 15,
    }
    expect(resolveChargeForInvoiceMonth(sub, 2026, 7)).toBeNull()
  })

  it("returns null when billingDay is missing", () => {
    const sub: SubscriptionBillingInput = {
      active: true,
      billingCycle: BillingCycle.MONTHLY,
    }
    expect(resolveChargeForInvoiceMonth(sub, 2026, 7)).toBeNull()
  })

  it("returns null when billingDay is falsy (0)", () => {
    const sub: SubscriptionBillingInput = {
      active: true,
      billingCycle: BillingCycle.MONTHLY,
      billingDay: 0,
    }
    expect(resolveChargeForInvoiceMonth(sub, 2026, 7)).toBeNull()
  })

  it("returns null when hiredAt is after the charge date", () => {
    const sub: SubscriptionBillingInput = {
      active: true,
      billingCycle: BillingCycle.MONTHLY,
      billingDay: 15,
      hiredAt: new Date(2026, 6, 20), // July 20 – after the 15th
    }
    expect(resolveChargeForInvoiceMonth(sub, 2026, 7)).toBeNull()
  })

  it("returns null when clamped charge date does not map to the requested invoice month", () => {
    // billingDay=31 in Feb (clamped to 28), closingDay=30
    // Feb 28 ≤ 30 stays in Feb invoice, but we asked for March
    const sub: SubscriptionBillingInput = {
      active: true,
      billingCycle: BillingCycle.MONTHLY,
      billingDay: 31,
    }
    const result = resolveChargeForInvoiceMonth(sub, 2026, 3, 30)
    expect(result).toBeNull()
  })

  it("handles WEEKLY billing cycle identically to MONTHLY", () => {
    const sub: SubscriptionBillingInput = {
      active: true,
      billingCycle: BillingCycle.WEEKLY,
      billingDay: 15,
    }
    const result = resolveChargeForInvoiceMonth(sub, 2026, 7)
    expect(result).not.toBeNull()
    expect(result!.getDate()).toBe(15)
  })

  // -- YEARLY --------------------------------------------------------------
  it("returns charge date for an active YEARLY subscription", () => {
    const sub: SubscriptionBillingInput = {
      active: true,
      billingCycle: BillingCycle.YEARLY,
      nextBillingDate: new Date(2025, 2, 10), // March 10, 2025
    }
    // Invoice March 2026
    const result = resolveChargeForInvoiceMonth(sub, 2026, 3)
    expect(result).not.toBeNull()
    expect(result!.getFullYear()).toBe(2026)
    expect(result!.getMonth()).toBe(2) // March
    expect(result!.getDate()).toBe(10)
  })

  it("returns null for an inactive yearly subscription", () => {
    const sub: SubscriptionBillingInput = {
      active: false,
      billingCycle: BillingCycle.YEARLY,
      nextBillingDate: new Date(2025, 2, 10),
    }
    expect(resolveChargeForInvoiceMonth(sub, 2026, 3)).toBeNull()
  })

  it("returns null when yearly subscription has no nextBillingDate", () => {
    const sub: SubscriptionBillingInput = {
      active: true,
      billingCycle: BillingCycle.YEARLY,
    }
    expect(resolveChargeForInvoiceMonth(sub, 2026, 3)).toBeNull()
  })

  it("checks both candidate years when yearly charge spills into next invoice month", () => {
    // Dec 15 anniversary. Invoice Jan 2026, closingDay=10.
    // Dec 15, 2026 → day 15 > 10 → spills to Jan 2027 (wrong year).
    // Dec 15, 2025 → day 15 > 10 → spills to Jan 2026 (correct).
    const sub: SubscriptionBillingInput = {
      active: true,
      billingCycle: BillingCycle.YEARLY,
      nextBillingDate: new Date(2025, 11, 15), // Dec 15, 2025
    }
    const result = resolveChargeForInvoiceMonth(sub, 2026, 1, 10)
    expect(result).not.toBeNull()
    expect(result!.getFullYear()).toBe(2025)
    expect(result!.getMonth()).toBe(11) // December
    expect(result!.getDate()).toBe(15)
  })

  it("returns null when both candidate years fail the hiredAt check", () => {
    const sub: SubscriptionBillingInput = {
      active: true,
      billingCycle: BillingCycle.YEARLY,
      nextBillingDate: new Date(2025, 11, 15),
      hiredAt: new Date(2026, 0, 20), // Jan 20, 2026 – after Dec 15, 2025
    }
    // candidate years: 2026 (spills to Jan 2027), 2025 (Dec 15, 2025, before hiredAt)
    const result = resolveChargeForInvoiceMonth(sub, 2026, 1, 10)
    expect(result).toBeNull()
  })

  // -- UNKNOWN CYCLE -------------------------------------------------------
  it("returns null for an unknown billing cycle", () => {
    const sub: SubscriptionBillingInput = {
      active: true,
      billingCycle: "UNKNOWN",
    }
    expect(resolveChargeForInvoiceMonth(sub, 2026, 7)).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// isChargeAwaiting
// ---------------------------------------------------------------------------
describe("isChargeAwaiting", () => {
  it("returns true for a future date", () => {
    const future = new Date(2026, 6, 20) // July 20
    const today = new Date(2026, 6, 15) // July 15
    expect(isChargeAwaiting(future, today)).toBe(true)
  })

  it("returns false for a past date", () => {
    const past = new Date(2026, 6, 10)
    const today = new Date(2026, 6, 15)
    expect(isChargeAwaiting(past, today)).toBe(false)
  })

  it("returns false for the same day (start-of-day comparison)", () => {
    const same = new Date(2026, 6, 15)
    const today = new Date(2026, 6, 15)
    expect(isChargeAwaiting(same, today)).toBe(false)
  })

  it("returns false for null / undefined", () => {
    expect(isChargeAwaiting(null)).toBe(false)
    expect(isChargeAwaiting(undefined)).toBe(false)
  })

  it("accepts a string date", () => {
    const today = new Date(2026, 6, 15)
    expect(isChargeAwaiting("2026-06-20", today)).toBe(false)
    expect(isChargeAwaiting("2026-08-01", today)).toBe(true)
  })

  it("uses a custom today parameter", () => {
    const due = new Date(2026, 6, 20)
    const earlier = new Date(2026, 6, 10)
    // due (20th) is after earlier (10th) → true
    expect(isChargeAwaiting(due, earlier)).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// resolveNextChargeDate
// ---------------------------------------------------------------------------
describe("resolveNextChargeDate", () => {
  // -- MONTHLY -------------------------------------------------------------
  it("returns next billing day from the given date (monthly)", () => {
    const from = new Date(2026, 0, 10) // Jan 10, 2026
    const sub: SubscriptionBillingInput = {
      active: true,
      billingCycle: BillingCycle.MONTHLY,
      billingDay: 15,
    }
    const result = resolveNextChargeDate(sub, from)
    expect(result).not.toBeNull()
    expect(result!.getFullYear()).toBe(2026)
    expect(result!.getMonth()).toBe(0) // January
    expect(result!.getDate()).toBe(15)
  })

  it("skips current month when billing day has already passed", () => {
    const from = new Date(2026, 0, 20) // Jan 20
    const sub: SubscriptionBillingInput = {
      active: true,
      billingCycle: BillingCycle.MONTHLY,
      billingDay: 15,
    }
    const result = resolveNextChargeDate(sub, from)
    expect(result).not.toBeNull()
    expect(result!.getFullYear()).toBe(2026)
    expect(result!.getMonth()).toBe(1) // February
    expect(result!.getDate()).toBe(15)
  })

  it("returns null for an inactive monthly subscription", () => {
    const sub: SubscriptionBillingInput = {
      active: false,
      billingCycle: BillingCycle.MONTHLY,
      billingDay: 15,
    }
    expect(resolveNextChargeDate(sub)).toBeNull()
  })

  it("returns null for a monthly subscription with no billingDay", () => {
    const sub: SubscriptionBillingInput = {
      active: true,
      billingCycle: BillingCycle.MONTHLY,
    }
    expect(resolveNextChargeDate(sub)).toBeNull()
  })

  it("skips months where the charge would be before hiredAt", () => {
    const from = new Date(2026, 0, 10) // Jan 10
    const sub: SubscriptionBillingInput = {
      active: true,
      billingCycle: BillingCycle.MONTHLY,
      billingDay: 15,
      hiredAt: new Date(2026, 1, 20), // Feb 20
    }
    // Jan 15 and Feb 15 are before hiredAt → skip → March 15
    const result = resolveNextChargeDate(sub, from)
    expect(result).not.toBeNull()
    expect(result!.getFullYear()).toBe(2026)
    expect(result!.getMonth()).toBe(2) // March
    expect(result!.getDate()).toBe(15)
  })

  it("returns null when no charge date is found within 24 monthly iterations", () => {
    const from = new Date(2026, 0, 1)
    const sub: SubscriptionBillingInput = {
      active: true,
      billingCycle: BillingCycle.MONTHLY,
      billingDay: 15,
      hiredAt: new Date(2029, 0, 1), // far in the future, beyond 24 iterations
    }
    expect(resolveNextChargeDate(sub, from)).toBeNull()
  })

  // -- YEARLY --------------------------------------------------------------
  it("returns next anniversary from the given date (yearly)", () => {
    const from = new Date(2026, 0, 10) // Jan 10, 2026
    const sub: SubscriptionBillingInput = {
      active: true,
      billingCycle: BillingCycle.YEARLY,
      nextBillingDate: new Date(2025, 2, 10), // March 10
    }
    const result = resolveNextChargeDate(sub, from)
    expect(result).not.toBeNull()
    expect(result!.getFullYear()).toBe(2026)
    expect(result!.getMonth()).toBe(2) // March
    expect(result!.getDate()).toBe(10)
  })

  it("skips to the next year when the anniversary has already passed", () => {
    const from = new Date(2026, 5, 15) // June 15, 2026
    const sub: SubscriptionBillingInput = {
      active: true,
      billingCycle: BillingCycle.YEARLY,
      nextBillingDate: new Date(2025, 2, 10), // March 10
    }
    const result = resolveNextChargeDate(sub, from)
    expect(result).not.toBeNull()
    expect(result!.getFullYear()).toBe(2027)
    expect(result!.getMonth()).toBe(2) // March
    expect(result!.getDate()).toBe(10)
  })

  it("returns null for an inactive yearly subscription", () => {
    const sub: SubscriptionBillingInput = {
      active: false,
      billingCycle: BillingCycle.YEARLY,
      nextBillingDate: new Date(2025, 2, 10),
    }
    expect(resolveNextChargeDate(sub)).toBeNull()
  })

  it("returns null when no charge date is found within 5 yearly iterations", () => {
    const from = new Date(2026, 0, 1)
    const sub: SubscriptionBillingInput = {
      active: true,
      billingCycle: BillingCycle.YEARLY,
      nextBillingDate: new Date(2025, 2, 10),
      hiredAt: new Date(2035, 0, 1), // far in the future, beyond 5 iterations
    }
    expect(resolveNextChargeDate(sub, from)).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// formatBillingSummary
// ---------------------------------------------------------------------------
describe("formatBillingSummary", () => {
  it("returns 'Todo dia {day}' for monthly/weekly in pt locale", () => {
    const sub: SubscriptionBillingInput = {
      billingCycle: BillingCycle.MONTHLY,
      billingDay: 15,
    }
    expect(formatBillingSummary(sub, "pt")).toBe("Todo dia 15")
  })

  it("returns 'Every day {day}' for monthly/weekly in en locale", () => {
    const sub: SubscriptionBillingInput = {
      billingCycle: BillingCycle.MONTHLY,
      billingDay: 15,
    }
    expect(formatBillingSummary(sub, "en")).toBe("Every day 15")
  })

  it("returns 'Every day {day}' by default (en locale)", () => {
    const sub: SubscriptionBillingInput = {
      billingCycle: BillingCycle.MONTHLY,
      billingDay: 15,
    }
    expect(formatBillingSummary(sub)).toBe("Every day 15")
  })

  it("handles WEEKLY billing cycle the same as MONTHLY", () => {
    const sub: SubscriptionBillingInput = {
      billingCycle: BillingCycle.WEEKLY,
      billingDay: 10,
    }
    expect(formatBillingSummary(sub, "pt")).toBe("Todo dia 10")
    expect(formatBillingSummary(sub, "en")).toBe("Every day 10")
  })

  it("formats yearly as DD/MM/YYYY in pt locale", () => {
    // Fake time is July 15, 2026. nextBillingDate anniversary = July 15, 2025
    // => next charge = July 15, 2026
    const sub: SubscriptionBillingInput = {
      active: true,
      billingCycle: BillingCycle.YEARLY,
      nextBillingDate: new Date(2025, 6, 15), // July 15, 2025
    }
    expect(formatBillingSummary(sub, "pt")).toBe("15/07/2026")
  })

  it("formats yearly as MM/DD/YYYY in en locale", () => {
    const sub: SubscriptionBillingInput = {
      active: true,
      billingCycle: BillingCycle.YEARLY,
      nextBillingDate: new Date(2025, 6, 15),
    }
    expect(formatBillingSummary(sub, "en")).toBe("07/15/2026")
  })

  it("returns null for monthly without billingDay", () => {
    expect(formatBillingSummary({ billingCycle: BillingCycle.MONTHLY })).toBeNull()
  })

  it("returns null for yearly without nextBillingDate", () => {
    expect(formatBillingSummary({ billingCycle: BillingCycle.YEARLY })).toBeNull()
  })

  it("returns null for an unknown billing cycle", () => {
    expect(formatBillingSummary({ billingCycle: "UNKNOWN" })).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// isSameOrAfterMonth
// ---------------------------------------------------------------------------
describe("isSameOrAfterMonth", () => {
  it("returns true when target equals anchor (same month)", () => {
    expect(isSameOrAfterMonth({ year: 2026, month: 7 }, { year: 2026, month: 7 })).toBe(true)
  })

  it("returns true when target is after anchor (same year)", () => {
    expect(isSameOrAfterMonth({ year: 2026, month: 8 }, { year: 2026, month: 7 })).toBe(true)
  })

  it("returns false when target is before anchor (same year)", () => {
    expect(isSameOrAfterMonth({ year: 2026, month: 6 }, { year: 2026, month: 7 })).toBe(false)
  })

  it("returns true when target is in a later year", () => {
    expect(isSameOrAfterMonth({ year: 2027, month: 1 }, { year: 2026, month: 12 })).toBe(true)
  })

  it("returns false when target is in an earlier year", () => {
    expect(isSameOrAfterMonth({ year: 2026, month: 12 }, { year: 2027, month: 1 })).toBe(false)
  })
})
