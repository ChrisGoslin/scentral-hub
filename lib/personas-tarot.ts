/**
 * Tarot of Scent — Sommelier Archetypes & Reading Engine
 * Maps enigmatic sensory inquiries to luxury fragrance archetypes
 * and delivers evocative, poetic tarot readings.
 */

export interface TarotCard {
  id: string
  arcanaNumber: string // e.g. "0I", "0IV", "VII"
  title: string
  subtitle: string
  sommelierArchetype: string
  element: 'Aether' | 'Earth' | 'Flora' | 'Smoke' | 'Water' | 'Solar'
  palette: {
    primary: string
    accent: string
    border: string
    glow: string
  }
  tarotNarrative: {
    reading: string
    shadowTrait: string
    olfactoryDestiny: string
  }
  signatureAccords: {
    top: string[]
    heart: string[]
    base: string[]
  }
  categoryAffinities: string[]
  idealLayeringAdvice: string
  vanityScanPrompt: string
}

export const TAROT_SOMMELIER_DECK: Record<string, TarotCard> = {
  velvet_intellectual: {
    id: 'velvet_intellectual',
    arcanaNumber: 'IX',
    title: 'The Scribe in Shadows',
    subtitle: 'The Velvet Intellectual',
    sommelierArchetype: 'The Curatorial Archivist',
    element: 'Earth',
    palette: {
      primary: '#1A120B',
      accent: '#D4AF37',
      border: 'rgba(212, 175, 55, 0.4)',
      glow: 'rgba(212, 175, 55, 0.15)',
    },
    tarotNarrative: {
      reading: 'You collect atmosphere the way others hoard memories. Your presence does not roar into a room; it seeps in quietly, lingering in the margins of conversation long after the lights dim.',
      shadowTrait: 'Impatience with synthetic loud mists and fleeting micro-trends.',
      olfactoryDestiny: 'A wardrobe built around dry papyrus, ancient cedar book spines, bitter black tea, and intimate amber.',
    },
    signatureAccords: {
      top: ['Bergamot', 'Smoked Black Tea'],
      heart: ['Iris Root', 'Tobacco Leaf', 'Parchment'],
      base: ['Cedarwood', 'Bourbon Amber', 'Vanilla Pod'],
    },
    categoryAffinities: ['Woody & Dry Woods', 'Smoky & Leather', 'Amber & Oriental'],
    idealLayeringAdvice: 'Anchor with aged cedar, then dust wrists with a crisp black tea modifier.',
    vanityScanPrompt: 'Photograph your desk or bookshelf vanity to calculate your precise woody-to-resin ratio.',
  },
  midnight_alchemist: {
    id: 'midnight_alchemist',
    arcanaNumber: 'XIII',
    title: 'The Nocturnal Alembic',
    subtitle: 'The Midnight Alchemist',
    sommelierArchetype: 'The Occult Master of Sillage',
    element: 'Smoke',
    palette: {
      primary: '#0B0B12',
      accent: '#9D4EDD',
      border: 'rgba(157, 78, 221, 0.4)',
      glow: 'rgba(157, 78, 221, 0.2)',
    },
    tarotNarrative: {
      reading: 'You operate when the sun yields to cobalt skies. You view fragrance not as an accessory, but as an invisible armor forged from rare resins, dark oud, and intoxicating nocturnal petals.',
      shadowTrait: 'A tendency to overwhelm uninitiated noses with unapologetic sillage.',
      olfactoryDestiny: 'A hypnotic aura of Cambodian oud, burning frankincense, dark plum, and velvet leather.',
    },
    signatureAccords: {
      top: ['Saffron', 'Black Plum', 'Cardamom'],
      heart: ['Midnight Rose', 'Olibanum', 'Leather'],
      base: ['Dark Agarwood (Oud)', 'Birch Tar', 'Castoreum Accord'],
    },
    categoryAffinities: ['Oud & Resins', 'Leather & Smoke', 'Nocturnal & Date Night'],
    idealLayeringAdvice: 'Use one drop of pure oud oil on pulse points, veiled by a sheer smoky incense spray.',
    vanityScanPrompt: 'Take a photo of your evening tray to isolate rare vintage and dark resin concentrations.',
  },
  solar_minimalist: {
    id: 'solar_minimalist',
    arcanaNumber: 'XIX',
    title: 'The Glass Prism',
    subtitle: 'The Solar Minimalist',
    sommelierArchetype: 'The Architect of Light',
    element: 'Solar',
    palette: {
      primary: '#0F1715',
      accent: '#2EC4B6',
      border: 'rgba(46, 196, 182, 0.4)',
      glow: 'rgba(46, 196, 182, 0.15)',
    },
    tarotNarrative: {
      reading: 'Purity over excess. Precision over clutter. Your fragrance is crisp punctuation at the end of a sharp sentence — clean linen, sun-drenched citrus groves, and crystalline cedar.',
      shadowTrait: 'Fatigue from overly sweet gourmands and heavy animalic notes.',
      olfactoryDestiny: 'Effortless projection of Italian neroli, green fig leaves, marine sea salt, and sheer white musks.',
    },
    signatureAccords: {
      top: ['Bitter Orange', 'Neroli', 'Pink Grapefruit'],
      heart: ['Green Fig Leaf', 'Orange Blossom', 'Hedione'],
      base: ['Ambrox', 'White Cedar', 'Clean Cotton Musk'],
    },
    categoryAffinities: ['Freshies & Citrus', 'Aquatic & Ozonic', 'Office & Daily Signatures'],
    idealLayeringAdvice: 'Spray citrus over forearms and anchor with skin-scent Ambroxan for 10-hour clean projection.',
    vanityScanPrompt: 'Snap a photo of your daily vanity to track your fresh-to-aromatic replenishment cycle.',
  }
}

export interface TarotAnswers {
  sanctuary: 'archive' | 'greenhouse' | 'midnight_streets' | 'spice_bazaar'
  projection: 'intimate_whisper' | 'confident_punctuation' | 'intoxicating_mystery'
  anchor: 'paper_cedar' | 'citrus_neroli' | 'amber_smoke' | 'marine_salt'
}

/**
 * Calculates Sommelier Tarot Archetype from sensory divination choices.
 */
export function divineTarotPersona(answers: TarotAnswers): TarotCard {
  if (answers.sanctuary === 'midnight_streets' || answers.projection === 'intoxicating_mystery') {
    return TAROT_SOMMELIER_DECK.midnight_alchemist
  }
  if (answers.sanctuary === 'greenhouse' || answers.projection === 'confident_punctuation' || answers.anchor === 'citrus_neroli') {
    return TAROT_SOMMELIER_DECK.solar_minimalist
  }
  return TAROT_SOMMELIER_DECK.velvet_intellectual
}
