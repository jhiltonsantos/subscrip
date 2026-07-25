import { PaymentMethodType } from "@prisma/client"
import { describe, expect, it } from "vitest"

import {
  paymentMethodCreateSchema,
  paymentMethodUpdateSchema,
} from "./payment-methods"

// Base inputs for field-specific tests — uses a non-CREDIT_CARD type so the
// superRefine (which requires cardNickname for CREDIT_CARD) does not interfere.
const debitCardInput = { name: "Debit Card", type: PaymentMethodType.DEBIT_CARD }
const creditCardInput = { name: "Credit Card", type: PaymentMethodType.CREDIT_CARD }

// ---------------------------------------------------------------------------
// paymentMethodCreateSchema
// ---------------------------------------------------------------------------
describe("paymentMethodCreateSchema", () => {
  it("parses valid minimal input (name + type only)", () => {
    const result = paymentMethodCreateSchema.safeParse(debitCardInput)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe("Debit Card")
      expect(result.data.type).toBe(PaymentMethodType.DEBIT_CARD)
    }
  })

  // -- name --
  describe("name", () => {
    it("is required", () => {
      const result = paymentMethodCreateSchema.safeParse({
        type: PaymentMethodType.DEBIT_CARD,
      })
      expect(result.success).toBe(false)
    })

    it("rejects empty string", () => {
      const result = paymentMethodCreateSchema.safeParse({
        ...debitCardInput,
        name: "",
      })
      expect(result.success).toBe(false)
    })

    it("rejects string longer than 120 characters", () => {
      const result = paymentMethodCreateSchema.safeParse({
        ...debitCardInput,
        name: "x".repeat(121),
      })
      expect(result.success).toBe(false)
    })

    it("accepts exactly 120 characters", () => {
      const result = paymentMethodCreateSchema.safeParse({
        ...debitCardInput,
        name: "x".repeat(120),
      })
      expect(result.success).toBe(true)
    })
  })

  // -- type --
  describe("type", () => {
    it.each(Object.values(PaymentMethodType))("accepts valid type %s", (type) => {
      const input =
        type === PaymentMethodType.CREDIT_CARD
          ? { name: "Test", type, cardNickname: "Wallet" }
          : { name: "Test", type }
      const result = paymentMethodCreateSchema.safeParse(input)
      expect(result.success).toBe(true)
    })

    it("rejects invalid type", () => {
      const result = paymentMethodCreateSchema.safeParse({
        ...debitCardInput,
        type: "INVALID_TYPE",
      })
      expect(result.success).toBe(false)
    })
  })

  // -- cardNickname --
  describe("cardNickname", () => {
    it("accepts a valid string", () => {
      const result = paymentMethodCreateSchema.safeParse({
        ...creditCardInput,
        cardNickname: "My Wallet",
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.cardNickname).toBe("My Wallet")
      }
    })

    it("transforms empty string to null", () => {
      const result = paymentMethodCreateSchema.safeParse({
        ...debitCardInput,
        cardNickname: "",
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.cardNickname).toBeNull()
      }
    })

    it("can be omitted", () => {
      const result = paymentMethodCreateSchema.safeParse(debitCardInput)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.cardNickname).toBeUndefined()
      }
    })
  })

  // -- brand --
  describe("brand", () => {
    it("accepts a valid string", () => {
      const result = paymentMethodCreateSchema.safeParse({
        ...debitCardInput,
        brand: "Visa",
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.brand).toBe("Visa")
      }
    })

    it("transforms empty string to null", () => {
      const result = paymentMethodCreateSchema.safeParse({
        ...debitCardInput,
        brand: "",
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.brand).toBeNull()
      }
    })

    it("can be omitted", () => {
      const result = paymentMethodCreateSchema.safeParse(debitCardInput)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.brand).toBeUndefined()
      }
    })
  })

  // -- last4 --
  describe("last4", () => {
    it("accepts exactly 4 digits", () => {
      const result = paymentMethodCreateSchema.safeParse({
        ...debitCardInput,
        last4: "1234",
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.last4).toBe("1234")
      }
    })

    it("rejects 3 digits", () => {
      const result = paymentMethodCreateSchema.safeParse({
        ...debitCardInput,
        last4: "123",
      })
      expect(result.success).toBe(false)
    })

    it("rejects non-digit characters", () => {
      const result = paymentMethodCreateSchema.safeParse({
        ...debitCardInput,
        last4: "abcd",
      })
      expect(result.success).toBe(false)
    })

    it("transforms empty string to null", () => {
      const result = paymentMethodCreateSchema.safeParse({
        ...debitCardInput,
        last4: "",
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.last4).toBeNull()
      }
    })

    it("can be omitted", () => {
      const result = paymentMethodCreateSchema.safeParse(debitCardInput)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.last4).toBeUndefined()
      }
    })
  })

  // -- closingDay --
  describe("closingDay", () => {
    it("coerces string '15' to number 15", () => {
      const result = paymentMethodCreateSchema.safeParse({
        ...debitCardInput,
        closingDay: "15",
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.closingDay).toBe(15)
      }
    })

    it("transforms empty string to null", () => {
      const result = paymentMethodCreateSchema.safeParse({
        ...debitCardInput,
        closingDay: "",
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.closingDay).toBeNull()
      }
    })

    it("rejects 0 (below minimum)", () => {
      const result = paymentMethodCreateSchema.safeParse({
        ...debitCardInput,
        closingDay: 0,
      })
      expect(result.success).toBe(false)
    })

    it("rejects 32 (above maximum)", () => {
      const result = paymentMethodCreateSchema.safeParse({
        ...debitCardInput,
        closingDay: 32,
      })
      expect(result.success).toBe(false)
    })

    it("can be omitted", () => {
      const result = paymentMethodCreateSchema.safeParse(debitCardInput)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.closingDay).toBeUndefined()
      }
    })
  })

  // -- dueDay --
  describe("dueDay", () => {
    it("coerces string '15' to number 15", () => {
      const result = paymentMethodCreateSchema.safeParse({
        ...debitCardInput,
        dueDay: "15",
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.dueDay).toBe(15)
      }
    })

    it("transforms empty string to null", () => {
      const result = paymentMethodCreateSchema.safeParse({
        ...debitCardInput,
        dueDay: "",
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.dueDay).toBeNull()
      }
    })

    it("rejects 0 (below minimum)", () => {
      const result = paymentMethodCreateSchema.safeParse({
        ...debitCardInput,
        dueDay: 0,
      })
      expect(result.success).toBe(false)
    })

    it("rejects 32 (above maximum)", () => {
      const result = paymentMethodCreateSchema.safeParse({
        ...debitCardInput,
        dueDay: 32,
      })
      expect(result.success).toBe(false)
    })

    it("can be omitted (inherits from nullable optional)", () => {
      const result = paymentMethodCreateSchema.safeParse(debitCardInput)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.dueDay).toBeUndefined()
      }
    })
  })

  // -- limitAmount --
  describe("limitAmount", () => {
    it("coerces string '100.50' to number 100.5", () => {
      const result = paymentMethodCreateSchema.safeParse({
        ...debitCardInput,
        limitAmount: "100.50",
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.limitAmount).toBe(100.5)
      }
    })

    it("transforms empty string to null", () => {
      const result = paymentMethodCreateSchema.safeParse({
        ...debitCardInput,
        limitAmount: "",
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.limitAmount).toBeNull()
      }
    })

    it("rejects 0 (not positive)", () => {
      const result = paymentMethodCreateSchema.safeParse({
        ...debitCardInput,
        limitAmount: 0,
      })
      expect(result.success).toBe(false)
    })

    it("rejects negative number", () => {
      const result = paymentMethodCreateSchema.safeParse({
        ...debitCardInput,
        limitAmount: -10,
      })
      expect(result.success).toBe(false)
    })

    it("can be omitted", () => {
      const result = paymentMethodCreateSchema.safeParse(debitCardInput)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.limitAmount).toBeUndefined()
      }
    })
  })

  // -- superRefine --
  describe("superRefine", () => {
    it("fails CREDIT_CARD without cardNickname", () => {
      const result = paymentMethodCreateSchema.safeParse(creditCardInput)
      expect(result.success).toBe(false)
      if (!result.success) {
        const cardNicknameIssue = result.error.issues.find(
          (i) => i.path[0] === "cardNickname",
        )
        expect(cardNicknameIssue).toBeDefined()
        expect(cardNicknameIssue!.message).toBe("Card nickname is required")
      }
    })

    it("passes non-CREDIT_CARD without cardNickname", () => {
      const result = paymentMethodCreateSchema.safeParse(debitCardInput)
      expect(result.success).toBe(true)
    })

    it("passes CREDIT_CARD with cardNickname provided", () => {
      const result = paymentMethodCreateSchema.safeParse({
        ...creditCardInput,
        cardNickname: "My Wallet",
      })
      expect(result.success).toBe(true)
    })
  })
})

// ---------------------------------------------------------------------------
// paymentMethodUpdateSchema
// ---------------------------------------------------------------------------
describe("paymentMethodUpdateSchema", () => {
  it("parses empty object (all fields optional)", () => {
    const result = paymentMethodUpdateSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it("name is optional — can be omitted", () => {
    const result = paymentMethodUpdateSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it("accepts a name update", () => {
    const result = paymentMethodUpdateSchema.safeParse({ name: "Updated Card" })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe("Updated Card")
    }
  })

  it("rejects name longer than 120 characters", () => {
    const result = paymentMethodUpdateSchema.safeParse({
      name: "x".repeat(121),
    })
    expect(result.success).toBe(false)
  })

  describe("type is omitted (via .omit())", () => {
    it("accepts input without type", () => {
      const result = paymentMethodUpdateSchema.safeParse({
        name: "Renamed",
      })
      expect(result.success).toBe(true)
    })

    it("accepts input with type (unknown key is stripped)", () => {
      const result = paymentMethodUpdateSchema.safeParse({
        name: "Renamed",
        type: PaymentMethodType.CREDIT_CARD,
      })
      expect(result.success).toBe(true)
      // Type is stripped — the parsed data should not contain it
      if (result.success) {
        expect(result.data).not.toHaveProperty("type")
      }
    })
  })

  describe("isActive", () => {
    it("accepts true", () => {
      const result = paymentMethodUpdateSchema.safeParse({ isActive: true })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.isActive).toBe(true)
      }
    })

    it("accepts false", () => {
      const result = paymentMethodUpdateSchema.safeParse({ isActive: false })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.isActive).toBe(false)
      }
    })

    it("can be omitted", () => {
      const result = paymentMethodUpdateSchema.safeParse({})
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.isActive).toBeUndefined()
      }
    })
  })
})
