// Aura — rules-based daily Spritz Schedule generator (Epic 4).
// No external LLM call: template copy in the Aura voice, deterministic given the same inputs.

export type SpritzSlot = 'morning' | 'midday' | 'evening'

export interface SpritzFragrance {
  id: string
  brand: string
  name: string
  family?: string | null
  projection?: string | null
  application_zone?: string | null
  spritz_count?: string | null
  anosmia_risk?: string | null
  lean?: string | null
}

export interface SpritzEvent {
  slot: SpritzSlot
  etaLabel: string
  fragrance: SpritzFragrance
  sprays: number
  pulsePoints: string[]
  copy: string
}

const SLOT_META: Record<SpritzSlot, { etaLabel: string; defaultZones: string[] }> = {
  morning: { etaLabel: 'Now', defaultZones: ['neck', 'wrists'] },
  midday: { etaLabel: 'In 4h', defaultZones: ['wrists', 'chest'] },
  evening: { etaLabel: 'This evening', defaultZones: ['neck', 'chest'] },
}

// Heuristic spray count when fragrances.spritz_count is null/unparseable.
const PROJECTION_SPRAYS: Record<string, number> = {
  'Beast Mode': 2,
  Strong: 3,
  Moderate: 3,
  Medium: 4,
  Weak: 5,
}

function resolveSprays(f: SpritzFragrance): number {
  const parsed = f.spritz_count ? parseInt(f.spritz_count, 10) : NaN
  if (Number.isFinite(parsed) && parsed > 0) return parsed
  return PROJECTION_SPRAYS[f.projection ?? ''] ?? 3
}

function resolveZones(f: SpritzFragrance, slot: SpritzSlot): string[] {
  if (f.application_zone) {
    return f.application_zone
      .split(/[,/]/)
      .map(z => z.trim().toLowerCase())
      .filter(Boolean)
  }
  return SLOT_META[slot].defaultZones
}

function copyFor(slot: SpritzSlot, f: SpritzFragrance, sprays: number): string {
  const name = `${f.brand} ${f.name}`
  switch (slot) {
    case 'morning':
      return `${sprays} sprays of ${name} to start the day on your terms.`
    case 'midday':
      return `In four hours, refresh with ${name} — let it carry you through the afternoon.`
    case 'evening':
      return `For tonight, ${name} waits at the edge of evening.`
  }
}

/**
 * Builds a 3-event Morning/Midday/Evening schedule from a pool of fragrances.
 * Picks up to 3 distinct fragrances, preferring family variety; if the pool has
 * fewer than 3, fragrances repeat rather than the schedule failing.
 */
export function generateSpritzSchedule(pool: SpritzFragrance[]): SpritzEvent[] {
  const slots: SpritzSlot[] = ['morning', 'midday', 'evening']
  if (pool.length === 0) return []

  const seenFamilies = new Set<string>()
  const ordered: SpritzFragrance[] = []

  for (const f of pool) {
    const fam = f.family ?? ''
    if (!seenFamilies.has(fam) || ordered.length === 0) {
      seenFamilies.add(fam)
      ordered.push(f)
    }
    if (ordered.length === 3) break
  }
  while (ordered.length < 3) {
    ordered.push(pool[ordered.length % pool.length])
  }

  return slots.map((slot, i) => {
    const fragrance = ordered[i]
    const sprays = resolveSprays(fragrance)
    return {
      slot,
      etaLabel: SLOT_META[slot].etaLabel,
      fragrance,
      sprays,
      pulsePoints: resolveZones(fragrance, slot),
      copy: copyFor(slot, fragrance, sprays),
    }
  })
}
