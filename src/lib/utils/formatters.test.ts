import { describe, expect, it } from "vitest"
import { formatCurrency } from "./formatters"

describe("formatCurrency", () => {
  it("formats BRL values correctly", () => {
    const result = formatCurrency(1234.56, "BRL")
    // pt-BR formatting: R$ followed by non-breaking space, then 1.234,56
    expect(result).toBe("R$\u00a01.234,56")
  })

  it("formats USD values correctly", () => {
    const result = formatCurrency(1234.56, "USD")
    // pt-BR locale with USD: US$ followed by non-breaking space
    expect(result).toBe("US$\u00a01.234,56")
  })

  it("handles zero", () => {
    const result = formatCurrency(0, "BRL")
    expect(result).toBe("R$\u00a00,00")
  })

  it("handles negative values", () => {
    const result = formatCurrency(-50.0, "BRL")
    expect(result).toBe("-R$\u00a050,00")
  })

  it("handles large numbers", () => {
    const result = formatCurrency(9_999_999.99, "BRL")
    expect(result).toBe("R$\u00a09.999.999,99")
  })

  it("formats EUR values correctly", () => {
    const result = formatCurrency(99.9, "EUR")
    // pt-BR locale with EUR: € followed by non-breaking space
    expect(result).toBe("\u20ac\u00a099,90")
  })
})
