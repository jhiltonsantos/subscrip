import { describe, expect, it, vi } from "vitest"
import {
  getBillingCycleLabel,
  getCategoryLabel,
  formatSubscriptionDueDate,
} from "./subscription-labels"

function createTranslator(
  overrides?: Record<string, string>,
): (
  key: `enums.categories.${string}` | `enums.billingCycles.${string}`,
) => string {
  const translations: Record<string, string> = {
    "enums.categories.INFRASTRUCTURE": "Infraestrutura",
    "enums.categories.ENTERTAINMENT": "Entretenimento",
    "enums.billingCycles.MONTHLY": "Mensal",
    "enums.billingCycles.YEARLY": "Anual",
    ...overrides,
  }
  return (key) => translations[key] ?? key
}

describe("getCategoryLabel", () => {
  it("returns translated string for valid INFRASTRUCTURE", () => {
    const t = createTranslator()
    expect(getCategoryLabel("INFRASTRUCTURE", t)).toBe("Infraestrutura")
  })

  it("returns translated string for valid ENTERTAINMENT", () => {
    const t = createTranslator()
    expect(getCategoryLabel("ENTERTAINMENT", t)).toBe("Entretenimento")
  })

  it("returns translated string for EDUCATION", () => {
    const t = createTranslator()
    expect(getCategoryLabel("EDUCATION", t)).toBe(
      "enums.categories.EDUCATION",
    )
  })

  it("returns raw string for invalid/unknown category", () => {
    const t = createTranslator()
    expect(getCategoryLabel("UNKNOWN_CAT", t)).toBe("UNKNOWN_CAT")
  })

  it("returns raw string for empty string", () => {
    const t = createTranslator()
    expect(getCategoryLabel("", t)).toBe("")
  })
})

describe("getBillingCycleLabel", () => {
  it("returns translated string for valid MONTHLY", () => {
    const t = createTranslator()
    expect(getBillingCycleLabel("MONTHLY", t)).toBe("Mensal")
  })

  it("returns translated string for valid YEARLY", () => {
    const t = createTranslator()
    expect(getBillingCycleLabel("YEARLY", t)).toBe("Anual")
  })

  it("returns translated string for WEEKLY", () => {
    const t = createTranslator()
    expect(getBillingCycleLabel("WEEKLY", t)).toBe(
      "enums.billingCycles.WEEKLY",
    )
  })

  it("returns raw string for invalid/unknown cycle", () => {
    const t = createTranslator()
    expect(getBillingCycleLabel("BIANNUAL", t)).toBe("BIANNUAL")
  })

  it("returns raw string for empty string", () => {
    const t = createTranslator()
    expect(getBillingCycleLabel("", t)).toBe("")
  })
})

describe("formatSubscriptionDueDate", () => {
  it("formats pt locale as '01 de janeiro'", () => {
    const date = new Date(2025, 0, 1) // Jan 1
    expect(formatSubscriptionDueDate(date, "pt")).toBe("01 de janeiro")
  })

  it("formats pt locale as '15 de agosto'", () => {
    const date = new Date(2025, 7, 15) // Aug 15
    expect(formatSubscriptionDueDate(date, "pt")).toBe("15 de agosto")
  })

  it("formats pt locale with padded day", () => {
    const date = new Date(2025, 2, 5) // Mar 5
    expect(formatSubscriptionDueDate(date, "pt")).toBe("05 de março")
  })

  it("formats en locale as 'January 1'", () => {
    const date = new Date(2025, 0, 1)
    expect(formatSubscriptionDueDate(date, "en")).toBe("January 1")
  })

  it("formats en locale as 'August 15'", () => {
    const date = new Date(2025, 7, 15)
    expect(formatSubscriptionDueDate(date, "en")).toBe("August 15")
  })

  it("formats en locale without leading zero on day", () => {
    const date = new Date(2025, 2, 5)
    expect(formatSubscriptionDueDate(date, "en")).toBe("March 5")
  })

  it("handles different years correctly", () => {
    const date = new Date(2024, 1, 29) // Feb 29 on leap year
    expect(formatSubscriptionDueDate(date, "pt")).toBe("29 de fevereiro")
    expect(formatSubscriptionDueDate(date, "en")).toBe("February 29")
  })
})
