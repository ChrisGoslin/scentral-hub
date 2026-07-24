// Claude sometimes wraps JSON responses in a ```json ... ``` fence even when
// asked not to — strip it before parsing instead of letting JSON.parse throw.
export function parseVerdict(text: string): { pros: string[]; cons: string[] } | null {
  const stripped = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim()
  try {
    const parsed = JSON.parse(stripped)
    if (
      Array.isArray(parsed?.pros) &&
      parsed.pros.every((value: unknown) => typeof value === 'string') &&
      Array.isArray(parsed?.cons) &&
      parsed.cons.every((value: unknown) => typeof value === 'string')
    ) {
      // Reject empty verdicts
      if (parsed.pros.length === 0 && parsed.cons.length === 0) {
        return null
      }
      return { pros: parsed.pros, cons: parsed.cons }
    }
    return null
  } catch {
    return null
  }
}
