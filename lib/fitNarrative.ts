import { type Persona } from './personas'

export type FitLevel = 'signature' | 'explore' | 'contrast'

interface FitResult {
  level: FitLevel
  chip: string
  narrative: string
  inspired_by_cue: boolean
}

export function getFitNarrative(
  family: string | null,
  fragrance_name: string,
  persona: Persona | null
): FitResult {
  if (!family || !persona) return {
    level: 'explore', chip: '◇ Worth exploring',
    narrative: 'Something new for your collection.', inspired_by_cue: false,
  }

  const preferred = persona.recommendations.preferred_families.map(f => f.toLowerCase())
  const avoid = persona.recommendations.avoid_families?.map(f => f.toLowerCase()) ?? []
  const f = family.toLowerCase()
  const isPreferred = preferred.some(p => f.includes(p) || p.includes(f))
  const isAvoid = avoid.some(a => f.includes(a) || a.includes(f))

  const SIGNATURE: Record<string, string> = {
    velvet_intellectual: `${fragrance_name} belongs in your archive.`,
    solar_minimalist: `${fragrance_name} is made for how you move.`,
    dark_alchemist: `${fragrance_name} is exactly the kind of thing you'd wear.`,
    ritual_keeper: `${fragrance_name} was made for intentional mornings.`,
    rebel_experimentalist: `${fragrance_name} is the kind of thing most people walk past. You'd reach for it.`,
    comfort_seeker: `${fragrance_name} is what comfort smells like.`,
  }

  const CONTRAST: Record<string, string> = {
    velvet_intellectual: `Not your usual register — which might be exactly why it's interesting.`,
    solar_minimalist: `A departure from your clean lines. For when you want to shift gears.`,
    dark_alchemist: `Lighter than your usual. Sometimes the contrast is the point.`,
    ritual_keeper: `Outside your practice. Worth one deliberate wear.`,
    rebel_experimentalist: `Actually, too safe for you. Unless you're wearing it ironically.`,
    comfort_seeker: `Bolder than your usual warmth. For a day when you want to be noticed.`,
  }

  if (isPreferred) return {
    level: 'signature', chip: '◆ Matches your pattern',
    narrative: SIGNATURE[persona.id] ?? `${fragrance_name} suits your identity.`,
    inspired_by_cue: true,
  }
  if (isAvoid) return {
    level: 'contrast', chip: '○ Outside your usual',
    narrative: CONTRAST[persona.id] ?? `Outside your usual range.`,
    inspired_by_cue: false,
  }
  return { level: 'explore', chip: '◇ Worth exploring', narrative: `A different direction for your collection.`, inspired_by_cue: false }
}
