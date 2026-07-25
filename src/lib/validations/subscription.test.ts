import { describe, expect, it } from "vitest"
import {
  subscriptionCreateSchema,
  subscriptionUpdateSchema,
} from "./subscription"

const validInput = {
  name: "Netflix",
  price: 39.9,
  currency: "BRL",
  billingCycle: "MONTHLY",
  billingDay: 15,
  category: "ENTERTAINMENT",
}

describe("subscriptionCreateSchema", () => {
  it("accepts a complete valid input with all fields", () => {
    const input = {
      ...validInput,
      planLabel: "Standard",
      hiredAt: "2025-01-15",
      nextBillingDate: "2026-08-15",
      active: true,
      serviceTemplateId: "550e8400-e29b-41d4-a716-446655440000",
      paymentMethodId: "550e8400-e29b-41d4-a716-446655440001",
    }
    const result = subscriptionCreateSchema.parse(input)
    expect(result.name).toBe("Netflix")
    expect(result.price).toBe(39.9)
    expect(result.currency).toBe("BRL")
    expect(result.billingCycle).toBe("MONTHLY")
    expect(result.category).toBe("ENTERTAINMENT")
    expect(result.billingDay).toBe(15)
    expect(result.nextBillingDate).toBeInstanceOf(Date)
    expect(result.active).toBe(true)
  })

  it("accepts minimal valid input", () => {
    const result = subscriptionCreateSchema.parse(validInput)
    expect(result).toMatchObject({
      name: "Netflix",
      price: 39.9,
      currency: "BRL",
      billingCycle: "MONTHLY",
      billingDay: 15,
      category: "ENTERTAINMENT",
    })
  })

  describe("name", () => {
    it("rejects empty name", () => {
      expect(() =>
        subscriptionCreateSchema.parse({ ...validInput, name: "" })
      ).toThrow()
    })

    it("rejects name exceeding 200 characters", () => {
      expect(() =>
        subscriptionCreateSchema.parse({ ...validInput, name: "a".repeat(201) })
      ).toThrow()
    })

    it("accepts name at max length", () => {
      const result = subscriptionCreateSchema.parse({
        ...validInput,
        name: "a".repeat(200),
      })
      expect(result.name).toHaveLength(200)
    })
  })

  describe("planLabel", () => {
    it("accepts plan label", () => {
      const result = subscriptionCreateSchema.parse({
        ...validInput,
        planLabel: "Premium",
      })
      expect(result.planLabel).toBe("Premium")
    })

    it("rejects planLabel exceeding 120 characters", () => {
      expect(() =>
        subscriptionCreateSchema.parse({
          ...validInput,
          planLabel: "a".repeat(121),
        })
      ).toThrow()
    })

    it("accepts null planLabel", () => {
      const result = subscriptionCreateSchema.parse({ ...validInput, planLabel: null })
      expect(result.planLabel).toBeNull()
    })

    it("accepts undefined planLabel", () => {
      const result = subscriptionCreateSchema.parse(validInput)
      expect(result.planLabel).toBeUndefined()
    })
  })

  describe("price", () => {
    it("coerces string price to number", () => {
      const result = subscriptionCreateSchema.parse({ ...validInput, price: "39.9" })
      expect(result.price).toBe(39.9)
    })

    it("rejects zero price", () => {
      expect(() => subscriptionCreateSchema.parse({ ...validInput, price: 0 })).toThrow()
    })

    it("rejects negative price", () => {
      expect(() => subscriptionCreateSchema.parse({ ...validInput, price: -10 })).toThrow()
    })
  })

  describe("currency", () => {
    it("accepts BRL", () => {
      const result = subscriptionCreateSchema.parse({ ...validInput, currency: "BRL" })
      expect(result.currency).toBe("BRL")
    })

    it("accepts USD", () => {
      const result = subscriptionCreateSchema.parse({ ...validInput, currency: "USD" })
      expect(result.currency).toBe("USD")
    })

    it("accepts EUR", () => {
      const result = subscriptionCreateSchema.parse({ ...validInput, currency: "EUR" })
      expect(result.currency).toBe("EUR")
    })

    it("rejects invalid currency", () => {
      expect(() =>
        subscriptionCreateSchema.parse({ ...validInput, currency: "GBP" })
      ).toThrow()
    })
  })

  describe("billingCycle", () => {
    it("accepts MONTHLY with billingDay", () => {
      const result = subscriptionCreateSchema.parse({
        ...validInput,
        billingCycle: "MONTHLY",
        billingDay: 15,
      })
      expect(result.billingCycle).toBe("MONTHLY")
    })

    it("accepts YEARLY with nextBillingDate", () => {
      const result = subscriptionCreateSchema.parse({
        ...validInput,
        billingCycle: "YEARLY",
        billingDay: undefined,
        nextBillingDate: "2027-06-15",
      })
      expect(result.billingCycle).toBe("YEARLY")
    })

    it("accepts WEEKLY with billingDay", () => {
      const result = subscriptionCreateSchema.parse({
        ...validInput,
        billingCycle: "WEEKLY",
        billingDay: 3,
      })
      expect(result.billingCycle).toBe("WEEKLY")
    })

    it("rejects invalid billing cycle", () => {
      expect(() =>
        subscriptionCreateSchema.parse({ ...validInput, billingCycle: "BIWEEKLY" })
      ).toThrow()
    })
  })

  describe("category", () => {
    const categories = [
      "INFRASTRUCTURE",
      "ENTERTAINMENT",
      "EDUCATION",
      "TOOLS",
      "FITNESS",
      "OTHER",
    ] as const

    for (const cat of categories) {
      it(`accepts ${cat}`, () => {
        const result = subscriptionCreateSchema.parse({ ...validInput, category: cat })
        expect(result.category).toBe(cat)
      })
    }

    it("rejects invalid category", () => {
      expect(() =>
        subscriptionCreateSchema.parse({ ...validInput, category: "GAMES" })
      ).toThrow()
    })
  })

  describe("hiredAt", () => {
    it("coerces date string", () => {
      const result = subscriptionCreateSchema.parse({
        ...validInput,
        hiredAt: "2025-01-15",
      })
      expect(result.hiredAt).toBeInstanceOf(Date)
    })

    it("accepts null hiredAt", () => {
      const result = subscriptionCreateSchema.parse({ ...validInput, hiredAt: null })
      expect(result.hiredAt).toBeNull()
    })
  })

  describe("billingDay", () => {
    it("accepts valid billing day", () => {
      const result = subscriptionCreateSchema.parse({ ...validInput, billingDay: 15 })
      expect(result.billingDay).toBe(15)
    })

    it("coerces string billing day", () => {
      const result = subscriptionCreateSchema.parse({ ...validInput, billingDay: "15" })
      expect(result.billingDay).toBe(15)
    })

    it("rejects billing day 0", () => {
      expect(() =>
        subscriptionCreateSchema.parse({ ...validInput, billingDay: 0 })
      ).toThrow()
    })

    it("rejects billing day 32", () => {
      expect(() =>
        subscriptionCreateSchema.parse({ ...validInput, billingDay: 32 })
      ).toThrow()
    })

    it("accepts null billingDay with YEARLY cycle", () => {
      const result = subscriptionCreateSchema.parse({
        ...validInput,
        billingCycle: "YEARLY",
        nextBillingDate: "2027-06-15",
        billingDay: null,
      })
      expect(result.billingDay).toBeNull()
    })
  })

  describe("nextBillingDate", () => {
    it("coerces date string with YEARLY cycle", () => {
      const result = subscriptionCreateSchema.parse({
        ...validInput,
        billingCycle: "YEARLY",
        billingDay: undefined,
        nextBillingDate: "2026-08-15",
      })
      expect(result.nextBillingDate).toBeInstanceOf(Date)
    })

    it("accepts null nextBillingDate with MONTHLY cycle", () => {
      const result = subscriptionCreateSchema.parse({
        ...validInput,
        billingCycle: "MONTHLY",
        billingDay: 15,
        nextBillingDate: null,
      })
      expect(result.nextBillingDate).toBeNull()
    })
  })

  describe("active", () => {
    it("defaults to true", () => {
      const result = subscriptionCreateSchema.parse(validInput)
      expect(result.active).toBe(true)
    })

    it("accepts explicit false", () => {
      const result = subscriptionCreateSchema.parse({ ...validInput, active: false })
      expect(result.active).toBe(false)
    })
  })

  describe("serviceTemplateId and paymentMethodId", () => {
    for (const field of ["serviceTemplateId", "paymentMethodId"] as const) {
      it(`${field} accepts valid UUID`, () => {
        const result = subscriptionCreateSchema.parse({
          ...validInput,
          [field]: "550e8400-e29b-41d4-a716-446655440000",
        })
        expect(result[field]).toBe("550e8400-e29b-41d4-a716-446655440000")
      })

      it(`${field} rejects invalid UUID`, () => {
        expect(() =>
          subscriptionCreateSchema.parse({ ...validInput, [field]: "not-a-uuid" })
        ).toThrow()
      })

      it(`${field} accepts null`, () => {
        const result = subscriptionCreateSchema.parse({ ...validInput, [field]: null })
        expect(result[field]).toBeNull()
      })
    }
  })

  describe("superRefine cross-field validation", () => {
    it("MONTHLY with billingDay passes", () => {
      const result = subscriptionCreateSchema.parse({
        ...validInput,
        billingCycle: "MONTHLY",
        billingDay: 15,
      })
      expect(result.billingDay).toBe(15)
    })

    it("MONTHLY without billingDay fails with path [\"billingDay\"]", () => {
      const result = subscriptionCreateSchema.safeParse({
        name: "Test",
        price: 10,
        currency: "BRL",
        billingCycle: "MONTHLY",
        category: "OTHER",
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const billingDayIssue = result.error.issues.find(
          (i) => i.path[0] === "billingDay"
        )
        expect(billingDayIssue).toBeDefined()
        expect(billingDayIssue!.message).toBe("Dia da cobrança é obrigatório")
      }
    })

    it("WEEKLY with billingDay passes", () => {
      const result = subscriptionCreateSchema.parse({
        ...validInput,
        billingCycle: "WEEKLY",
        billingDay: 3,
      })
      expect(result.billingDay).toBe(3)
    })

    it("WEEKLY without billingDay fails with path [\"billingDay\"]", () => {
      const result = subscriptionCreateSchema.safeParse({
        name: "Test",
        price: 10,
        currency: "BRL",
        billingCycle: "WEEKLY",
        category: "OTHER",
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const billingDayIssue = result.error.issues.find(
          (i) => i.path[0] === "billingDay"
        )
        expect(billingDayIssue).toBeDefined()
      }
    })

    it("YEARLY with nextBillingDate passes", () => {
      const result = subscriptionCreateSchema.parse({
        ...validInput,
        billingCycle: "YEARLY",
        billingDay: undefined,
        nextBillingDate: "2027-01-15",
      })
      expect(result.nextBillingDate).toBeInstanceOf(Date)
    })

    it("YEARLY without nextBillingDate fails with path [\"nextBillingDate\"]", () => {
      const result = subscriptionCreateSchema.safeParse({
        name: "Test",
        price: 10,
        currency: "BRL",
        billingCycle: "YEARLY",
        category: "OTHER",
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const nextBillingIssue = result.error.issues.find(
          (i) => i.path[0] === "nextBillingDate"
        )
        expect(nextBillingIssue).toBeDefined()
        expect(nextBillingIssue!.message).toBe(
          "Data da próxima cobrança é obrigatória"
        )
      }
    })
  })
})

describe("subscriptionUpdateSchema", () => {
  it("parses empty object successfully (all fields optional via .partial())", () => {
    const result = subscriptionUpdateSchema.parse({})
    expect(result).toEqual({ active: true })
  })

  it("accepts partial update with only name", () => {
    const result = subscriptionUpdateSchema.parse({ name: "Updated Netflix" })
    expect(result.name).toBe("Updated Netflix")
  })

  it("rejects empty name if provided", () => {
    expect(() => subscriptionUpdateSchema.parse({ name: "" })).toThrow()
  })

  it("coerces price when provided", () => {
    const result = subscriptionUpdateSchema.parse({ price: "49.9" })
    expect(result.price).toBe(49.9)
  })

  describe("superRefine cross-field validation", () => {
    it("MONTHLY without billingDay fails (refine still runs when billingCycle is provided)", () => {
      const result = subscriptionUpdateSchema.safeParse({
        billingCycle: "MONTHLY",
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const billingDayIssue = result.error.issues.find(
          (i) => i.path[0] === "billingDay"
        )
        expect(billingDayIssue).toBeDefined()
      }
    })

    it("YEARLY without nextBillingDate fails (refine still runs when billingCycle is provided)", () => {
      const result = subscriptionUpdateSchema.safeParse({
        billingCycle: "YEARLY",
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const nextBillingIssue = result.error.issues.find(
          (i) => i.path[0] === "nextBillingDate"
        )
        expect(nextBillingIssue).toBeDefined()
      }
    })

    it("MONTHLY with billingDay passes on update", () => {
      const result = subscriptionUpdateSchema.parse({
        billingCycle: "MONTHLY",
        billingDay: 10,
      })
      expect(result.billingDay).toBe(10)
    })

    it("YEARLY with nextBillingDate passes on update", () => {
      const result = subscriptionUpdateSchema.parse({
        billingCycle: "YEARLY",
        nextBillingDate: "2027-06-01",
      })
      expect(result.nextBillingDate).toBeInstanceOf(Date)
    })

    it("when billingCycle is not provided, superRefine skips (no validation errors)", () => {
      const result = subscriptionUpdateSchema.safeParse({
        name: "Just a name change",
        price: 29.9,
      })
      expect(result.success).toBe(true)
    })
  })
})
