// Filter configuration constants for Discover page

export const SORT_OPTIONS = ['A–Z', 'Top Rated', 'Newest', 'Most Popular'] as const
export type SortOption = typeof SORT_OPTIONS[number]

export const FEEL_FAMILIES: Record<string, string[]> = {
  'Light & Subtle': ['Floral', 'Chypre', 'Powdery', 'Musk', 'Fresh', 'Citrus', 'Green'],
  'Warm & Rich': ['Amber', 'Oriental', 'Woody Oriental', 'Oud', 'Gourmand', 'Resinous'],
  'Fresh & Clean': ['Citrus', 'Aquatic', 'Green', 'Fresh', 'Aromatic'],
  'Bold & Lasting': ['Leather', 'Tobacco', 'Smoky', 'Chypre', 'Woody'],
}

export const FEEL_PROJECTIONS: Record<string, string[]> = {
  'Warm & Rich': ['Strong', 'Moderate', 'Beast Mode'],
  'Fresh & Clean': ['Weak', 'Moderate', 'Medium'],
  'Bold & Lasting': ['Beast Mode', 'Strong', 'Moderate'],
  'Light & Subtle': ['Weak', 'Medium', 'Moderate'],
}

export const FEEL_AMBIENT: Record<string, { bgGlow: string; chipActive: string }> = {
  'Warm & Rich': { bgGlow: 'rgba(160, 98, 42, 0.06)', chipActive: '#A0622A' },
  'Fresh & Clean': { bgGlow: 'rgba(42, 130, 100, 0.06)', chipActive: '#2A8264' },
  'Bold & Lasting': { bgGlow: 'rgba(60, 40, 30, 0.08)', chipActive: '#3C281E' },
  'Light & Subtle': { bgGlow: 'rgba(140, 110, 180, 0.05)', chipActive: '#8C6EB4' },
}

export const LONGEVITY_PROJECTIONS: Record<string, string[]> = {
  'Lasts all day': ['Beast Mode', 'Strong'],
  'A few hours': ['Moderate', 'Medium'],
  'Quick burst': ['Weak'],
}

export const KNOWN_BRANDS = ['Lattafa', 'Afnan', 'Rasasi', 'Armaf', 'Swiss Arabian']

export const VIBE_TO_FEEL: Record<string, string> = {
  warm: 'Warm & Rich',
  fresh: 'Fresh & Clean',
  bold: 'Bold & Lasting',
  soft: 'Light & Subtle',
}

// Maps persona's preferred families to the closest FEEL chip key
export function familyToFeel(families: string[]): string | null {
  const familySet = new Set(families)
  if (['Leather', 'Tobacco', 'Smoky', 'Resinous', 'Oud'].some(f => familySet.has(f)))
    return 'Bold & Lasting'
  if (['Amber', 'Oriental', 'Woody Oriental', 'Gourmand'].some(f => familySet.has(f)))
    return 'Warm & Rich'
  if (['Citrus', 'Aquatic', 'Green', 'Fresh Spicy', 'Floral', 'Fresh'].some(f =>
    familySet.has(f)
  ))
    return 'Fresh & Clean'
  return null
}
