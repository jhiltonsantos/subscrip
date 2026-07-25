import { describe, it, expect } from "vitest"
import type { FinanceTrendPoint } from "@/server/actions/finance-planner/trend"
import {
  formatTrendMonthLabel,
  formatTrendMonthLongLabel,
  trendHasData,
  getCurrentMonthPoint,
  toCashFlowChartData,
  toBalanceChartData,
  toExpenseDonutData,
  toExpenseStackChartData,
} from "./trend-chart-data"

interface MockSummary {
  incomeTotal: string
  receivedTotal: string
  expenseTotal: string
  paidTotal: string
  subscriptionTotal: string
  creditCardTotal: string
  balance: string
  pendingIncomeTotal: string
  pendingExpenseTotal: string
}

function makePoint(
  overrides: Partial<FinanceTrendPoint> = {}
): FinanceTrendPoint {
  return {
    year: 2026,
    month: 7,
    summary: {
      incomeTotal: "0",
      receivedTotal: "0",
      expenseTotal: "0",
      paidTotal: "0",
      subscriptionTotal: "0",
      creditCardTotal: "0",
      balance: "0",
      pendingIncomeTotal: "0",
      pendingExpenseTotal: "0",
    } satisfies MockSummary,
    expenseByBucket: {
      MONTHLY_BILLS: "0",
      CREDIT_CARD: "0",
      FIXED_CARD: "0",
      OTHER: "0",
    },
    subscriptionByCategory: [],
    ...overrides,
  }
}

describe("formatTrendMonthLabel", () => {
  it("formats with pt locale (short)", () => {
    const result = formatTrendMonthLabel(2026, 7, "pt")
    expect(result).toBe("jul 26")
  })

  it("formats with en locale (short)", () => {
    const result = formatTrendMonthLabel(2026, 7, "en")
    expect(result).toBe("Jul 26")
  })

  it("formats January correctly (year boundary concern)", () => {
    const en = formatTrendMonthLabel(2026, 1, "en")
    expect(en).toBe("Jan 26")

    const pt = formatTrendMonthLabel(2026, 1, "pt")
    expect(pt).toBe("jan 26")
  })

  it("formats December correctly", () => {
    const en = formatTrendMonthLabel(2026, 12, "en")
    expect(en).toBe("Dec 26")

    const pt = formatTrendMonthLabel(2026, 12, "pt")
    expect(pt).toBe("dez 26")
  })
})

describe("formatTrendMonthLongLabel", () => {
  it("formats with pt locale (full month + year)", () => {
    const result = formatTrendMonthLongLabel(2026, 7, "pt")
    expect(result).toBe("julho 2026")
  })

  it("formats with en locale (full month + year)", () => {
    const result = formatTrendMonthLongLabel(2026, 7, "en")
    expect(result).toBe("July 2026")
  })
})

describe("trendHasData", () => {
  it("returns false for points with all zeros", () => {
    const points = [makePoint()]
    expect(trendHasData(points)).toBe(false)
  })

  it("returns true when incomeTotal is non-zero", () => {
    const points = [
      makePoint({
        summary: { ...makePoint().summary, incomeTotal: "5000" } as FinanceTrendPoint["summary"],
      }),
    ]
    expect(trendHasData(points)).toBe(true)
  })

  it("returns true when expenseTotal is non-zero", () => {
    const points = [
      makePoint({
        summary: { ...makePoint().summary, expenseTotal: "3000" } as FinanceTrendPoint["summary"],
      }),
    ]
    expect(trendHasData(points)).toBe(true)
  })

  it("returns true when creditCardTotal is non-zero", () => {
    const points = [
      makePoint({
        summary: { ...makePoint().summary, creditCardTotal: "1500" } as FinanceTrendPoint["summary"],
      }),
    ]
    expect(trendHasData(points)).toBe(true)
  })

  it("returns false for empty array", () => {
    expect(trendHasData([])).toBe(false)
  })
})

describe("getCurrentMonthPoint", () => {
  it("returns last element from points array", () => {
    const points = [
      makePoint({ year: 2026, month: 6 }),
      makePoint({ year: 2026, month: 7 }),
      makePoint({ year: 2026, month: 8 }),
    ]
    const result = getCurrentMonthPoint(points)
    expect(result).not.toBeNull()
    expect(result!.year).toBe(2026)
    expect(result!.month).toBe(8)
  })

  it("returns null for empty array", () => {
    expect(getCurrentMonthPoint([])).toBeNull()
  })
})

describe("toCashFlowChartData", () => {
  it("maps points to { label, income, expense } with numeric conversion", () => {
    const points = [
      makePoint({
        month: 1,
        summary: { ...makePoint().summary, incomeTotal: "5000", expenseTotal: "3000" } as FinanceTrendPoint["summary"],
      }),
      makePoint({
        month: 2,
        summary: { ...makePoint().summary, incomeTotal: "6000", expenseTotal: "3500" } as FinanceTrendPoint["summary"],
      }),
    ]
    const result = toCashFlowChartData(points, "en")
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({
      label: "Jan 26",
      income: 5000,
      expense: 3000,
    })
    expect(result[1]).toEqual({
      label: "Feb 26",
      income: 6000,
      expense: 3500,
    })
  })
})

describe("toBalanceChartData", () => {
  it("maps points to { label, balance } with numeric conversion", () => {
    const points = [
      makePoint({
        month: 1,
        summary: { ...makePoint().summary, balance: "2000" } as FinanceTrendPoint["summary"],
      }),
      makePoint({
        month: 2,
        summary: { ...makePoint().summary, balance: "2500" } as FinanceTrendPoint["summary"],
      }),
    ]
    const result = toBalanceChartData(points, "en")
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({ label: "Jan 26", balance: 2000 })
    expect(result[1]).toEqual({ label: "Feb 26", balance: 2500 })
  })
})

describe("toExpenseDonutData", () => {
  const bucketLabels: Record<string, string> = {
    MONTHLY_BILLS: "Monthly Bills",
    FIXED_CARD: "Fixed Card",
    CREDIT_CARD: "Credit Card",
    OTHER: "Other",
  } as Record<string, string>

  it("maps expenseByBucket entries with labels and fill vars", () => {
    const point = makePoint({
      expenseByBucket: {
        MONTHLY_BILLS: "1500",
        FIXED_CARD: "800",
        CREDIT_CARD: "500",
        OTHER: "200",
      },
    })
    const result = toExpenseDonutData(point, bucketLabels as Parameters<typeof toExpenseDonutData>[1])
    expect(result).toHaveLength(4)
    expect(result).toContainEqual({
      key: "MONTHLY_BILLS",
      label: "Monthly Bills",
      value: 1500,
      fill: "var(--color-MONTHLY_BILLS)",
    })
    expect(result).toContainEqual({
      key: "OTHER",
      label: "Other",
      value: 200,
      fill: "var(--color-OTHER)",
    })
  })
})

describe("toExpenseStackChartData", () => {
  it("maps points with bucket keys and numeric conversion", () => {
    const points = [
      makePoint({
        month: 1,
        expenseByBucket: {
          MONTHLY_BILLS: "1000",
          FIXED_CARD: "500",
          CREDIT_CARD: "300",
          OTHER: "200",
        },
      }),
      makePoint({
        month: 2,
        expenseByBucket: {
          MONTHLY_BILLS: "1100",
          FIXED_CARD: "550",
          CREDIT_CARD: "350",
          OTHER: "250",
        },
      }),
    ]
    const result = toExpenseStackChartData(points, "en")
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({
      label: "Jan 26",
      MONTHLY_BILLS: 1000,
      FIXED_CARD: 500,
      CREDIT_CARD: 300,
      OTHER: 200,
    })
    expect(result[1]).toEqual({
      label: "Feb 26",
      MONTHLY_BILLS: 1100,
      FIXED_CARD: 550,
      CREDIT_CARD: 350,
      OTHER: 250,
    })
  })
})
