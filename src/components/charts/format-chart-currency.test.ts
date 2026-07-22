import { describe, it, expect } from "vitest"
import { formatChartCurrency, formatChartPercent } from "./format-chart-currency"

describe("formatChartCurrency", () => {
  it("formats BRL with pt locale (no decimals)", () => {
    const result = formatChartCurrency(1234.56, "pt", "BRL")
    expect(result).toBe("R$\u00a01.235")
  })

  it("formats USD with en locale", () => {
    const result = formatChartCurrency(1234.56, "en", "USD")
    expect(result).toBe("$1,235")
  })

  it("defaults currency to BRL when not provided", () => {
    const result = formatChartCurrency(500, "pt")
    expect(result).toBe("R$\u00a0500")
  })

  it("formats zero value", () => {
    const result = formatChartCurrency(0, "en", "USD")
    expect(result).toBe("$0")
  })

  it("formats negative value with minus sign", () => {
    const result = formatChartCurrency(-100, "en", "USD")
    expect(result).toBe("-$100")
  })

  it("handles large numbers with no decimal fraction", () => {
    const result = formatChartCurrency(9999999.99, "en", "USD")
    expect(result).toBe("$10,000,000")
  })
})

describe("formatChartPercent", () => {
  // signDisplay: "exceptZero" shows + for positive, - for negative, nothing for zero
  it("formats 25 with en locale as +25%", () => {
    const result = formatChartPercent(25, "en")
    expect(result).toBe("+25%")
  })

  it("formats 25 with pt locale as +25%", () => {
    const result = formatChartPercent(25, "pt")
    expect(result).toBe("+25%")
  })

  it("formats zero as 0% (no sign)", () => {
    const result = formatChartPercent(0, "en")
    expect(result).toBe("0%")
  })

  it("formats negative value with minus sign", () => {
    const result = formatChartPercent(-10, "en")
    expect(result).toBe("-10%")
  })

  it("formats 100 as +100%", () => {
    const result = formatChartPercent(100, "en")
    expect(result).toBe("+100%")
  })

  it("formats 0.5 as +0.5%", () => {
    const result = formatChartPercent(0.5, "en")
    expect(result).toBe("+0.5%")
  })
})
