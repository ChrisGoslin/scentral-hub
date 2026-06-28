import { getPersonaById, PERSONAS, type Persona } from '@/lib/personas'

export type IdentityScore = {
  topPersona: Persona
  topPercent: number
  secondPersona: Persona
  secondPercent: number
  collectionCount: number
}

// Maps a collection of families to the persona distribution
export function calculateIdentityScore(families: string[]): IdentityScore | null {
  if (families.length === 0) return null

  const scores = new Map<string, number>()
  PERSONAS.forEach(p => scores.set(p.id, 0))

  families.forEach(family => {
    let bestMatch: string | null = null
    let maxMatch = 0

    PERSONAS.forEach(p => {
      // Very naive scoring — if family matches a preferred family, give it a point.
      // In reality, this would be a more sophisticated semantic match.
      const match = p.recommendations.preferred_families.some(pf => 
        family.toLowerCase().includes(pf.toLowerCase()) || pf.toLowerCase().includes(family.toLowerCase())
      ) ? 1 : 0
      
      if (match > maxMatch) {
        maxMatch = match
        bestMatch = p.id
      }
    })

    if (bestMatch) {
      scores.set(bestMatch, scores.get(bestMatch)! + 1)
    }
  })

  // Sort personas by score descending
  const sorted = Array.from(scores.entries())
    .sort((a, b) => b[1] - a[1])
    .filter(entry => entry[1] > 0)

  if (sorted.length === 0) return null

  const totalScored = sorted.reduce((sum, entry) => sum + entry[1], 0)
  
  const topPersonaId = sorted[0][0]
  const topPercent = Math.round((sorted[0][1] / totalScored) * 100)
  
  const secondPersonaId = sorted.length > 1 ? sorted[1][0] : sorted[0][0]
  const secondPercent = sorted.length > 1 ? Math.round((sorted[1][1] / totalScored) * 100) : 0

  return {
    topPersona: getPersonaById(topPersonaId)!,
    topPercent,
    secondPersona: getPersonaById(secondPersonaId)!,
    secondPercent,
    collectionCount: families.length
  }
}
