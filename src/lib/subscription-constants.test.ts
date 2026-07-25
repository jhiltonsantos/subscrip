import { describe, expect, it } from "vitest"
import {
  CURRENCY_VALUES,
  BILLING_CYCLE_VALUES,
  CATEGORY_VALUES,
  DEFAULT_SUBSCRIPTION_FORM,
} from "./subscription-constants"

describe("CURRENCY_VALUES", () => {
  it("has correct length of 3", () => {
    expect(CURRENCY_VALUES).toHaveLength(3)
  })

  it("includes BRL", () => {
    expect(CURRENCY_VALUES).toContain("BRL")
  })

  it("includes USD", () => {
    expect(CURRENCY_VALUES).toContain("USD")
  })

  it("includes EUR", () => {
    expect(CURRENCY_VALUES).toContain("EUR")
  })
})

describe("BILLING_CYCLE_VALUES", () => {
  it("has correct length of 3", () => {
    expect(BILLING_CYCLE_VALUES).toHaveLength(3)
  })

  it("includes MONTHLY", () => {
    expect(BILLING_CYCLE_VALUES).toContain("MONTHLY")
  })

  it("includes YEARLY", () => {
    expect(BILLING_CYCLE_VALUES).toContain("YEARLY")
  })

  it("includes WEEKLY", () => {
    expect(BILLING_CYCLE_VALUES).toContain("WEEKLY")
  })
})

describe("CATEGORY_VALUES", () => {
  it("has correct length of 6", () => {
    expect(CATEGORY_VALUES).toHaveLength(6)
  })

  it("includes INFRASTRUCTURE", () => {
    expect(CATEGORY_VALUES).toContain("INFRASTRUCTURE")
  })

  it("includes ENTERTAINMENT", () => {
    expect(CATEGORY_VALUES).toContain("ENTERTAINMENT")
  })

  it("includes EDUCATION", () => {
    expect(CATEGORY_VALUES).toContain("EDUCATION")
  })

  it("includes TOOLS", () => {
    expect(CATEGORY_VALUES).toContain("TOOLS")
  })

  it("includes FITNESS", () => {
    expect(CATEGORY_VALUES).toContain("FITNESS")
  })

  it("includes OTHER", () => {
    expect(CATEGORY_VALUES).toContain("OTHER")
  })
})

describe("DEFAULT_SUBSCRIPTION_FORM", () => {
  it("has currency set to BRL", () => {
    expect(DEFAULT_SUBSCRIPTION_FORM.currency).toBe("BRL")
  })

  it("has billingCycle set to MONTHLY", () => {
    expect(DEFAULT_SUBSCRIPTION_FORM.billingCycle).toBe("MONTHLY")
  })

  it("has category set to OTHER", () => {
    expect(DEFAULT_SUBSCRIPTION_FORM.category).toBe("OTHER")
  })
})

describe("DEFAULT_SUBSCRIPTION_FORM integrity", () => {
  it("currency value exists in CURRENCY_VALUES", () => {
    expect(
      CURRENCY_VALUES.includes(DEFAULT_SUBSCRIPTION_FORM.currency),
    ).toBe(true)
  })

  it("billingCycle value exists in BILLING_CYCLE_VALUES", () => {
    expect(
      BILLING_CYCLE_VALUES.includes(DEFAULT_SUBSCRIPTION_FORM.billingCycle),
    ).toBe(true)
  })

  it("category value exists in CATEGORY_VALUES", () => {
    expect(
      CATEGORY_VALUES.includes(DEFAULT_SUBSCRIPTION_FORM.category),
    ).toBe(true)
  })
})
