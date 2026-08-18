import { UserExpertiseLevel } from './gamification-engine'

type DictionaryKey = 
  | 'ui_shelf_title'
  | 'ui_shelf_empty'
  | 'scent_fresh'
  | 'scent_sweet'
  | 'scent_strong'
  | 'action_layer'
  | 'action_log_trace'

// The master adaptive dictionary mapping everyday language to expert taxonomy
const ADAPTIVE_DICTIONARY: Record<DictionaryKey, Record<UserExpertiseLevel, string>> = {
  
  ui_shelf_title: {
    [UserExpertiseLevel.Novice]: 'My Collection',
    [UserExpertiseLevel.Enthusiast]: 'Fragrance Wardrobe',
    [UserExpertiseLevel.Sommelier]: 'The Master Shelf',
    [UserExpertiseLevel.Atelier]: 'Olfactory Archive',
  },
  
  ui_shelf_empty: {
    [UserExpertiseLevel.Novice]: 'Your shelf is empty. Let\'s find your first signature scent.',
    [UserExpertiseLevel.Enthusiast]: 'No bottles here yet. Time to curate your wardrobe.',
    [UserExpertiseLevel.Sommelier]: 'An empty canvas. What accords will you collect?',
    [UserExpertiseLevel.Atelier]: 'The atelier awaits its first raw materials.',
  },

  scent_fresh: {
    [UserExpertiseLevel.Novice]: 'Fresh & Clean',
    [UserExpertiseLevel.Enthusiast]: 'Citrus & Aquatic',
    [UserExpertiseLevel.Sommelier]: 'Hesperidic / Marine',
    [UserExpertiseLevel.Atelier]: 'Aldehydic / Ozonic',
  },

  scent_sweet: {
    [UserExpertiseLevel.Novice]: 'Sweet & Sugary',
    [UserExpertiseLevel.Enthusiast]: 'Vanilla & Dessert',
    [UserExpertiseLevel.Sommelier]: 'Gourmand',
    [UserExpertiseLevel.Atelier]: 'Gourmand / Ethyl Maltol',
  },

  scent_strong: {
    [UserExpertiseLevel.Novice]: 'Strong (Lasts All Day)',
    [UserExpertiseLevel.Enthusiast]: 'Beast Mode',
    [UserExpertiseLevel.Sommelier]: 'Heavy Sillage',
    [UserExpertiseLevel.Atelier]: 'Extrait (High Volatility / Projection)',
  },

  action_layer: {
    [UserExpertiseLevel.Novice]: 'Mix Scents',
    [UserExpertiseLevel.Enthusiast]: 'Layer Fragrances',
    [UserExpertiseLevel.Sommelier]: 'Blend Accords',
    [UserExpertiseLevel.Atelier]: 'Synthesize Chemistry',
  },

  action_log_trace: {
    [UserExpertiseLevel.Novice]: 'Save a Memory',
    [UserExpertiseLevel.Enthusiast]: 'Log a Wear',
    [UserExpertiseLevel.Sommelier]: 'Record a Trace',
    [UserExpertiseLevel.Atelier]: 'Archive Synesthesia',
  },
}

export function getAdaptiveTerm(key: DictionaryKey, level: UserExpertiseLevel): string {
  // If for some reason a key is missing a specific level, fallback to Novice
  return ADAPTIVE_DICTIONARY[key][level] || ADAPTIVE_DICTIONARY[key][UserExpertiseLevel.Novice]
}
