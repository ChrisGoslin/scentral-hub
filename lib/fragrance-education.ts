/**
 * Scentral Fragrance Education Library
 * Static data dictionaries for fun facts, layering rules, and persona tips.
 */

export const FRAGRANCE_FUN_FACTS: Record<string, string[]> = {
  'Floral': [
    "It takes roughly 60,000 rose blossoms to produce just one ounce of rose essential oil.",
    "Jasmine is often picked at night when its scent is most potent.",
    "The world's most expensive floral oil is Orris, derived from the root of the Iris flower."
  ],
  'Citrus': [
    "Citrus notes are the most volatile in perfumery, usually lasting only 15-30 minutes.",
    "Bergamot, a key citrus note, is a non-edible orange grown almost exclusively in Italy.",
    "Cold-pressing the peel is the traditional way to extract citrus oils."
  ],
  'Woody': [
    "Sandalwood trees must be at least 15 years old before they can be harvested for oil.",
    "Cedarwood was one of the first ingredients used in ancient perfumery.",
    "Vetiver is a grass, but its roots produce one of the deepest woody scents in nature."
  ],
  'Amber': [
    "The 'Amber' accord is a fantasy note, usually created from labdanum, benzoin, and vanilla.",
    "Ambergris, once used in luxury scents, is a substance produced by sperm whales.",
    "Resins like Frankincense have been used in scent rituals for over 5,000 years."
  ],
  'Oriental': [
    "Oriental fragrances are known for their warmth and sensuality, often featuring spices and resins.",
    "Vanilla is the second most expensive spice in the world, after saffron.",
    "The first modern 'Oriental' perfume was Guerlain's Shalimar, released in 1925."
  ],
  'Fresh': [
    "The smell of 'fresh rain' is actually called Petrichor, caused by soil bacteria.",
    "Marine notes were popularized in the 1990s using a synthetic molecule called Calone.",
    "Aldehydes, which give a 'sparkling' fresh quality, were made famous by Chanel No. 5."
  ],
  'Aromatic': [
    "Lavender was used by Roman soldiers to scent their bathwater.",
    "Rosemary is believed to improve memory and concentration when inhaled.",
    "Sage and Thyme are 'fougere' staples, giving a clean, barbershop quality to scents."
  ]
}

export interface LayeringRule {
  text: string
  type: 'DO' | 'DONT'
}

export const LAYERING_DOS_AND_DONTS: LayeringRule[] = [
  { text: "Apply the heavier, more intense scent first as your 'anchor'.", type: 'DO' },
  { text: "Spray your lighter scent on top to let it sparkle and project.", type: 'DO' },
  { text: "Stick to two scents initially. Three or more can become muddy.", type: 'DO' },
  { text: "Layer a simple 'soliflore' (single note) over a complex base.", type: 'DO' },
  { text: "Wait 30 seconds between sprays to let the first layer settle.", type: 'DO' },
  { text: "Don't rub your wrists together — it 'bruises' the delicate top notes.", type: 'DONT' },
  { text: "Don't layer two heavy 'beast mode' fragrances together.", type: 'DONT' },
  { text: "Don't mix two scents that both have very high complexity.", type: 'DONT' },
  { text: "Don't forget that your skin chemistry changes how layers react.", type: 'DONT' },
  { text: "Don't spray more than usual just because you're layering.", type: 'DONT' }
]

export const PERSONA_TIPS: Record<string, string[]> = {
  'velvet_intellectual': [
    "Your DNA leans intimate — look for fragrances labeled 'moderate' or 'soft' projection.",
    "Oud and leather are your natural territory; iris on mahogany is a signature move.",
    "Try the 'pyramid layer': a single citrus spray at the neck over a woody base."
  ],
  'solar_minimalist': [
    "Your strength is clarity. Look for 'transparent', 'aquatic', or 'green' notes.",
    "In hot weather, start with half your usual spray count and build up.",
    "The best layer for you is almost always a white musk base + a citrus top."
  ],
  'dark_alchemist': [
    "Bold and polarising is your edge. Look for smoky incense and dark resins.",
    "Layer a smoky oud over a leather base for projection that lasts past midnight.",
    "A drop of rose absolute on the wrist softens the aggression without losing the edge."
  ]
}
