/**
 * Layer Lab & Circadian Spritz Schedule Engine (BET-N04, BET-N21, BET-N24)
 * Analyzes weather, location context, daily calendar events, and shelf inventory
 * to prescribe an evolving, 3-stage day-to-night layering ritual.
 */

import { DetectedFragranceCandidate } from './scan-to-shelf'
import { simulateEvaporation } from './evaporation-simulator'

export interface WeatherCondition {
  tempC: number
  humidityPct: number
  conditionDesc: string
  isHumidOrRainy: boolean
}

export interface DayPlanEvent {
  time: string // e.g. "08:30", "14:00", "19:00"
  type: 'Work' | 'Meeting' | 'Date' | 'Gym' | 'Evening Drinks' | 'Casual'
  description: string
}

export interface SpritzInstruction {
  scheduledTime: string // "08:00"
  stageName: 'Morning Foundation' | 'Midday Transition' | 'Nocturnal Accent'
  fragranceName: string
  brand: string
  sprayCount: number
  targetZones: string[] // e.g. ["Chest (3 sprays)", "Wrists (2 sprays)"]
  hybridScentDescriptor: string
  rationale: string
  pushNotification: {
    title: string
    body: string
  }
}

export interface DailyCircadianProtocol {
  date: string
  weatherSummary: string
  contextSummary: string
  spritzPlan: SpritzInstruction[]
}

export function generateSpritzSchedule(
  shelf: DetectedFragranceCandidate[],
  weather: WeatherCondition,
  events: DayPlanEvent[]
): DailyCircadianProtocol {
  if (shelf.length === 0) {
    throw new Error('Shelf cannot be empty for spritz scheduling')
  }

  // 1. Pick base foundation for morning
  // On warm days, prefer Fresh/Aromatic/Woody; on cool days, prefer Amber/Gourmand
  const morningCandidates = shelf.filter((b) =>
    weather.tempC > 20
      ? ['Fresh & Citrus', 'Aquatic & Ozonic', 'Aromatic & Fougere', 'Woody'].includes(b.family)
      : ['Woody', 'Amber & Oriental', 'Gourmand', 'Chypre'].includes(b.family)
  )
  const baseMorning = morningCandidates[0] || shelf[0]

  // Calculate morning spray adjustment based on heat/humidity
  // High heat/humidity increases sillage projection -> lower spray count
  let morningSprayCount = 4
  if (weather.tempC > 24 || weather.humidityPct > 70) {
    morningSprayCount = 3
  } else if (weather.tempC < 12) {
    morningSprayCount = 5
  }

  // 2. Pick midday transition layer
  // Needs to harmonize with the dry-down heart/base of the morning scent
  const middayCandidates = shelf.filter((b) => b.matchedName !== baseMorning.matchedName)
  const middayLayer = middayCandidates.length > 0 ? middayCandidates[0] : baseMorning

  // 3. Pick evening nocturnal accent
  // Prefer richer, deeper scents (Amber, Gourmand, Leather, Woody)
  const eveningCandidates = shelf.filter((b) =>
    ['Amber & Oriental', 'Leather & Smoke', 'Gourmand', 'Woody'].includes(b.family)
  )
  const eveningLayer = eveningCandidates.length > 0 ? eveningCandidates[0] : shelf[shelf.length - 1]

  const plan: SpritzInstruction[] = [
    {
      scheduledTime: '08:00',
      stageName: 'Morning Foundation',
      fragranceName: baseMorning.matchedName,
      brand: baseMorning.matchedBrand,
      sprayCount: morningSprayCount,
      targetZones: ['Chest & collarbones', 'Forearms'],
      hybridScentDescriptor: `Crisp ${baseMorning.family} baseline`,
      rationale: `Ambient temperature (${weather.tempC}°C) optimizes diffusion of ${baseMorning.topNotes[0]} for morning focus.`,
      pushNotification: {
        title: '☀️ Morning Ritual: nota. Spritz Alert',
        body: `Apply ${morningSprayCount} spritzes of ${baseMorning.matchedName} over your chest and collar to set your daily scent foundation.`,
      },
    },
    {
      scheduledTime: '14:00',
      stageName: 'Midday Transition',
      fragranceName: middayLayer.matchedName,
      brand: middayLayer.matchedBrand,
      sprayCount: 2,
      targetZones: ['Wrists & pulse points'],
      hybridScentDescriptor: `${baseMorning.matchedName} Heart + ${middayLayer.matchedName} Accord`,
      rationale: `As ${baseMorning.matchedName} transitions into heart notes, layering 2 sprays of ${middayLayer.matchedName} introduces vibrant ${middayLayer.topNotes[0] || 'accords'} without clashing.`,
      pushNotification: {
        title: '🌿 14:00 Midday Refresh: Layer Lab',
        body: `Your morning base has dried down. Spritz 2 sprays of ${middayLayer.matchedName} over your wrists to unlock a harmonious hybrid dry-down.`,
      },
    },
    {
      scheduledTime: '18:30',
      stageName: 'Nocturnal Accent',
      fragranceName: eveningLayer.matchedName,
      brand: eveningLayer.matchedBrand,
      sprayCount: 2,
      targetZones: ['Neck & behind ears'],
      hybridScentDescriptor: `Velvet ${eveningLayer.family} Twilight Blend`,
      rationale: `Deepens the residual base notes into an intimate, high-projection evening sillage for after-work events.`,
      pushNotification: {
        title: '🌙 18:30 Evening Evolution: Sillage Shift',
        body: `Heading out? Apply 2 sprays of ${eveningLayer.matchedName} behind ears to complement your day trail with nocturnal depth.`,
      },
    },
  ]

  return {
    date: new Date().toISOString().split('T')[0],
    weatherSummary: `${weather.tempC}°C, ${weather.humidityPct}% Humidity (${weather.conditionDesc})`,
    contextSummary: events.map((e) => `${e.time} - ${e.type}: ${e.description}`).join(' | '),
    spritzPlan: plan,
  }
}
