import { describe, expect, it } from "vitest"
import { Currency, ExpenseBucket, RecurrenceKind } from "@prisma/client"
import {
  monthPlanParamsSchema,
  plannedIncomeCreateSchema,
  plannedIncomeUpdateSchema,
  plannedExpenseCreateSchema,
  plannedExpenseUpdateSchema,
  financeTrendParamsSchema,
  monthComparisonParamsSchema,
} from "./finance-planner"

describe("monthPlanParamsSchema", () => {
  it("accepts valid year and month", () => {
    const result = monthPlanParamsSchema.parse({ year: 2026, month: 7 })
    expect(result).toEqual({ year: 2026, month: 7 })
  })

  it("coerces string values to numbers", () => {
    const result = monthPlanParamsSchema.parse({ year: "2026", month: "7" })
    expect(result).toEqual({ year: 2026, month: 7 })
  })

  describe("year validation", () => {
    it("accepts 2000", () => {
      expect(monthPlanParamsSchema.parse({ year: 2000, month: 1 })).toMatchObject({ year: 2000 })
    })

    it("accepts 2100", () => {
      expect(monthPlanParamsSchema.parse({ year: 2100, month: 1 })).toMatchObject({ year: 2100 })
    })

    it("rejects 1999", () => {
      expect(() => monthPlanParamsSchema.parse({ year: 1999, month: 1 })).toThrow()
    })

    it("rejects 2101", () => {
      expect(() => monthPlanParamsSchema.parse({ year: 2101, month: 1 })).toThrow()
    })
  })

  describe("month validation", () => {
    it("accepts 1", () => {
      expect(monthPlanParamsSchema.parse({ year: 2026, month: 1 })).toMatchObject({ month: 1 })
    })

    it("accepts 12", () => {
      expect(monthPlanParamsSchema.parse({ year: 2026, month: 12 })).toMatchObject({ month: 12 })
    })

    it("rejects 0", () => {
      expect(() => monthPlanParamsSchema.parse({ year: 2026, month: 0 })).toThrow()
    })

    it("rejects 13", () => {
      expect(() => monthPlanParamsSchema.parse({ year: 2026, month: 13 })).toThrow()
    })
  })
})

describe("plannedIncomeCreateSchema", () => {
  const validInput = {
    year: 2026,
    month: 7,
    name: "Salary",
    amount: 5000,
    currency: "BRL",
  }

  it("accepts a complete valid input with all fields", () => {
    const input = {
      ...validInput,
      description: "Monthly salary",
      sortOrder: 1,
      expectedDate: "2026-07-01",
      receivedAt: "2026-07-01",
      isReceived: true,
      recurrenceKind: "MONTHLY_RECURRING",
      recurrenceGroupId: "550e8400-e29b-41d4-a716-446655440000",
      recurrenceNumber: 1,
      recurrenceTotal: 12,
      createMonthlyRecurring: true,
      recurrenceMonths: 12,
    }
    const result = plannedIncomeCreateSchema.parse(input)
    expect(result.name).toBe("Salary")
    expect(result.amount).toBe(5000)
    expect(result.currency).toBe(Currency.BRL)
    expect(result.recurrenceKind).toBe(RecurrenceKind.MONTHLY_RECURRING)
  })

  it("accepts minimal valid input", () => {
    const result = plannedIncomeCreateSchema.parse(validInput)
    expect(result).toMatchObject({
      year: 2026,
      month: 7,
      name: "Salary",
      amount: 5000,
      currency: Currency.BRL,
    })
  })

  describe("name", () => {
    it("rejects empty name", () => {
      expect(() =>
        plannedIncomeCreateSchema.parse({ ...validInput, name: "" })
      ).toThrow()
    })

    it("rejects name exceeding 200 characters", () => {
      expect(() =>
        plannedIncomeCreateSchema.parse({ ...validInput, name: "a".repeat(201) })
      ).toThrow()
    })

    it("accepts name at max length", () => {
      const result = plannedIncomeCreateSchema.parse({
        ...validInput,
        name: "a".repeat(200),
      })
      expect(result.name).toHaveLength(200)
    })
  })

  describe("amount", () => {
    it("coerces string amount to number", () => {
      const result = plannedIncomeCreateSchema.parse({ ...validInput, amount: "5000" })
      expect(result.amount).toBe(5000)
    })

    it("rejects zero amount", () => {
      expect(() => plannedIncomeCreateSchema.parse({ ...validInput, amount: 0 })).toThrow()
    })

    it("rejects negative amount", () => {
      expect(() => plannedIncomeCreateSchema.parse({ ...validInput, amount: -1 })).toThrow()
    })
  })

  describe("currency", () => {
    it("defaults to BRL", () => {
      const result = plannedIncomeCreateSchema.parse(validInput)
      expect(result.currency).toBe(Currency.BRL)
    })

    it("accepts USD", () => {
      const result = plannedIncomeCreateSchema.parse({ ...validInput, currency: "USD" })
      expect(result.currency).toBe(Currency.USD)
    })

    it("rejects invalid currency", () => {
      expect(() =>
        plannedIncomeCreateSchema.parse({ ...validInput, currency: "GBP" })
      ).toThrow()
    })
  })

  describe("description", () => {
    it("accepts null description", () => {
      const result = plannedIncomeCreateSchema.parse({ ...validInput, description: null })
      expect(result.description).toBeNull()
    })

    it("accepts undefined description", () => {
      const result = plannedIncomeCreateSchema.parse(validInput)
      expect(result.description).toBeUndefined()
    })

    it("rejects description exceeding 1000 characters", () => {
      expect(() =>
        plannedIncomeCreateSchema.parse({
          ...validInput,
          description: "a".repeat(1001),
        })
      ).toThrow()
    })
  })

  describe("sortOrder", () => {
    it("coerces string sortOrder", () => {
      const result = plannedIncomeCreateSchema.parse({ ...validInput, sortOrder: "1" })
      expect(result.sortOrder).toBe(1)
    })

    it("accepts undefined sortOrder", () => {
      const result = plannedIncomeCreateSchema.parse(validInput)
      expect(result.sortOrder).toBeUndefined()
    })
  })

  describe("expectedDate and receivedAt", () => {
    it("coerces date strings", () => {
      const result = plannedIncomeCreateSchema.parse({
        ...validInput,
        expectedDate: "2026-07-01",
        receivedAt: "2026-07-15",
      })
      expect(result.expectedDate).toBeInstanceOf(Date)
      expect(result.receivedAt).toBeInstanceOf(Date)
    })

    it("accepts null dates", () => {
      const result = plannedIncomeCreateSchema.parse({
        ...validInput,
        expectedDate: null,
        receivedAt: null,
      })
      expect(result.expectedDate).toBeNull()
      expect(result.receivedAt).toBeNull()
    })
  })

  describe("isReceived", () => {
    it("accepts boolean isReceived", () => {
      const result = plannedIncomeCreateSchema.parse({ ...validInput, isReceived: true })
      expect(result.isReceived).toBe(true)
    })

    it("accepts undefined isReceived", () => {
      const result = plannedIncomeCreateSchema.parse(validInput)
      expect(result.isReceived).toBeUndefined()
    })
  })

  describe("recurrenceKind", () => {
    it("accepts INSTALLMENT", () => {
      const result = plannedIncomeCreateSchema.parse({
        ...validInput,
        recurrenceKind: "INSTALLMENT",
      })
      expect(result.recurrenceKind).toBe(RecurrenceKind.INSTALLMENT)
    })

    it("accepts null recurrenceKind", () => {
      const result = plannedIncomeCreateSchema.parse({ ...validInput, recurrenceKind: null })
      expect(result.recurrenceKind).toBeNull()
    })

    it("rejects invalid recurrenceKind", () => {
      expect(() =>
        plannedIncomeCreateSchema.parse({ ...validInput, recurrenceKind: "INVALID" })
      ).toThrow()
    })
  })

  describe("recurrenceGroupId", () => {
    it("accepts valid UUID", () => {
      const result = plannedIncomeCreateSchema.parse({
        ...validInput,
        recurrenceGroupId: "550e8400-e29b-41d4-a716-446655440000",
      })
      expect(result.recurrenceGroupId).toBe("550e8400-e29b-41d4-a716-446655440000")
    })

    it("rejects invalid UUID", () => {
      expect(() =>
        plannedIncomeCreateSchema.parse({ ...validInput, recurrenceGroupId: "not-a-uuid" })
      ).toThrow()
    })

    it("accepts null", () => {
      const result = plannedIncomeCreateSchema.parse({ ...validInput, recurrenceGroupId: null })
      expect(result.recurrenceGroupId).toBeNull()
    })

    it("accepts undefined", () => {
      const result = plannedIncomeCreateSchema.parse(validInput)
      expect(result.recurrenceGroupId).toBeUndefined()
    })
  })

  describe("recurrenceNumber and recurrenceTotal", () => {
    it("coerces string values to positive ints", () => {
      const result = plannedIncomeCreateSchema.parse({
        ...validInput,
        recurrenceNumber: "1",
        recurrenceTotal: "12",
      })
      expect(result.recurrenceNumber).toBe(1)
      expect(result.recurrenceTotal).toBe(12)
    })

    it("rejects zero recurrenceNumber", () => {
      expect(() =>
        plannedIncomeCreateSchema.parse({ ...validInput, recurrenceNumber: 0 })
      ).toThrow()
    })

    it("accepts null", () => {
      const result = plannedIncomeCreateSchema.parse({
        ...validInput,
        recurrenceNumber: null,
        recurrenceTotal: null,
      })
      expect(result.recurrenceNumber).toBeNull()
      expect(result.recurrenceTotal).toBeNull()
    })
  })

  describe("recurrenceMonths", () => {
    it("coerces string value to positive int", () => {
      const result = plannedIncomeCreateSchema.parse({
        ...validInput,
        recurrenceMonths: "12",
      })
      expect(result.recurrenceMonths).toBe(12)
    })

    it("rejects zero", () => {
      expect(() =>
        plannedIncomeCreateSchema.parse({ ...validInput, recurrenceMonths: 0 })
      ).toThrow()
    })

    it("rejects 121 (exceeds max 120)", () => {
      expect(() =>
        plannedIncomeCreateSchema.parse({ ...validInput, recurrenceMonths: 121 })
      ).toThrow()
    })

    it("accepts 120 (max)", () => {
      const result = plannedIncomeCreateSchema.parse({
        ...validInput,
        recurrenceMonths: 120,
      })
      expect(result.recurrenceMonths).toBe(120)
    })

    it("accepts null", () => {
      const result = plannedIncomeCreateSchema.parse({ ...validInput, recurrenceMonths: null })
      expect(result.recurrenceMonths).toBeNull()
    })
  })

  describe("createMonthlyRecurring", () => {
    it("accepts boolean", () => {
      const result = plannedIncomeCreateSchema.parse({
        ...validInput,
        createMonthlyRecurring: true,
      })
      expect(result.createMonthlyRecurring).toBe(true)
    })
  })
})

describe("plannedIncomeUpdateSchema", () => {
  it("parses empty object successfully (all fields optional)", () => {
    const result = plannedIncomeUpdateSchema.parse({})
    expect(result).toEqual({})
  })

  it("accepts partial update with only name", () => {
    const result = plannedIncomeUpdateSchema.parse({ name: "Updated Salary" })
    expect(result.name).toBe("Updated Salary")
  })

  it("rejects empty name if provided", () => {
    expect(() => plannedIncomeUpdateSchema.parse({ name: "" })).toThrow()
  })

  it("coerces amount when provided", () => {
    const result = plannedIncomeUpdateSchema.parse({ amount: "7500" })
    expect(result.amount).toBe(7500)
  })

  it("rejects zero amount if provided", () => {
    expect(() => plannedIncomeUpdateSchema.parse({ amount: 0 })).toThrow()
  })
})

describe("plannedExpenseCreateSchema", () => {
  const validInput = {
    year: 2026,
    month: 7,
    name: "Rent",
    amount: 1000,
  }

  it("accepts minimal valid input", () => {
    const result = plannedExpenseCreateSchema.parse(validInput)
    expect(result).toMatchObject({
      year: 2026,
      month: 7,
      name: "Rent",
      amount: 1000,
      currency: Currency.BRL,
      expenseBucket: ExpenseBucket.OTHER,
    })
  })

  describe("expenseBucket", () => {
    it("defaults to OTHER", () => {
      const result = plannedExpenseCreateSchema.parse(validInput)
      expect(result.expenseBucket).toBe(ExpenseBucket.OTHER)
    })

    it("accepts MONTHLY_BILLS", () => {
      const result = plannedExpenseCreateSchema.parse({
        ...validInput,
        expenseBucket: "MONTHLY_BILLS",
      })
      expect(result.expenseBucket).toBe(ExpenseBucket.MONTHLY_BILLS)
    })

    it("rejects invalid expense bucket", () => {
      expect(() =>
        plannedExpenseCreateSchema.parse({ ...validInput, expenseBucket: "INVALID" })
      ).toThrow()
    })
  })

  describe("paymentMethodId, paymentCardId, creditCardInvoiceId, subscriptionId, installmentPurchaseId", () => {
    const uuidFields = [
      "paymentMethodId",
      "paymentCardId",
      "creditCardInvoiceId",
      "subscriptionId",
      "installmentPurchaseId",
    ] as const

    for (const field of uuidFields) {
      it(`${field} accepts valid UUID`, () => {
        const result = plannedExpenseCreateSchema.parse({
          ...validInput,
          [field]: "550e8400-e29b-41d4-a716-446655440000",
        })
        expect(result[field]).toBe("550e8400-e29b-41d4-a716-446655440000")
      })

      it(`${field} rejects invalid UUID`, () => {
        expect(() =>
          plannedExpenseCreateSchema.parse({ ...validInput, [field]: "not-a-uuid" })
        ).toThrow()
      })

      it(`${field} accepts null`, () => {
        const result = plannedExpenseCreateSchema.parse({ ...validInput, [field]: null })
        expect(result[field]).toBeNull()
      })

      it(`${field} accepts undefined`, () => {
        const result = plannedExpenseCreateSchema.parse(validInput)
        expect(result[field]).toBeUndefined()
      })
    }
  })

  describe("installmentNumber and installmentTotal", () => {
    it("coerces string values to positive ints", () => {
      const result = plannedExpenseCreateSchema.parse({
        ...validInput,
        installmentNumber: "1",
        installmentTotal: "3",
      })
      expect(result.installmentNumber).toBe(1)
      expect(result.installmentTotal).toBe(3)
    })

    it("rejects zero installmentNumber", () => {
      expect(() =>
        plannedExpenseCreateSchema.parse({ ...validInput, installmentNumber: 0 })
      ).toThrow()
    })

    it("accepts null", () => {
      const result = plannedExpenseCreateSchema.parse({
        ...validInput,
        installmentNumber: null,
        installmentTotal: null,
      })
      expect(result.installmentNumber).toBeNull()
      expect(result.installmentTotal).toBeNull()
    })
  })

  describe("purchaseDate, dueDate, paidAt", () => {
    for (const field of ["purchaseDate", "dueDate", "paidAt"] as const) {
      it(`${field} coerces date string`, () => {
        const result = plannedExpenseCreateSchema.parse({
          ...validInput,
          [field]: "2026-07-01",
        })
        expect(result[field]).toBeInstanceOf(Date)
      })

      it(`${field} accepts null`, () => {
        const result = plannedExpenseCreateSchema.parse({ ...validInput, [field]: null })
        expect(result[field]).toBeNull()
      })
    }
  })

  describe("isPaid", () => {
    it("accepts boolean", () => {
      const result = plannedExpenseCreateSchema.parse({ ...validInput, isPaid: true })
      expect(result.isPaid).toBe(true)
    })
  })

  describe("createFutureInstallments, createPreviousInstallments, createMonthlyRecurring", () => {
    for (const field of [
      "createFutureInstallments",
      "createPreviousInstallments",
      "createMonthlyRecurring",
    ] as const) {
      it(`${field} accepts boolean`, () => {
        const result = plannedExpenseCreateSchema.parse({ ...validInput, [field]: true })
        expect(result[field]).toBe(true)
      })
    }
  })

  describe("merchantName", () => {
    it("accepts merchant name", () => {
      const result = plannedExpenseCreateSchema.parse({
        ...validInput,
        merchantName: "Supermarket",
      })
      expect(result.merchantName).toBe("Supermarket")
    })

    it("rejects merchant name exceeding 200 characters", () => {
      expect(() =>
        plannedExpenseCreateSchema.parse({
          ...validInput,
          merchantName: "a".repeat(201),
        })
      ).toThrow()
    })

    it("accepts null", () => {
      const result = plannedExpenseCreateSchema.parse({ ...validInput, merchantName: null })
      expect(result.merchantName).toBeNull()
    })
  })
})

describe("plannedExpenseUpdateSchema", () => {
  it("parses empty object successfully (all fields optional)", () => {
    const result = plannedExpenseUpdateSchema.parse({})
    expect(result).toEqual({})
  })

  it("accepts partial update with only name", () => {
    const result = plannedExpenseUpdateSchema.parse({ name: "Updated Rent" })
    expect(result.name).toBe("Updated Rent")
  })

  it("rejects empty name if provided", () => {
    expect(() => plannedExpenseUpdateSchema.parse({ name: "" })).toThrow()
  })

  it("coerces amount when provided", () => {
    const result = plannedExpenseUpdateSchema.parse({ amount: "1500" })
    expect(result.amount).toBe(1500)
  })

  it("rejects zero amount if provided", () => {
    expect(() => plannedExpenseUpdateSchema.parse({ amount: 0 })).toThrow()
  })

  it("accepts null merchantName", () => {
    const result = plannedExpenseUpdateSchema.parse({ merchantName: null })
    expect(result.merchantName).toBeNull()
  })
})

describe("financeTrendParamsSchema", () => {
  it("defaults count to 6 when missing", () => {
    const result = financeTrendParamsSchema.parse({ year: 2026, month: 7 })
    expect(result).toMatchObject({ year: 2026, month: 7, count: 6 })
  })

  it("accepts explicit count", () => {
    const result = financeTrendParamsSchema.parse({ year: 2026, month: 7, count: 3 })
    expect(result.count).toBe(3)
  })

  it("coerces string count", () => {
    const result = financeTrendParamsSchema.parse({ year: 2026, month: 7, count: "6" })
    expect(result.count).toBe(6)
  })

  it("rejects count below minimum (2)", () => {
    expect(() =>
      financeTrendParamsSchema.parse({ year: 2026, month: 7, count: 2 })
    ).toThrow()
  })

  it("rejects count above maximum (13)", () => {
    expect(() =>
      financeTrendParamsSchema.parse({ year: 2026, month: 7, count: 13 })
    ).toThrow()
  })

  it("accepts count at boundaries (3 and 12)", () => {
    expect(
      financeTrendParamsSchema.parse({ year: 2026, month: 7, count: 3 }).count
    ).toBe(3)
    expect(
      financeTrendParamsSchema.parse({ year: 2026, month: 7, count: 12 }).count
    ).toBe(12)
  })

  it("inherits year/month validation from monthPlanParamsSchema", () => {
    expect(() => financeTrendParamsSchema.parse({ year: 1999, month: 7 })).toThrow()
    expect(() => financeTrendParamsSchema.parse({ year: 2026, month: 0 })).toThrow()
  })
})

describe("monthComparisonParamsSchema", () => {
  it("accepts valid comparison params", () => {
    const result = monthComparisonParamsSchema.parse({
      yearA: 2026,
      monthA: 1,
      yearB: 2026,
      monthB: 2,
    })
    expect(result).toEqual({
      yearA: 2026,
      monthA: 1,
      yearB: 2026,
      monthB: 2,
    })
  })

  it("coerces string values", () => {
    const result = monthComparisonParamsSchema.parse({
      yearA: "2026",
      monthA: "1",
      yearB: "2026",
      monthB: "2",
    })
    expect(result).toEqual({
      yearA: 2026,
      monthA: 1,
      yearB: 2026,
      monthB: 2,
    })
  })

  it("rejects yearA before 2000", () => {
    expect(() =>
      monthComparisonParamsSchema.parse({
        yearA: 1999,
        monthA: 1,
        yearB: 2026,
        monthB: 2,
      })
    ).toThrow()
  })

  it("rejects yearB after 2100", () => {
    expect(() =>
      monthComparisonParamsSchema.parse({
        yearA: 2026,
        monthA: 1,
        yearB: 2101,
        monthB: 2,
      })
    ).toThrow()
  })

  it("rejects monthA < 1", () => {
    expect(() =>
      monthComparisonParamsSchema.parse({
        yearA: 2026,
        monthA: 0,
        yearB: 2026,
        monthB: 2,
      })
    ).toThrow()
  })

  it("rejects monthB > 12", () => {
    expect(() =>
      monthComparisonParamsSchema.parse({
        yearA: 2026,
        monthA: 1,
        yearB: 2026,
        monthB: 13,
      })
    ).toThrow()
  })
})
