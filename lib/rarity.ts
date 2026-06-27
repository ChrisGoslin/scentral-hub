export type RarityLevel = 'undiscovered' | 'rare' | 'cult' | 'popular' | 'none'

export interface RarityBadge {
  level: RarityLevel
  label: string
  /** true when owner_count < 26 — shows Inspired By bridge on detail page */
  isRare: boolean
}

export function getRarityBadge(ownerCount: number | null | undefined): RarityBadge {
  const n = ownerCount ?? 0
  if (n === 0) return { level: 'undiscovered', label: '◆ Undiscovered', isRare: true }
  if (n <= 5)  return { level: 'rare',         label: `◆ Rare · ${n}`,  isRare: true }
  if (n <= 25) return { level: 'cult',         label: `◆ Cult · ${n}`,  isRare: true }
  if (n <= 100) return { level: 'popular',     label: `${n} members`,   isRare: false }
  return { level: 'none', label: '', isRare: false }
}
