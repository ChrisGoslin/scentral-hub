// Olfactory family → fallback gradient, used wherever a fragrance card has no
// image_url. Real `family` values are compound, free-text strings (e.g.
// "Fresh Aromatic", "Woody Spicy") — match by substring against a category
// list, and fall back to the default gradient if nothing hits.
// Colours are CSS custom properties (lib/design/tokens.css) per AGENTS.md's
// "no hardcoded hex" rule, not literal hex values.
const FAMILY_CATEGORIES: { keywords: string[]; gradient: string }[] = [
  {
    keywords: ['floral'],
    gradient: 'linear-gradient(135deg, var(--family-floral-start) 0%, var(--family-floral-end) 100%)',
  },
  {
    keywords: ['fresh', 'aqua', 'marine', 'citrus'],
    gradient: 'linear-gradient(135deg, var(--family-fresh-start) 0%, var(--family-fresh-end) 100%)',
  },
  {
    keywords: ['woody'],
    gradient: 'linear-gradient(135deg, var(--family-woody-start) 0%, var(--family-woody-end) 100%)',
  },
  {
    keywords: ['oriental', 'amber', 'spicy'],
    gradient: 'linear-gradient(135deg, var(--family-oriental-start) 0%, var(--family-oriental-end) 100%)',
  },
  {
    keywords: ['fougere', 'aromatic'],
    gradient: 'linear-gradient(135deg, var(--family-fougere-start) 0%, var(--family-fougere-end) 100%)',
  },
  {
    keywords: ['musk', 'powder'],
    gradient: 'linear-gradient(135deg, var(--family-musk-start) 0%, var(--family-musk-end) 100%)',
  },
  {
    keywords: ['green', 'herbal'],
    gradient: 'linear-gradient(135deg, var(--family-green-start) 0%, var(--family-green-end) 100%)',
  },
  {
    keywords: ['gourmand', 'sweet'],
    gradient: 'linear-gradient(135deg, var(--family-gourmand-start) 0%, var(--family-gourmand-end) 100%)',
  },
  {
    keywords: ['oud'],
    gradient: 'linear-gradient(135deg, var(--family-oud-start) 0%, var(--family-oud-end) 100%)',
  },
]

const DEFAULT_GRADIENT = 'linear-gradient(135deg, var(--family-default-start) 0%, var(--family-default-end) 100%)'

export function getFamilyGradient(family: string | null): string {
  if (!family) return DEFAULT_GRADIENT
  const lower = family.toLowerCase()
  for (const category of FAMILY_CATEGORIES) {
    if (category.keywords.some(keyword => lower.includes(keyword))) {
      return category.gradient
    }
  }
  return DEFAULT_GRADIENT
}
