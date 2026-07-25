import { describe, it, expect, beforeEach, afterEach } from "vitest"
import type { PlannedExpense, PlannedIncome, TranslationFn } from "./types"
import {
  getDialogTitle,
  getDialogDescription,
  getDialogFormId,
  formatExpenseInstallment,
  formatIncomeRecurrence,
  toDateInput,
  toDateOrUndefined,
  toOptionalNumber,
  toCardDueDateInput,
} from "./utils"

// ---- Helpers ----

const t = ((key: string) => key) as unknown as TranslationFn

function mockExpense(overrides: Partial<PlannedExpense> = {}): PlannedExpense {
  return {
    installmentNumber: undefined,
    installmentTotal: undefined,
    ...overrides,
  } as unknown as PlannedExpense
}

function mockIncome(overrides: Partial<PlannedIncome> = {}): PlannedIncome {
  return {
    recurrenceNumber: undefined,
    recurrenceTotal: undefined,
    ...overrides,
  } as unknown as PlannedIncome
}

// ---- getDialogTitle ----

describe("getDialogTitle", () => {
  it('returns income.editTitle when tab=income and editing=true', () => {
    expect(getDialogTitle("income", true, t)).toBe("income.editTitle")
  })

  it('returns income.createTitle when tab=income and editing=false', () => {
    expect(getDialogTitle("income", false, t)).toBe("income.createTitle")
  })

  it('returns expense.editTitle when tab=expenses and editing=true', () => {
    expect(getDialogTitle("expenses", true, t)).toBe("expense.editTitle")
  })

  it('returns expense.createTitle when tab=expenses and editing=false', () => {
    expect(getDialogTitle("expenses", false, t)).toBe("expense.createTitle")
  })

  it('returns cards.editCost when tab=cardCosts and editing=true', () => {
    expect(getDialogTitle("cardCosts", true, t)).toBe("cards.editCost")
  })

  it('returns cards.addCost when tab=cardCosts and editing=false', () => {
    expect(getDialogTitle("cardCosts", false, t)).toBe("cards.addCost")
  })
})

// ---- getDialogDescription ----

describe("getDialogDescription", () => {
  it('returns modal.incomeDescription for tab=income', () => {
    expect(getDialogDescription("income", t)).toBe("modal.incomeDescription")
  })

  it('returns modal.expenseDescription for tab=expenses', () => {
    expect(getDialogDescription("expenses", t)).toBe("modal.expenseDescription")
  })

  it('returns modal.cardCostDescription for tab=cardCosts', () => {
    expect(getDialogDescription("cardCosts", t)).toBe("modal.cardCostDescription")
  })
})

// ---- getDialogFormId ----

describe("getDialogFormId", () => {
  it('returns correct form id for tab=income', () => {
    expect(getDialogFormId("income")).toBe("finance-income-form")
  })

  it('returns correct form id for tab=expenses', () => {
    expect(getDialogFormId("expenses")).toBe("finance-expense-form")
  })

  it('returns correct form id for tab=cardCosts', () => {
    expect(getDialogFormId("cardCosts")).toBe("finance-card-cost-form")
  })
})

// ---- formatExpenseInstallment ----

describe("formatExpenseInstallment", () => {
  it('returns "3/12" when both installmentNumber and installmentTotal are present', () => {
    const row = mockExpense({ installmentNumber: 3, installmentTotal: 12 })
    expect(formatExpenseInstallment(row)).toBe("3/12")
  })

  it("returns null when only installmentNumber is present", () => {
    const row = mockExpense({ installmentNumber: 3, installmentTotal: undefined })
    expect(formatExpenseInstallment(row)).toBeNull()
  })

  it("returns null when only installmentTotal is present", () => {
    const row = mockExpense({ installmentNumber: undefined, installmentTotal: 12 })
    expect(formatExpenseInstallment(row)).toBeNull()
  })

  it("returns null when neither field is present", () => {
    const row = mockExpense()
    expect(formatExpenseInstallment(row)).toBeNull()
  })
})

// ---- formatIncomeRecurrence ----

describe("formatIncomeRecurrence", () => {
  it('returns "2/6" when both recurrenceNumber and recurrenceTotal are present', () => {
    const row = mockIncome({ recurrenceNumber: 2, recurrenceTotal: 6 })
    expect(formatIncomeRecurrence(row)).toBe("2/6")
  })

  it("returns null when only recurrenceNumber is present", () => {
    const row = mockIncome({ recurrenceNumber: 2, recurrenceTotal: undefined })
    expect(formatIncomeRecurrence(row)).toBeNull()
  })

  it("returns null when only recurrenceTotal is present", () => {
    const row = mockIncome({ recurrenceNumber: undefined, recurrenceTotal: 6 })
    expect(formatIncomeRecurrence(row)).toBeNull()
  })

  it("returns null when neither field is present", () => {
    const row = mockIncome()
    expect(formatIncomeRecurrence(row)).toBeNull()
  })
})

// ---- toDateInput ----

describe("toDateInput", () => {
  beforeEach(() => {
    process.env.TZ = "UTC"
  })
  afterEach(() => {
    delete process.env.TZ
  })

  it('converts "2026-07-15T00:00:00.000Z" to "2026-07-15"', () => {
    expect(toDateInput("2026-07-15T00:00:00.000Z")).toBe("2026-07-15")
  })

  it("returns empty string when value is null", () => {
    expect(toDateInput(null)).toBe("")
  })

  it("returns empty string when value is empty string", () => {
    expect(toDateInput("")).toBe("")
  })
})

// ---- toDateOrUndefined ----

describe("toDateOrUndefined", () => {
  beforeEach(() => {
    process.env.TZ = "UTC"
  })
  afterEach(() => {
    delete process.env.TZ
  })

  it('converts "2026-07-15" to a Date for that date', () => {
    const result = toDateOrUndefined("2026-07-15")
    expect(result).toBeInstanceOf(Date)
    expect(result!.toISOString()).toBe("2026-07-15T00:00:00.000Z")
  })

  it("returns undefined for empty string", () => {
    expect(toDateOrUndefined("")).toBeUndefined()
  })
})

// ---- toOptionalNumber ----

describe("toOptionalNumber", () => {
  it('converts "42" to 42', () => {
    expect(toOptionalNumber("42")).toBe(42)
  })

  it("returns undefined for empty string", () => {
    expect(toOptionalNumber("")).toBeUndefined()
  })
})

// ---- toCardDueDateInput ----

describe("toCardDueDateInput", () => {
  it("formats year, month, and dueDay as yyyy-MM-dd", () => {
    expect(toCardDueDateInput(2026, 7, 15)).toBe("2026-07-15")
  })

  it("uses day 1 when dueDay is null", () => {
    expect(toCardDueDateInput(2026, 7, null)).toBe("2026-07-01")
  })

  it("uses day 1 when dueDay is undefined", () => {
    expect(toCardDueDateInput(2026, 7, undefined)).toBe("2026-07-01")
  })

  it("clamps dueDay to last day of month", () => {
    // February 2026 has 28 days
    expect(toCardDueDateInput(2026, 2, 31)).toBe("2026-02-28")
  })

  it("does not clamp valid day values", () => {
    expect(toCardDueDateInput(2026, 2, 28)).toBe("2026-02-28")
  })
})
