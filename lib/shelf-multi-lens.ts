/**
 * Multi-Lens Virtual Shelf & Lifecycle Engine
 * Handles dynamic category sorting (Top Ouds, Freshies, Florals, Office)
 * and rich lifecycle state filtering (Owned, In-Transit, Blind-Bought, Sampled, Wishlist).
 */

import { OlfactoryFamily } from './spikes/scan-to-shelf'

export type ShelfCategoryLens =
  | 'overall_top_20'
  | 'top_ouds'
  | 'top_freshies'
  | 'top_florals'
  | 'top_office'
  | 'top_date_night'

export type InventoryLifecycleStatus =
  | 'owned'
  | 'on_the_way'
  | 'blind_bought'
  | 'tested_sample'
  | 'smelled_wishlist'

export interface ExtendedShelfBottle {
  id: string
  name: string
  brand: string
  family: OlfactoryFamily
  lifecycleStatus: InventoryLifecycleStatus
  categoryRanks: Partial<Record<ShelfCategoryLens, number>>
  overallRank: number
  imageUrl: string | null
  blindBuyRegretRiskScore?: number // 0 - 100
  sampleFillPct?: number // 0 - 100
  inboundCarrierTracking?: string
  estimatedDeliveryDate?: string
  purchaseVendor?: string
}

export const CATEGORY_LENS_CONFIG: Record<ShelfCategoryLens, { label: string; icon: string; description: string }> = {
  overall_top_20: {
    label: 'Overall Top 20',
    icon: '🌟',
    description: 'Your definitive master fragrance hierarchy across all genres.',
  },
  top_ouds: {
    label: 'Top Ouds & Resins',
    icon: '🪵',
    description: 'Deep agarwoods, frankincense, amber, and nocturnal dark resins.',
  },
  top_freshies: {
    label: 'Top Freshies & Citrus',
    icon: '🍋',
    description: 'Effervescent bergamot, neroli, aquatics, and crisp linens.',
  },
  top_florals: {
    label: 'Top Florals & Petals',
    icon: '🌸',
    description: 'Velveteen iris, midnight rose, jasmine sambac, and tuberose.',
  },
  top_office: {
    label: 'Top Office & Daily',
    icon: '💼',
    description: 'Subtle, polite projection with high refinement and cleanliness.',
  },
  top_date_night: {
    label: 'Top Date Night',
    icon: '🌙',
    description: 'Intimate, warm, intoxicating sillage designed for close quarters.',
  },
}

/**
 * Filter and sort shelf bottles based on selected category lens and lifecycle status
 */
export function filterAndRankShelfBottles(
  bottles: ExtendedShelfBottle[],
  activeLens: ShelfCategoryLens,
  lifecycleFilter: InventoryLifecycleStatus | 'all' = 'all'
): ExtendedShelfBottle[] {
  let filtered = bottles

  if (lifecycleFilter !== 'all') {
    filtered = filtered.filter((b) => b.lifecycleStatus === lifecycleFilter)
  }

  // Filter based on lens relevance
  if (activeLens === 'top_ouds') {
    filtered = filtered.filter((b) => ['Woody', 'Amber & Oriental', 'Leather & Smoke'].includes(b.family))
  } else if (activeLens === 'top_freshies') {
    filtered = filtered.filter((b) => ['Fresh & Citrus', 'Aquatic & Ozonic', 'Aromatic & Fougere'].includes(b.family))
  } else if (activeLens === 'top_florals') {
    filtered = filtered.filter((b) => b.family === 'Floral')
  }

  // Sort by specific lens rank or fall back to overall rank
  return [...filtered].sort((a, b) => {
    const rankA = a.categoryRanks[activeLens] ?? a.overallRank
    const rankB = b.categoryRanks[activeLens] ?? b.overallRank
    return rankA - rankB
  })
}

/**
 * Parses pasted order confirmations (e.g. from LuckyScent, Notino, Jovoy, Harrods)
 * and extracts bottle records staged for 'on_the_way'.
 */
export function parseSupplierOrderText(
  rawOrderText: string,
  vendor: string
): Partial<ExtendedShelfBottle>[] {
  const lines = rawOrderText.split('\n').map((l) => l.trim()).filter(Boolean)
  const stagedBottles: Partial<ExtendedShelfBottle>[] = []

  for (const line of lines) {
    if (line.toLowerCase().includes('order') || line.toLowerCase().includes('total') || line.length < 4) {
      continue
    }
    stagedBottles.push({
      id: `inbound_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: line,
      brand: vendor,
      lifecycleStatus: 'on_the_way',
      categoryRanks: {},
      overallRank: 99,
      purchaseVendor: vendor,
      estimatedDeliveryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    })
  }

  return stagedBottles
}
