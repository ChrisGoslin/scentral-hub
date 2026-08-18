/**
 * Voice & Context Scent Concierge & Gift Recommendation Engine (#44, #49, #47)
 * Provides hands-free natural language spray recommendations and partner gift guidance.
 */

import { ExtendedShelfBottle } from './shelf-multi-lens'
import { WeatherCondition } from './spikes/spritz-schedule'

export interface ConciergeQueryContext {
  queryText: string
  weather: WeatherCondition
  occasionType: 'Work / Pitch' | 'Date Night' | 'Casual Daytime' | 'Gym' | 'Formal Gala'
  userShelf: ExtendedShelfBottle[]
}

export interface ConciergeRecommendation {
  prescribedFragrance: string
  prescribedBrand: string
  layerSuggestion?: string
  sprayCount: number
  sprayPlacement: string
  sillageDurationHours: number
  voiceResponseText: string
  luxuryConfidenceRationale: string
}

export interface PartnerGiftRecommendation {
  recommendedFragrance: string
  brand: string
  priceMSRP: string
  matchConfidencePct: number
  safeBlindBuyScore: number // 0-100
  notesComplementaryToPartner: string[]
  giftRationaleNote: string
}

export interface InsuranceValuationReport {
  generatedAt: string
  totalBottleCount: number
  totalEstimatedValueUSD: number
  highestValuedBottle: {
    name: string
    brand: string
    estimatedValueUSD: number
  }
  breakdown: Array<{
    name: string
    brand: string
    status: string
    estimatedValueUSD: number
  }>
}

/**
 * Natural language morning scent concierge query resolver
 */
export function resolveConciergeQuery(context: ConciergeQueryContext): ConciergeRecommendation {
  const { queryText, weather, occasionType, userShelf } = context
  const q = queryText.toLowerCase()

  // 1. Determine best candidate bottle from shelf
  let candidate = userShelf[0]

  if (occasionType === 'Date Night' || q.includes('date') || q.includes('drinks') || q.includes('dinner')) {
    const eveningCandidates = userShelf.filter((b) =>
      ['Woody', 'Amber & Oriental', 'Leather & Smoke', 'Gourmand'].includes(b.family)
    )
    if (eveningCandidates.length > 0) candidate = eveningCandidates[0]
  } else if (occasionType === 'Work / Pitch' || q.includes('work') || q.includes('office') || q.includes('meeting') || q.includes('investor')) {
    const workCandidates = userShelf.filter((b) =>
      ['Fresh & Citrus', 'Aromatic & Fougere', 'Woody'].includes(b.family)
    )
    if (workCandidates.length > 0) candidate = workCandidates[0]
  }

  // 2. Adjust sprays for weather
  let sprayCount = 4
  if (weather.tempC > 24) {
    sprayCount = 2
  } else if (weather.tempC < 14) {
    sprayCount = 5
  }

  const voiceResponseText = `Good morning. For your ${occasionType.toLowerCase()} in ${weather.tempC} degree weather, I prescribe ${sprayCount} spritzes of ${candidate.brand} ${candidate.name}. It delivers crisp refinement with an intimate 8-hour dry-down.`

  return {
    prescribedFragrance: candidate.name,
    prescribedBrand: candidate.brand,
    sprayCount,
    sprayPlacement: '2 on chest, 1 on wrists, 1 behind neck',
    sillageDurationHours: 8,
    voiceResponseText,
    luxuryConfidenceRationale: `Ambient temperature (${weather.tempC}°C) optimizes diffusion of ${candidate.family} accords for maximum focus.`,
  }
}

/**
 * Generates a zero-risk gift recommendation for a partner based on their shelf
 */
export function recommendPartnerGift(partnerShelf: ExtendedShelfBottle[]): PartnerGiftRecommendation {
  const families = partnerShelf.map((b) => b.family)
  const isWoodyLover = families.includes('Woody') || families.includes('Amber & Oriental')

  if (isWoodyLover) {
    return {
      recommendedFragrance: 'Grand Soir',
      brand: 'Maison Francis Kurkdjian',
      priceMSRP: '$245',
      matchConfidencePct: 96,
      safeBlindBuyScore: 94,
      notesComplementaryToPartner: ['Amber', 'Benzoin', 'Vanilla', 'Tonka Bean'],
      giftRationaleNote: 'Complements their existing woody wardrobe with an opulent, crowd-pleasing amber trail that carries zero blind-buy dissonance.',
    }
  }

  return {
    recommendedFragrance: 'Silver Mountain Water',
    brand: 'Creed',
    priceMSRP: '$365',
    matchConfidencePct: 91,
    safeBlindBuyScore: 89,
    notesComplementaryToPartner: ['Bergamot', 'Mandarin', 'Green Tea', 'Blackcurrant'],
    giftRationaleNote: 'An effortless, sparkling niche upgrade tailored to their appreciation for fresh and uplifting accords.',
  }
}

/**
 * Calculates collection insurance valuation report
 */
export function generateInsuranceValuation(shelf: ExtendedShelfBottle[]): InsuranceValuationReport {
  const BASE_PRICE = 280 // Average luxury bottle MSRP
  const breakdown = shelf.map((b) => ({
    name: b.name,
    brand: b.brand,
    status: b.lifecycleStatus,
    estimatedValueUSD: b.brand === 'Creed' ? 395 : b.brand === 'Maison Francis Kurkdjian' ? 320 : BASE_PRICE,
  }))

  const total = breakdown.reduce((sum, item) => sum + item.estimatedValueUSD, 0)
  const highest = [...breakdown].sort((a, b) => b.estimatedValueUSD - a.estimatedValueUSD)[0]

  return {
    generatedAt: new Date().toISOString(),
    totalBottleCount: shelf.length,
    totalEstimatedValueUSD: total,
    highestValuedBottle: highest || { name: 'None', brand: 'None', estimatedValueUSD: 0 },
    breakdown,
  }
}
