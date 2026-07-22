import { describe, expect, it } from "vitest"
import { cn } from "./helpers"

describe("cn", () => {
  it("returns empty string for no arguments", () => {
    expect(cn()).toBe("")
  })

  it("returns empty string for all falsy values", () => {
    expect(cn(null, undefined, false, "", 0 as unknown as string)).toBe("")
  })

  it("merges simple class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar")
  })

  it("handles conditional objects (truthy keys included, falsy excluded)", () => {
    expect(cn("base", { hidden: true, visible: false })).toBe("base hidden")
  })

  it("handles arrays of class names", () => {
    expect(cn(["a", "b"], "c")).toBe("a b c")
  })

  it("resolves Tailwind padding conflict via twMerge", () => {
    // twMerge resolves `px-4 p-2` → `p-2` wins since p-2 covers all padding
    const result = cn("px-4", "p-2")
    expect(result).toBe("p-2")
  })

  it("resolves conflicting margin classes via twMerge", () => {
    const result = cn("mx-4", "my-2", "m-4")
    expect(result).toBe("m-4")
  })

  it("resolves color conflict retaining last meaningful class", () => {
    const result = cn("text-red-500", "text-blue-700")
    expect(result).toBe("text-blue-700")
  })

  it("handles mixed inputs: strings, objects, arrays, and falsy values", () => {
    const result = cn(
      "btn",
      "btn-primary",
      { "is-active": true, disabled: false },
      ["extra", null, "class"],
      undefined,
      false,
    )
    expect(result).toBe("btn btn-primary is-active extra class")
  })
})
