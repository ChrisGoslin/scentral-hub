/**
 * nota. Fragrance Education Library
 * Static data dictionaries for fun facts, layering rules, and persona tips.
 * Content sourced from LAUNCH_PLAN.md (verified 2026-06-21)
 */

export const FRAGRANCE_FUN_FACTS: Record<string, string[]> = {
  'Oud': [
    "Real oud comes from infected agarwood trees — only 2% of wild trees produce it naturally. That's why it costs more per gram than gold.",
    "Oud has been traded in the Middle East for over 3,000 years. Ancient Egyptians burned it in temples. Your bottle carries that lineage.",
    "A single kilo of pure oud oil can cost between £30,000 and £100,000. Most 'oud' fragrances use synthetic reconstructions — which is fine. Just interesting.",
  ],
  'Amber': [
    "Amber in fragrance isn't the fossilised tree resin you're thinking of. It's a blend — usually labdanum, benzoin, and vanilla — that recreates a warm, resinous feel.",
    "What we call 'amber' in perfumery was popularised in the 1920s as 'Oriental' — a catch-all for warm, exotic, resinous compositions. The modern term just sounds less dated.",
    "Ambergris — old-school 'amber' — is a waxy substance produced in sperm whale intestines. Worth over £30/gram. It's now banned in many countries, and most ambergris notes are synthetic.",
  ],
  'Floral': [
    "It takes roughly 8 million hand-picked jasmine flowers to produce 1 kilo of absolute. That's why real jasmine in fragrance is expensive and most uses a synthetic surrogate.",
    "Rose absolute and rose otto are completely different things. Absolute is solvent-extracted, dense, and very true. Otto is steam-distilled, lighter, and greener. Both are expensive. Both smell incredible.",
    "Ylang ylang is one of the most versatile floral materials in perfumery — it appears in everything from Chanel No. 5 to masculine leathers. It smells different depending on what surrounds it.",
  ],
  'Woody': [
    "Sandalwood from Mysore, India is some of the most expensive wood in the world — heavily regulated due to near-extinction. Most sandalwood in fragrance today is Australian or synthetic (Javanol, Polysantol).",
    "Vetiver roots grow downward, not outward. The deeper the roots, the richer the oil. Haitian vetiver is smoky; Indian vetiver is earthier; Javanese vetiver is cleaner. Same plant, very different results.",
    "Cedar in fragrance is almost always Virginia cedarwood — a juniper, technically, not a true cedar. Real Atlas cedar (from Morocco) smells significantly different: drier, greener, more pencil-shaving.",
  ],
  'Fresh': [
    "Aquatic notes don't exist in nature. 'Calone', the molecule behind sea-spray scents, was discovered by accident in the 1960s. Issey Miyake's L'Eau d'Issey (1992) launched a category.",
    "Citrus top notes are the most volatile molecules in a fragrance — they evaporate within 15–30 minutes on most skin. Citrus EDPs anchor them with heavier molecules to make them last.",
    "Clean cotton scents use a molecule called 'Galaxolide' — a synthetic musk originally used in laundry detergent. You were already wearing it before perfumery got to it.",
  ],
  'Gourmand': [
    "Vanilla in perfumery comes primarily from vanillin — either natural (from vanilla pods) or synthetic (from lignin). You almost certainly cannot tell the difference, and neither can most noses.",
    "The original gourmand fragrance was Angel by Thierry Mugler (1992) — it was the first mainstream commercial use of ethyl maltol (the molecule that smells like candy floss) in a fine fragrance. It was nearly rejected by every focus group.",
    "Caramel notes in fragrance use the same molecules that form when you heat sugar: furans and maltol. The molecule responsible for 'cotton candy' smell is ethyl maltol — about 6x sweeter-smelling than natural maltol.",
  ],
  'Tobacco': [
    "Tobacco in fragrance is typically reconstructed from molecules like isovaleric acid and tobacco absolute. Actual dried tobacco smells very different from 'tobacco' in perfumery — it's been romanticised.",
    "Most tobacco-forward fragrances are actually built on benzyl benzoate and coumarin (from tonka bean) — they create that slightly sweet, burnt-sugar, aromatic dryness without needing actual tobacco.",
    "The tobacco note in fragrance really took off in the 1970s Aromatic Fougères movement — fragrances like Yves Saint Laurent Pour Homme used it to create something between clean herbs and masculine warmth.",
  ],
  'default': [
    "The first synthetic fragrance ingredient was coumarin, discovered in 1868. Before that, all perfumes used raw natural materials. Synthesis opened modern perfumery.",
    "Perfumers typically evaluate up to 400 ingredients when creating a formula. A simple fragrance might use 40–60 materials. A complex one can use over 100.",
    "Fragrance molecules are measured in parts per million. A 1% concentration in a formula can still be the defining character of an entire perfume.",
  ]
}

export interface LayeringRule {
  type: 'do' | 'dont'
  title: string
  body: string
}

export const LAYERING_DOS_AND_DONTS: LayeringRule[] = [
  { type: 'do', title: 'Layer light before heavy',
    body: 'Apply your lighter, more transparent fragrance first. Let it settle for 2–3 minutes, then layer the denser one on top. The lighter note opens the space; the heavier one anchors it.' },
  { type: 'do', title: 'Use one anchor, one accent',
    body: 'Your "anchor" fragrance does the heavy lifting (projection, longevity, base). Your "accent" adds the character (top notes, freshness, surprise). Two anchors fight each other. Two accents disappear together.' },
  { type: 'do', title: 'Apply to pulse points, not clothes',
    body: 'Skin warmth is what activates fragrance. The inside of your wrists, neck, and inner elbows. Clothes trap fragrance differently — it often reads as stale rather than rich.' },
  { type: 'do', title: 'Try the combination on skin before committing',
    body: 'Paper strips lie. Combinations that smell odd on paper often bloom on skin. If you can, do a quick wrist test before deciding a layer doesn\'t work.' },
  { type: 'do', title: 'Match projection levels when layering',
    body: 'Combining an intimate projection fragrance with a crowd-filling beast creates an unbalanced mess. Match your layers: intimate+intimate, room+room, or intentionally use a light top over a strong base.' },
  { type: 'do', title: 'Let your base macerate before judging it',
    body: 'Give freshly opened bottles 2–4 weeks of regular exposure to air before forming a firm opinion. The top notes settle, the alcohol sharpness fades, and the true character emerges.' },
  { type: 'dont', title: 'Don\'t rub your wrists together',
    body: 'Rubbing breaks the molecular structure of the top notes and bruises the accord. You\'re literally destroying the opening. Press, don\'t rub.' },
  { type: 'dont', title: 'Don\'t mix two dominant bases',
    body: 'Two heavy oud or two thick amber fragrances worn together create a wall — not a composition. One should dominate; the other should accent.' },
  { type: 'dont', title: 'Don\'t spray then immediately judge',
    body: 'The first 5 minutes are the most volatile — mostly alcohol and sharp top notes. Wait 15–20 minutes for the true accord to form before deciding if you like a fragrance.' },
  { type: 'dont', title: 'Don\'t store bottles in the bathroom',
    body: 'Humidity and heat degrade fragrance quickly. A cool, dark shelf or drawer is ideal. Direct sunlight turns fragrance flat and sometimes sour within months.' },
  { type: 'dont', title: 'Don\'t apply fragrance directly to broken or sensitive skin',
    body: 'Fragrance molecules can cause reactions on broken skin. If you have eczema or sensitivity, spray on clothes at distance, or pulse points that are fully intact.' },
  { type: 'dont', title: 'Don\'t layer more than 2–3 fragrances at once',
    body: 'Three is already advanced territory. Beyond three, you lose legibility — the composition becomes undefined noise rather than a coherent statement.' },
]

export const PERSONA_TIPS: Record<string, string[]> = {
  'velvet_intellectual': [
    "Your DNA leans intimate — look for fragrances labelled 'moderate' or 'soft' projection. You want to be discovered, not announced.",
    "Oud and leather are your natural territory, but don't sleep on florals anchored in dark woods. Iris on mahogany is a Velvet Intellectual signature.",
    "For evening wear, try the 'pyramid layer' — a single citrus spray at the neck over your usual base. It extends your composition without losing the intimacy.",
  ],
  'solar_minimalist': [
    "Your strength is clarity. Look for fragrances described as 'transparent', 'aquatic', or 'green' — they carry without crowding.",
    "In hot weather, your fragrances will project more than the bottle suggests. Start with half your usual spray count and build up.",
    "The best layer for you is almost always a white musk base + a citrus top. It's a formula that works every time and stays cleanly in your register.",
  ],
  'dark_alchemist': [
    "Your profile is high-contrast by design. Don't tone it down — but consider the occasion. What reads as magnetic in a bar can be suffocating on a commute.",
    "For winter, try a drop of incense on the sternum, over your leather or oud base. It adds an ethereal upper register to what can otherwise read as purely dense.",
    "Your fragrances need time. Most of your best bottles will smell strange in the first 5 minutes and magnificent in the drydown. Learn your timings.",
  ],
}
