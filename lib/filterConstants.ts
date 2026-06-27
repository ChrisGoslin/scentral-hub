// Filter configuration constants for Discover page

export const SORT_OPTIONS = ['A–Z', 'Top Rated', 'Newest', 'Most Popular', '◆ Rare', '⚗ Unusual'] as const
export type SortOption = typeof SORT_OPTIONS[number]

export const LONGEVITY_PROJECTIONS: Record<string, string[]> = {
  'Lasts all day': ['Beast Mode', 'Strong'],
  'A few hours': ['Moderate', 'Medium'],
  'Quick burst': ['Weak'],
}

// Granular vibe tags — matched against the `family` column (e.g. "Amber Woody Floral")
// via case-insensitive substring. Verified against live `fragrances.family` values.
export const VIBE_TAGS: Record<string, string[]> = {
  Woody: ['Woody'],
  Floral: ['Floral'],
  Oudy: ['Oud'],
  Fresh: ['Fresh', 'Aquatic'],
  Amber: ['Amber'],
  Aromatic: ['Aromatic'],
  Citrus: ['Citrus'],
  Green: ['Green'],
  Fruity: ['Fruity'],
}

// Occasion tags — matched against the free-text `use_case` column via substring.
// Derived from real `use_case` values (it's a comma-separated free-text field, not an enum).
export const OCCASION_TAGS: Record<string, string[]> = {
  Office: ['Office'],
  'Date Night': ['Date'],
  Evening: ['Evening'],
  Casual: ['Casual'],
  Formal: ['Formal'],
  Gym: ['Gym'],
  'Summer & Beach': ['Summer', 'Beach'],
  'Night Out': ['Night Out', 'Clubbing'],
  'Special Occasion': ['Special Occasion'],
  Winter: ['Winter', 'Cold Weather'],
}

export function matchesAnyTag(value: string | null | undefined, keywords: string[]): boolean {
  if (!value) return false
  const lower = value.toLowerCase()
  return keywords.some(k => lower.includes(k.toLowerCase()))
}

// Top houses by catalogue count (verified against live `fragrances.brand`). Anything
// outside this list is bucketed under "Niche" in the House carousel.
export const KNOWN_BRANDS = [
  'Lattafa',
  'Armaf',
  'Afnan',
  'Creed',
  'Khadlaj',
  'Rasasi',
  'Tom Ford',
  'Parfums de Marly',
  'Amouage',
  'Christian Dior',
  'Yves Saint Laurent',
  'Swiss Arabian',
]

// Maps a persona's preferred families to the closest VIBE_TAGS keys, for pre-selecting
// vibe chips when a persona is active.
export function familyToVibeTags(families: string[]): string[] {
  const tags = new Set<string>()
  for (const fam of families) {
    for (const [tag, keywords] of Object.entries(VIBE_TAGS)) {
      if (matchesAnyTag(fam, keywords)) tags.add(tag)
    }
  }
  return Array.from(tags)
}
