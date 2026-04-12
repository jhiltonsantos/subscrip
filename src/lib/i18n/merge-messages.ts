/** Deep-merge message trees so nested keys (e.g. common) combine instead of replacing. */
export function mergeMessages(
  base: Record<string, unknown>,
  override: Record<string, unknown>
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...base }
  for (const [key, val] of Object.entries(override)) {
    const existing = out[key]
    if (
      val !== null &&
      typeof val === "object" &&
      !Array.isArray(val) &&
      existing !== null &&
      typeof existing === "object" &&
      !Array.isArray(existing)
    ) {
      out[key] = mergeMessages(
        existing as Record<string, unknown>,
        val as Record<string, unknown>
      )
    } else {
      out[key] = val
    }
  }
  return out
}
