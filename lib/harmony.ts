/**
 * Harmony Scoring Engine
 * Calculates harmony % between fragrances based on similarity score.
 * Integrated with AURA results for layering suggestions.
 */

export type HarmonyLevel = 'Exceptional' | 'Strong' | 'Moderate' | 'Weak' | 'Poor'

/**
 * Calculate harmony level badge color based on percentage score.
 * @param score - Harmony score (0-100)
 * @returns CSS color variable name
 */
export function getHarmonyColor(score: number): string {
  if (score >= 80) return 'var(--accent)'
  if (score >= 60) return 'var(--text)'
  return 'var(--text-muted)'
}

/**
 * Get harmony level label from score.
 * @param score - Harmony score (0-100)
 * @returns Human-readable level
 */
export function getHarmonyLevel(score: number): HarmonyLevel {
  if (score >= 85) return 'Exceptional'
  if (score >= 70) return 'Strong'
  if (score >= 55) return 'Moderate'
  if (score >= 40) return 'Weak'
  return 'Poor'
}

/**
 * Normalize similarity score from API to 0-100 range.
 * API returns normalized decimal (0-1), we display as percentage.
 * @param rawScore - API similarity score (typically 0.6-0.9)
 * @returns Displayed percentage (0-100)
 */
export function normalizeHarmonyScore(rawScore: number | undefined): number {
  if (!rawScore) return 0
  // Ensure value is between 0 and 1, then multiply by 100
  const clamped = Math.max(0, Math.min(1, rawScore))
  return Math.round(clamped * 100)
}

/**
 * Filter results by minimum harmony threshold.
 * Used to hide low-compatibility suggestions.
 * @param threshold - Minimum harmony % (0-100)
 * @returns Filter function
 */
export function createHarmonyFilter(threshold: number = 50) {
  return (item: { similarity_score?: number; harmony_pct?: number }) => {
    const score = item.harmony_pct ?? normalizeHarmonyScore(item.similarity_score)
    return score >= threshold
  }
}

/**
 * Sort results by harmony score (descending).
 * Primary sort for layering suggestions.
 * @param a - First result
 * @param b - Second result
 * @returns Sort order
 */
export function sortByHarmony(
  a: { similarity_score?: number; harmony_pct?: number },
  b: { similarity_score?: number; harmony_pct?: number }
): number {
  const scoreA = a.harmony_pct ?? normalizeHarmonyScore(a.similarity_score)
  const scoreB = b.harmony_pct ?? normalizeHarmonyScore(b.similarity_score)
  return scoreB - scoreA
}
