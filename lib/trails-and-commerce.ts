/**
 * Trails Social Hub, Decant Splitter & Restock Hunter (#39, #41, #42)
 * Manages taste-clustered trails, fair-market bottle decanting calculations,
 * and automated stockist price monitoring with AWIN affiliate routing.
 */

export interface ScentTrailPost {
  id: string
  anonymousSoulmateId: string // e.g. "curator_8819_tokyo"
  city: string
  timestamp: string
  fragranceName: string
  brand: string
  weatherSnapshot: string
  sensoryMemoryNote: string
  layeredWith?: string
  affinityMatchPct: number // 98%
}

export interface DecantSplitCalculation {
  bottleName: string
  brand: string
  bottleVolumeMl: number // e.g. 100ml
  bottlePurchaseCost: number // e.g. $320
  decantVialSizeMl: number // e.g. 10ml
  numberOfSlots: number // e.g. 8 (keeping 20ml for self)
  costPerDecantVial: number
  atomizerAndPackagingCost: number
  recommendedSlotPrice: number
  hostCostResidual: number
}

export interface StockistPriceAlert {
  fragranceName: string
  brand: string
  retailerName: string
  currentPrice: number
  originalMSRP: number
  discountPct: number
  inStock: boolean
  affiliateUrl: string
  lastChecked: string
}

/**
 * Calculates fair-share decant split economics for luxury bottle collectors (#41)
 */
export function calculateDecantSplit(params: {
  bottleName: string
  brand: string
  bottleVolumeMl: number
  bottleCost: number
  decantSizeMl: number
  slotsOffered: number
  vialCost?: number
}): DecantSplitCalculation {
  const vialCost = params.vialCost ?? 2.50
  const mlCost = params.bottleCost / params.bottleVolumeMl
  const rawDecantJuiceCost = mlCost * params.decantSizeMl
  const totalCostPerSlot = rawDecantJuiceCost + vialCost
  // Round to nearest integer dollar for clean group splits
  const recommendedSlotPrice = Math.ceil(totalCostPerSlot + 3.0) // $3 margin for packaging & time
  const totalReclaimed = recommendedSlotPrice * params.slotsOffered
  const hostCostResidual = Math.max(0, params.bottleCost - totalReclaimed)

  return {
    bottleName: params.bottleName,
    brand: params.brand,
    bottleVolumeMl: params.bottleVolumeMl,
    bottlePurchaseCost: params.bottleCost,
    decantVialSizeMl: params.decantSizeMl,
    numberOfSlots: params.slotsOffered,
    costPerDecantVial: Math.round(rawDecantJuiceCost * 100) / 100,
    atomizerAndPackagingCost: vialCost,
    recommendedSlotPrice,
    hostCostResidual: Math.round(hostCostResidual * 100) / 100,
  }
}

/**
 * Generates an affiliate tracking link via AWIN network for authentic retailers (#42)
 */
export function generateAwinAffiliateUrl(params: {
  publisherId: string
  merchantId: string
  targetProductUrl: string
  fragranceId: string
}): string {
  const encodedDestination = encodeURIComponent(params.targetProductUrl)
  return `https://www.awin1.com/cread.php?awinmid=${params.merchantId}&awinaffid=${params.publisherId}&clickref=nota_shelf_${params.fragranceId}&ued=${encodedDestination}`
}
