import test from 'node:test'
import assert from 'node:assert/strict'

import {
  parseVanityShelfVision,
  stringSimilarity,
} from '../../lib/spikes/scan-to-shelf.ts'
import {
  generateSpritzSchedule,
} from '../../lib/spikes/spritz-schedule.ts'
import {
  simulateEvaporation,
  generateEvaporationTimeline,
} from '../../lib/spikes/evaporation-simulator.ts'
import {
  updateEloRatings,
  calculateExpectedScore,
} from '../../lib/spikes/elo-duel.ts'

test('stringSimilarity correctly scores exact and fuzzy strings', () => {
  assert.equal(stringSimilarity('Santal 33', 'santal 33'), 1.0)
  assert.ok(stringSimilarity('Le Labo Santal 33 EDP', 'Santal 33') > 0.4)
})

test('parseVanityShelfVision extracts multi-bottle shelf and categorizes families', () => {
  const simulatedOCR = [
    'LE LABO SANTAL 33 100ML',
    'MAISON FRANCIS KURKDJIAN BACCARAT ROUGE 540',
    'TOM FORD TOBACCO VANILLE EAU DE PARFUM',
    'CREED AVENTUS',
  ]

  const scan = parseVanityShelfVision(simulatedOCR)
  assert.equal(scan.bottlesDetectedCount, 4)
  assert.equal(scan.familyDistribution['Woody'], 1)
  assert.equal(scan.familyDistribution['Amber & Oriental'], 1)
  assert.equal(scan.familyDistribution['Gourmand'], 1)
  assert.equal(scan.familyDistribution['Chypre'], 1)

  const santal = scan.bottles.find((b) => b.matchedName === 'Santal 33')
  assert.ok(santal)
  assert.equal(santal.matchedBrand, 'Le Labo')
  assert.deepEqual(santal.topNotes, ['Violet Accord', 'Cardamom'])
})

test('simulateEvaporation correctly simulates decay curve over 8 hours', () => {
  const initial = { topWeight: 0.4, heartWeight: 0.4, baseWeight: 0.2 }
  
  // At t=0
  const t0 = simulateEvaporation(initial, 0, 20, 50)
  assert.equal(t0.dominantStage, 'Top')
  assert.equal(t0.sillageIntensityPct, 100)

  // At t=4 hours
  const t4 = simulateEvaporation(initial, 4, 20, 50)
  assert.ok(t4.activeTopPct < 5) // Top should have decayed
  assert.ok(t4.activeHeartPct > 30 || t4.activeBasePct > 30)

  // Timeline length
  const timeline = generateEvaporationTimeline(initial, 20, 50, 8)
  assert.equal(timeline.length, 17) // 0 to 8 in steps of 0.5
})

test('generateSpritzSchedule creates a 3-stage day-to-night layering plan with push notifications', () => {
  const scan = parseVanityShelfVision([
    'LE LABO SANTAL 33',
    'TOM FORD NEROLI PORTOFINO',
    'MFK BACCARAT ROUGE 540',
  ])

  const weather = {
    tempC: 22,
    humidityPct: 60,
    conditionDesc: 'Partly Cloudy',
    isHumidOrRainy: false,
  }

  const events = [
    { time: '09:00', type: 'Work', description: 'Deep focus design sprint' },
    { time: '14:00', type: 'Meeting', description: 'Client presentation' },
    { time: '19:00', type: 'Evening Drinks', description: 'Rooftop cocktail bar' },
  ]

  const protocol = generateSpritzSchedule(scan.bottles, weather, events)
  assert.equal(protocol.spritzPlan.length, 3)

  // Check 08:00 morning foundation
  const morning = protocol.spritzPlan[0]
  assert.equal(morning.scheduledTime, '08:00')
  assert.ok(morning.pushNotification.title.includes('Morning Ritual'))
  assert.ok(morning.sprayCount >= 3)

  // Check 14:00 midday transition
  const midday = protocol.spritzPlan[1]
  assert.equal(midday.scheduledTime, '14:00')
  assert.ok(midday.pushNotification.title.includes('Midday Refresh'))

  // Check 18:30 evening evolution
  const evening = protocol.spritzPlan[2]
  assert.equal(evening.scheduledTime, '18:30')
  assert.ok(evening.pushNotification.title.includes('Evening Evolution'))
})

test('updateEloRatings accurately updates ratings after binary pairwise duel', () => {
  const bottleA = { id: '1', name: 'Santal 33', brand: 'Le Labo', eloRating: 1200, matchesPlayed: 0 }
  const bottleB = { id: '2', name: 'Aventus', brand: 'Creed', eloRating: 1200, matchesPlayed: 0 }

  const { updatedWinner, updatedLoser } = updateEloRatings(bottleA, bottleB)
  assert.equal(updatedWinner.eloRating, 1216)
  assert.equal(updatedLoser.eloRating, 1184)
  assert.equal(updatedWinner.matchesPlayed, 1)
  assert.equal(updatedLoser.matchesPlayed, 1)
})
