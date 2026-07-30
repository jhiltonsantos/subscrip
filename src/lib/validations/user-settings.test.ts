import { describe, expect, it } from "vitest"

import {
  darkThemeVariantSchema,
  userSettingsSchema,
} from "./user-settings"

const validInput = {
  name: "John Doe",
  preferredCurrency: "BRL" as const,
  theme: "LIGHT" as const,
  darkThemeVariant: "BLUE" as const,
  language: "en-US" as const,
  defaultReminderDays: 3,
  defaultReminderChannel: "EMAIL" as const,
}

describe("userSettingsSchema", () => {
  it("parses valid complete input", () => {
    const result = userSettingsSchema.safeParse(validInput)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe("John Doe")
      expect(result.data.preferredCurrency).toBe("BRL")
      expect(result.data.theme).toBe("LIGHT")
      expect(result.data.darkThemeVariant).toBe("BLUE")
      expect(result.data.language).toBe("en-US")
      expect(result.data.defaultReminderDays).toBe(3)
      expect(result.data.defaultReminderChannel).toBe("EMAIL")
    }
  })

  describe("name", () => {
    it("is optional — can be omitted", () => {
      const { name: _name, ...withoutName } = validInput
      const result = userSettingsSchema.safeParse(withoutName)
      expect(result.success).toBe(true)
    })

    it("accepts empty string (optional field)", () => {
      const result = userSettingsSchema.safeParse({ ...validInput, name: "" })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe("")
      }
    })

    it("rejects string longer than 120 characters", () => {
      const result = userSettingsSchema.safeParse({
        ...validInput,
        name: "x".repeat(121),
      })
      expect(result.success).toBe(false)
    })

    it("accepts string of exactly 120 characters", () => {
      const result = userSettingsSchema.safeParse({
        ...validInput,
        name: "x".repeat(120),
      })
      expect(result.success).toBe(true)
    })
  })

  describe("preferredCurrency", () => {
    it.each(["BRL", "USD", "EUR"] as const)("accepts %s", (currency) => {
      const result = userSettingsSchema.safeParse({
        ...validInput,
        preferredCurrency: currency,
      })
      expect(result.success).toBe(true)
    })

    it("rejects invalid currency", () => {
      const result = userSettingsSchema.safeParse({
        ...validInput,
        preferredCurrency: "GBP",
      })
      expect(result.success).toBe(false)
    })
  })

  describe("theme", () => {
    it.each(["LIGHT", "DARK", "SYSTEM"] as const)("accepts %s", (theme) => {
      const result = userSettingsSchema.safeParse({ ...validInput, theme })
      expect(result.success).toBe(true)
    })

    it("rejects invalid theme", () => {
      const result = userSettingsSchema.safeParse({
        ...validInput,
        theme: "INVALID",
      })
      expect(result.success).toBe(false)
    })
  })

  describe("darkThemeVariant", () => {
    it.each(["BLUE", "BLACK"] as const)("accepts %s", (variant) => {
      const result = userSettingsSchema.safeParse({
        ...validInput,
        darkThemeVariant: variant,
      })
      expect(result.success).toBe(true)
    })

    it("rejects invalid dark theme variant", () => {
      const result = userSettingsSchema.safeParse({
        ...validInput,
        darkThemeVariant: "GREEN",
      })
      expect(result.success).toBe(false)
    })
  })

  describe("language", () => {
    it.each(["en-US", "pt-BR"] as const)("accepts %s", (lang) => {
      const result = userSettingsSchema.safeParse({ ...validInput, language: lang })
      expect(result.success).toBe(true)
    })

    it("rejects invalid language", () => {
      const result = userSettingsSchema.safeParse({
        ...validInput,
        language: "fr-FR",
      })
      expect(result.success).toBe(false)
    })
  })

  describe("defaultReminderDays", () => {
    it("accepts 0 (minimum)", () => {
      const result = userSettingsSchema.safeParse({
        ...validInput,
        defaultReminderDays: 0,
      })
      expect(result.success).toBe(true)
    })

    it("accepts 365 (maximum)", () => {
      const result = userSettingsSchema.safeParse({
        ...validInput,
        defaultReminderDays: 365,
      })
      expect(result.success).toBe(true)
    })

    it("coerces numeric string to number", () => {
      const result = userSettingsSchema.safeParse({
        ...validInput,
        defaultReminderDays: "15",
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.defaultReminderDays).toBe(15)
      }
    })

    it("rejects negative number", () => {
      const result = userSettingsSchema.safeParse({
        ...validInput,
        defaultReminderDays: -1,
      })
      expect(result.success).toBe(false)
    })

    it("rejects number greater than 365", () => {
      const result = userSettingsSchema.safeParse({
        ...validInput,
        defaultReminderDays: 366,
      })
      expect(result.success).toBe(false)
    })

    it("rejects non-numeric string (coerces to NaN — fails int check)", () => {
      const result = userSettingsSchema.safeParse({
        ...validInput,
        defaultReminderDays: "abc",
      })
      expect(result.success).toBe(false)
    })

    it("rejects decimal number (must be int)", () => {
      const result = userSettingsSchema.safeParse({
        ...validInput,
        defaultReminderDays: 1.5,
      })
      expect(result.success).toBe(false)
    })
  })

  describe("defaultReminderChannel", () => {
    it.each(["EMAIL", "PUSH", "BOTH"] as const)("accepts %s", (channel) => {
      const result = userSettingsSchema.safeParse({
        ...validInput,
        defaultReminderChannel: channel,
      })
      expect(result.success).toBe(true)
    })

    it("rejects invalid channel", () => {
      const result = userSettingsSchema.safeParse({
        ...validInput,
        defaultReminderChannel: "SMS",
      })
      expect(result.success).toBe(false)
    })
  })

  it("rejects empty object (missing all required fields)", () => {
    const result = userSettingsSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it("rejects input missing preferredCurrency", () => {
    const { preferredCurrency: _preferredCurrency, ...rest } = validInput
    const result = userSettingsSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })

  it("rejects input missing theme", () => {
    const { theme: _theme, ...rest } = validInput
    const result = userSettingsSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })
})

describe("darkThemeVariantSchema", () => {
  it("accepts { darkThemeVariant: 'BLUE' }", () => {
    const result = darkThemeVariantSchema.safeParse({ darkThemeVariant: "BLUE" })
    expect(result.success).toBe(true)
  })

  it("accepts { darkThemeVariant: 'BLACK' }", () => {
    const result = darkThemeVariantSchema.safeParse({
      darkThemeVariant: "BLACK",
    })
    expect(result.success).toBe(true)
  })

  it("rejects invalid variant", () => {
    const result = darkThemeVariantSchema.safeParse({
      darkThemeVariant: "GREEN",
    })
    expect(result.success).toBe(false)
  })

  it("rejects missing field", () => {
    const result = darkThemeVariantSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})
