/**
 * lib/affinity.ts
 * Consolidated affinity tier logic for the Living Wardrobe.
 *
 * Affinity scores map to 4 tiers:
 * - tier0 (Top Signatures): 16-20 — Active top 20
 * - tier1 (Occasion Modifiers): 8-15 — Transitional
 * - tier2 (Base Anchors): 1-7 — Dense ouds
 * - tier3 (Holding Zone): 0 or null — New / Unrated
 */

export type TierKey = 'tier0' | 'tier1' | 'tier2' | 'tier3'

export interface TierDefinition {
  key: TierKey
  type: string
  label: string
  sublabel: string
  minScore: number
  maxScore: number
  assignScore: number
  locked: boolean
}

export interface AffinityTier {
  tier: TierKey
  label: string
  sublabel: string
  badge: string | null
  cssClass: string
  assignScore: number
  locked: boolean
}

export interface TierColors {
  accent: string
  glow: string
}

/**
 * AFFINITY_TIER_RANGES
 * Canonical tier definitions with thresholds, labels, and DB write values.
 */
export const AFFINITY_TIER_DEFS: TierDefinition[] = [
  {
    key: 'tier0',
    type: 'TOP_SHELF_SIGNATURES',
    label: 'Signatures',
    sublabel: 'Active Top 20',
    minScore: 16,
    maxScore: 20,
    assignScore: 18,
    locked: false,
  },
  {
    key: 'tier1',
    type: 'MIDDLE_SHELF',
    label: 'Occasion Modifiers',
    sublabel: 'Transitional',
    minScore: 8,
    maxScore: 15,
    assignScore: 11,
    locked: false,
  },
  {
    key: 'tier2',
    type: 'LOWER_SHELF',
    label: 'Base Anchors',
    sublabel: 'Dense Ouds',
    minScore: 1,
    maxScore: 7,
    assignScore: 4,
    locked: false,
  },
  {
    key: 'tier3',
    type: 'HOLDING_ZONE',
    label: 'Benching',
    sublabel: 'New / Unrated',
    minScore: 0,
    maxScore: 0,
    assignScore: 0,
    locked: true,
  },
]

/**
 * TIER_COLORS
 * CSS variables and accent/glow colors for each tier.
 * Used by ShelfTier.tsx and other UI components.
 */
export const TIER_COLORS: Record<TierKey, TierColors> = {
  tier0: {
    accent: 'rgba(196,154,60,0.5)',
    glow: 'rgba(196,154,60,0.12)',
  },
  tier1: {
    accent: 'rgba(196,154,60,0.3)',
    glow: 'rgba(196,154,60,0.06)',
  },
  tier2: {
    accent: 'rgba(110,31,46,0.5)',
    glow: 'rgba(110,31,46,0.08)',
  },
  tier3: {
    accent: 'rgba(255,255,255,0.1)',
    glow: 'transparent',
  },
}

/**
 * getAffinityTier(score)
 * Classifies a fragrance's affinity score into a tier.
 * Returns the tier key and metadata for UI rendering.
 *
 * @param score - The affinity score (0-20) or null/undefined for unrated
 * @returns AffinityTier object with tier, label, badge, and cssClass
 */
export function getAffinityTier(score: number | null | undefined): AffinityTier {
  if (score == null || score === 0) {
    const def = AFFINITY_TIER_DEFS[3] // tier3
    return {
      tier: 'tier3',
      label: def.label,
      sublabel: def.sublabel,
      badge: null,
      cssClass: 'affinity-tier-3',
      assignScore: def.assignScore,
      locked: def.locked,
    }
  }

  if (score >= 16) {
    const def = AFFINITY_TIER_DEFS[0] // tier0
    return {
      tier: 'tier0',
      label: def.label,
      sublabel: def.sublabel,
      badge: '★ Signature',
      cssClass: 'affinity-tier-0',
      assignScore: def.assignScore,
      locked: def.locked,
    }
  }

  if (score >= 8) {
    const def = AFFINITY_TIER_DEFS[1] // tier1
    return {
      tier: 'tier1',
      label: def.label,
      sublabel: def.sublabel,
      badge: '◆ Occasion',
      cssClass: 'affinity-tier-1',
      assignScore: def.assignScore,
      locked: def.locked,
    }
  }

  // score >= 1
  const def = AFFINITY_TIER_DEFS[2] // tier2
  return {
    tier: 'tier2',
    label: def.label,
    sublabel: def.sublabel,
    badge: '● Base',
    cssClass: 'affinity-tier-2',
    assignScore: def.assignScore,
    locked: def.locked,
  }
}

/**
 * getTierColor(tier)
 * Returns the accent and glow colors for a given tier.
 *
 * @param tier - The tier key (tier0-tier3)
 * @returns TierColors object { accent, glow }
 */
export function getTierColor(tier: TierKey): TierColors {
  return TIER_COLORS[tier] || { accent: 'rgba(255,255,255,0.2)', glow: 'transparent' }
}

/**
 * Helper: getTierDefinition(tier)
 * Returns the TierDefinition for a given tier key.
 *
 * @param tier - The tier key
 * @returns TierDefinition or undefined
 */
export function getTierDefinition(tier: TierKey): TierDefinition | undefined {
  return AFFINITY_TIER_DEFS.find(def => def.key === tier)
}
