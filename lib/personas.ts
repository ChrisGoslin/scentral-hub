export interface Persona {
  id: string
  name: string
  sanctuary: string
  projection: string
  scent_spectrum: {
    top: string[]
    heart: string[]
    base: string[]
  }
  narrative: {
    tagline: string
    what_this_says: string
    environments: string
    social_energy: string
  }
  recommendations: {
    preferred_families: string[]
    avoid_families: string[]
    layering_tips: string[]
  }
  ui_theme: {
    accentColor: string
    bgGradient: string
    cardBg: string
  }
  discover_filters: {
    families: string[]
    projections: string[]
  }
}

export const PERSONAS: Persona[] = [
  {
    id: 'velvet_intellectual',
    name: 'The Velvet Intellectual',
    sanctuary: 'archive',
    projection: 'intimate',
    scent_spectrum: {
      top: ['Bergamot', 'Black Tea'],
      heart: ['Iris', 'Tobacco Leaf', 'Dried Paper'],
      base: ['Mahogany', 'Amber', 'Vanilla Pod'],
    },
    narrative: {
      tagline: 'You collect ideas the way others collect souvenirs.',
      what_this_says:
        'Your scent stays close, like margin notes in a favourite book. You\'re not trying to fill a room -- you\'re building an atmosphere.',
      environments: 'Quiet corners, after-hours galleries, candlelit restaurants.',
      social_energy:
        'You prefer one deep conversation to ten shallow ones. Your presence lingers after you leave.',
    },
    recommendations: {
      preferred_families: ['Woody', 'Amber', 'Gourmand', 'Oud', 'Oriental'],
      avoid_families: ['Aquatic', 'Fresh Spicy'],
      layering_tips: [
        'Layer a dry cedar over your base to sharpen the wood for daytime.',
        'Add a single spray of incense at the neck for winter evenings.',
      ],
    },
    ui_theme: {
      accentColor: '#c28b5b',
      bgGradient:
        'linear-gradient(135deg, rgba(44,26,17,0.12) 0%, rgba(92,61,46,0.08) 100%)',
      cardBg: 'rgba(44,26,17,0.04)',
    },
    discover_filters: {
      families: ['Woody Oriental', 'Oriental', 'Amber', 'Oud', 'Tobacco'],
      projections: [],
    },
  },
  {
    id: 'solar_minimalist',
    name: 'The Solar Minimalist',
    sanctuary: 'greenhouse',
    projection: 'solar',
    scent_spectrum: {
      top: ['Neroli', 'Bergamot', 'White Musk'],
      heart: ['Jasmine', 'Green Fig', 'Cucumber'],
      base: ['White Cedar', 'Vetiver', 'Light Musk'],
    },
    narrative: {
      tagline: 'Your scent announces you before you speak.',
      what_this_says:
        'Clean lines. Confident projection. You wear fragrance like punctuation -- it completes the sentence.',
      environments: 'Open-plan offices, rooftop bars, morning runs.',
      social_energy:
        'You\'re energising to be around. People remember how you made them feel, not just what you said.',
    },
    recommendations: {
      preferred_families: ['Citrus', 'Aquatic', 'Green', 'Fresh Spicy', 'Floral'],
      avoid_families: ['Heavy Oud', 'Gourmand', 'Smoky'],
      layering_tips: [
        'Layer a citrus soliflore over a white musk base for clean +40% projection.',
        'Add a marine accord in summer to extend the fresh phase by two hours.',
      ],
    },
    ui_theme: {
      accentColor: '#4a9a7a',
      bgGradient:
        'linear-gradient(135deg, rgba(74,154,122,0.08) 0%, rgba(200,235,215,0.12) 100%)',
      cardBg: 'rgba(74,154,122,0.04)',
    },
    discover_filters: {
      families: ['Citrus', 'Aquatic', 'Green', 'Fresh Spicy', 'Floral'],
      projections: ['Weak', 'Medium', 'Moderate'],
    },
  },
  {
    id: 'dark_alchemist',
    name: 'The Dark Alchemist',
    sanctuary: 'alley',
    projection: 'magnetic',
    scent_spectrum: {
      top: ['Black Pepper', 'Cardamom', 'Smoky Incense'],
      heart: ['Oud', 'Leather', 'Rose Absolute'],
      base: ['Dark Amber', 'Benzoin', 'Labdanum'],
    },
    narrative: {
      tagline: 'You wear fragrance as armour and invitation at once.',
      what_this_says:
        'Bold. Polarising on purpose. You know not everyone will get it -- that\'s exactly the point.',
      environments: 'Late nights, underground venues, anything with low lighting and good speakers.',
      social_energy:
        'Magnetic in small groups. You draw people in without trying.',
    },
    recommendations: {
      preferred_families: ['Leather', 'Tobacco', 'Smoky', 'Resinous', 'Oud', 'Oriental'],
      avoid_families: ['Aquatic', 'Light Floral', 'Fresh'],
      layering_tips: [
        'Layer a smoky oud over a leather base for projection that lasts past midnight.',
        'A drop of rose absolute on the wrist softens the aggression without losing the edge.',
      ],
    },
    ui_theme: {
      accentColor: '#8a4a6a',
      bgGradient:
        'linear-gradient(135deg, rgba(40,20,30,0.14) 0%, rgba(100,40,70,0.08) 100%)',
      cardBg: 'rgba(40,20,30,0.06)',
    },
    discover_filters: {
      families: ['Leather', 'Tobacco', 'Smoky', 'Resinous', 'Woody Oriental', 'Oud'],
      projections: ['Strong', 'Beast Mode', 'Moderate'],
    },
  },
  {
    id: 'ritual_keeper',
    name: 'The Ritual Keeper',
    sanctuary: 'temple',
    projection: 'ceremonial',
    scent_spectrum: {
      top: ['Frankincense', 'Lemon', 'Pink Pepper'],
      heart: ['Sandalwood', 'Patchouli', 'Rose'],
      base: ['Myrrh', 'Cedarwood', 'Vetiver'],
    },
    narrative: {
      tagline: 'You believe scent is a form of meditation, not decoration.',
      what_this_says:
        'Intentional. Grounded. Your relationship with fragrance is sacred—each application is a moment to pause.',
      environments: 'Quiet mornings, meditation spaces, spiritual gatherings, sacred spaces.',
      social_energy:
        'You inspire calm in others. Your presence is felt as a settling force.',
    },
    recommendations: {
      preferred_families: ['Aromatic', 'Herbal', 'Woody', 'Incense', 'Oriental'],
      avoid_families: ['Fruity', 'Aquatic'],
      layering_tips: [
        'Layer a light sandalwood mist at dawn for a grounding start to your day.',
        'Add a drop of myrrh at the pulse points to deepen your evening ritual.',
      ],
    },
    ui_theme: {
      accentColor: '#9d7d5f',
      bgGradient:
        'linear-gradient(135deg, rgba(157,125,95,0.08) 0%, rgba(200,170,140,0.06) 100%)',
      cardBg: 'rgba(157,125,95,0.04)',
    },
    discover_filters: {
      families: ['Incense', 'Aromatic', 'Woody', 'Oriental', 'Herbal'],
      projections: ['Weak', 'Moderate', 'Medium'],
    },
  },
  {
    id: 'rebel_experimentalist',
    name: 'The Rebel Experimentalist',
    sanctuary: 'studio',
    projection: 'bold',
    scent_spectrum: {
      top: ['Grapefruit', 'Ginger', 'Artemisia'],
      heart: ['Leather', 'Violet', 'Spiced Hay'],
      base: ['Guaiacwood', 'Castoreum', 'Musk'],
    },
    narrative: {
      tagline: 'You treat fragrance like art—always pushing boundaries.',
      what_this_says:
        'Unconventional. Creative. You wear scents that tell a story, not ones that blend in with the crowd.',
      environments: 'Creative studios, art galleries, experimental music venues, anywhere unconventional gathers.',
      social_energy:
        'You spark curiosity. People ask questions. You make them think differently.',
    },
    recommendations: {
      preferred_families: ['Leather', 'Spicy', 'Woody', 'Herbal', 'Chypre'],
      avoid_families: ['Sweet Gourmand', 'Ultra Floral'],
      layering_tips: [
        'Layer a sharp ginger top over a leather base for an unexpected contrast.',
        'Combine two bold accords—leather + spiced hay—for a signature that\'s entirely you.',
      ],
    },
    ui_theme: {
      accentColor: '#d4604d',
      bgGradient:
        'linear-gradient(135deg, rgba(212,96,77,0.08) 0%, rgba(230,140,110,0.06) 100%)',
      cardBg: 'rgba(212,96,77,0.04)',
    },
    discover_filters: {
      families: ['Leather', 'Chypre', 'Spicy', 'Herbal', 'Woody Spicy'],
      projections: ['Strong', 'Moderate', 'Beast Mode'],
    },
  },
  {
    id: 'comfort_seeker',
    name: 'The Comfort Seeker',
    sanctuary: 'home',
    projection: 'soft',
    scent_spectrum: {
      top: ['Peach', 'Vanilla Bean', 'Warm Spice'],
      heart: ['Almond', 'Tonka Bean', 'Caramel'],
      base: ['Musk', 'Amber', 'Vanilla Pod'],
    },
    narrative: {
      tagline: 'Your scent is like a warm hug—it makes people feel at ease.',
      what_this_says:
        'Nurturing. Comforting. You choose fragrances that wrap around you like your favourite sweater, soft and reassuring.',
      environments: 'At home with loved ones, cosy cafes, intimate dinners, anywhere warm and intimate.',
      social_energy:
        'People gravitate toward your calm presence. You make spaces feel welcoming.',
    },
    recommendations: {
      preferred_families: ['Gourmand', 'Amber', 'Warm Woody', 'Soft Floral', 'Vanilla'],
      avoid_families: ['Aquatic', 'Heavy Smoky'],
      layering_tips: [
        'Layer a sweet peach over a warm vanilla base for an enveloping, skin-like finish.',
        'Add a touch of almond for extra creaminess that lasts through the day.',
      ],
    },
    ui_theme: {
      accentColor: '#c8987f',
      bgGradient:
        'linear-gradient(135deg, rgba(200,152,127,0.08) 0%, rgba(230,190,165,0.06) 100%)',
      cardBg: 'rgba(200,152,127,0.04)',
    },
    discover_filters: {
      families: ['Gourmand', 'Amber', 'Warm Woody', 'Soft Floral', 'Vanilla'],
      projections: ['Weak', 'Medium', 'Moderate'],
    },
  },
]

export function getPersonaById(id: string): Persona | undefined {
  return PERSONAS.find((p) => p.id === id)
}

// Maps sanctuary + projection inputs to the closest persona
export function getPersonaByInputs(
  sanctuary: string,
  projection: string
): Persona {
  const sanctuaryMap: Record<string, string> = {
    archive:      'velvet_intellectual',
    greenhouse:   'solar_minimalist',
    observatory:  'solar_minimalist',
    alley:        'dark_alchemist',
    dune:         'dark_alchemist',
    harbour:      'solar_minimalist',
    temple:       'ritual_keeper',
    studio:       'rebel_experimentalist',
    home:         'comfort_seeker',
  }

  const projectionMap: Record<string, string> = {
    intimate:     'velvet_intellectual',
    solar:        'solar_minimalist',
    room:         'solar_minimalist',
    magnetic:     'dark_alchemist',
    everywhere:   'dark_alchemist',
    ceremonial:   'ritual_keeper',
    bold:         'rebel_experimentalist',
    soft:         'comfort_seeker',
  }

  // Sanctuary takes priority; projection breaks ties
  const bySanctuary = sanctuaryMap[sanctuary]
  const byProjection = projectionMap[projection]

  const id = bySanctuary ?? byProjection ?? 'solar_minimalist'
  return getPersonaById(id) ?? PERSONAS[0]
}
