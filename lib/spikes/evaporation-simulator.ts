/**
 * Molecular Volatility & Evaporation Simulator (BET-N05)
 * Calculates hour-by-hour scent volatility degradation and dry-down transition
 * across Top, Heart, and Base notes, taking into account ambient temperature and humidity.
 */

export interface AccordVolatilityProfile {
  topWeight: number // 0-1
  heartWeight: number // 0-1
  baseWeight: number // 0-1
}

export interface EvaporationState {
  elapsedHours: number
  activeTopPct: number
  activeHeartPct: number
  activeBasePct: number
  dominantStage: 'Top' | 'Heart' | 'Base' | 'Skin-Scent'
  sillageIntensityPct: number
}

// Volatility decay constants (lambda per hour)
const DECAY_RATES = {
  top: 1.8, // 50% decay in ~25 mins
  heart: 0.35, // 50% decay in ~2 hours
  base: 0.08, // 50% decay in ~8.5 hours
}

export function simulateEvaporation(
  initialWeights: AccordVolatilityProfile,
  elapsedHours: number,
  ambientTempC = 20,
  ambientHumidityPct = 50
): EvaporationState {
  // Environmental acceleration factors
  // Higher temperature accelerates volatility
  const tempFactor = 1.0 + (ambientTempC - 20) * 0.02
  // Higher humidity slightly suppresses initial top burst, preserves base
  const humidityFactor = 1.0 - (ambientHumidityPct - 50) * 0.003

  const effectiveTopDecay = DECAY_RATES.top * tempFactor * humidityFactor
  const effectiveHeartDecay = DECAY_RATES.heart * tempFactor
  const effectiveBaseDecay = DECAY_RATES.base * tempFactor

  const activeTop = initialWeights.topWeight * Math.exp(-effectiveTopDecay * elapsedHours)
  const activeHeart = initialWeights.heartWeight * Math.exp(-effectiveHeartDecay * elapsedHours)
  const activeBase = initialWeights.baseWeight * Math.exp(-effectiveBaseDecay * elapsedHours)

  const totalActive = activeTop + activeHeart + activeBase
  const topPct = totalActive > 0 ? (activeTop / totalActive) * 100 : 0
  const heartPct = totalActive > 0 ? (activeHeart / totalActive) * 100 : 0
  const basePct = totalActive > 0 ? (activeBase / totalActive) * 100 : 0

  // Total sillage decay from initial 100%
  const sillageIntensityPct = Math.round(
    ((activeTop * 1.5 + activeHeart * 1.0 + activeBase * 0.7) /
      (initialWeights.topWeight * 1.5 + initialWeights.heartWeight * 1.0 + initialWeights.baseWeight * 0.7)) *
      100
  )

  let dominantStage: EvaporationState['dominantStage'] = 'Skin-Scent'
  if (sillageIntensityPct < 15) {
    dominantStage = 'Skin-Scent'
  } else if (topPct >= 40) {
    dominantStage = 'Top'
  } else if (heartPct >= 40) {
    dominantStage = 'Heart'
  } else {
    dominantStage = 'Base'
  }

  return {
    elapsedHours,
    activeTopPct: Math.round(topPct),
    activeHeartPct: Math.round(heartPct),
    activeBasePct: Math.round(basePct),
    dominantStage,
    sillageIntensityPct: Math.max(0, Math.min(100, sillageIntensityPct)),
  }
}

export function generateEvaporationTimeline(
  initialWeights: AccordVolatilityProfile,
  ambientTempC = 20,
  ambientHumidityPct = 50,
  totalHours = 8
): EvaporationState[] {
  const timeline: EvaporationState[] = []
  for (let h = 0; h <= totalHours; h += 0.5) {
    timeline.push(simulateEvaporation(initialWeights, h, ambientTempC, ambientHumidityPct))
  }
  return timeline
}
