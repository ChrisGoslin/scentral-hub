// Olfactory family → fallback gradient, used wherever a fragrance card has no
// image_url. Real `family` values are compound, space-separated strings
// (e.g. "Fresh Aromatic", "Woody Spicy") — match on any word, not the whole
// string, and fall back to woody if nothing hits.
export const FAMILY_GRADIENTS: Record<string, string> = {
  woody: 'linear-gradient(135deg, #5c4033 0%, #8d7662 100%)',
  amber: 'linear-gradient(135deg, #c49a3c 0%, #a67c52 100%)',
  oriental: 'linear-gradient(135deg, #c49a3c 0%, #a67c52 100%)',
  fresh: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
  gourmand: 'linear-gradient(135deg, #d4a373 0%, #8b6f47 100%)',
  floral: 'linear-gradient(135deg, #e8b4d4 0%, #c67c98 100%)',
  aquatic: 'linear-gradient(135deg, #87ceeb 0%, #4a90e2 100%)',
  marine: 'linear-gradient(135deg, #87ceeb 0%, #4a90e2 100%)',
}

export function getFamilyGradient(family: string): string {
  const words = family.toLowerCase().split(/\s+/)
  for (const word of words) {
    if (FAMILY_GRADIENTS[word]) return FAMILY_GRADIENTS[word]
  }
  return FAMILY_GRADIENTS.woody
}
