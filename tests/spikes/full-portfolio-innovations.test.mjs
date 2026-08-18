import test from 'node:test'
import assert from 'node:assert/strict'

import {
  detectPruningCandidates,
  generateSeasonalRotationAdvisory,
  decodeBatchCode,
  evaluateSunlightUVExposure,
  evaluateLayeringHarmony,
  checkOlfactoryFatigueRisk,
  calculateScentBridge,
  calculateNoseprintRadarAffinities,
  planTravelCapsule,
} from '../../lib/portfolio-innovations-matrix.ts'

test('detectPruningCandidates flags bottles unused for over 90 days', () => {
  const shelf = [
    { id: '1', name: 'Vintage Oud', brand: 'Tom Ford', family: 'Woody', lifecycleStatus: 'owned', overallRank: 1, categoryRanks: {}, imageUrl: null, lastWornDate: '2025-01-01' },
    { id: '2', name: 'Fresh Neroli', brand: 'Tom Ford', family: 'Fresh & Citrus', lifecycleStatus: 'owned', overallRank: 2, categoryRanks: {}, imageUrl: null, lastWornDate: new Date().toISOString() },
  ]
  const pruning = detectPruningCandidates(shelf)
  assert.equal(pruning.length, 1)
  assert.equal(pruning[0].name, 'Vintage Oud')
})

test('generateSeasonalRotationAdvisory rotates shelf categories by season', () => {
  const shelf = [
    { id: '1', name: 'Neroli', brand: 'Tom Ford', family: 'Fresh & Citrus', lifecycleStatus: 'owned', overallRank: 1, categoryRanks: {}, imageUrl: null },
    { id: '2', name: 'Tobacco Vanille', brand: 'Tom Ford', family: 'Gourmand', lifecycleStatus: 'owned', overallRank: 2, categoryRanks: {}, imageUrl: null },
  ]
  const springAdvisory = generateSeasonalRotationAdvisory(6, shelf) // June
  assert.ok(springAdvisory.frontRowPromotions.includes('Neroli'))
})

test('decodeBatchCode decodes vintage pre-IFRA formulation status', () => {
  const vintage = decodeBatchCode('Creed', 'A4214F01')
  assert.equal(vintage.reformulationEra, 'Pre-IFRA Oakmoss Era')
  assert.equal(vintage.productionYear, 2014)
})

test('evaluateSunlightUVExposure accurately flags risk for high lux/temp', () => {
  const risk = evaluateSunlightUVExposure(1200, 28)
  assert.equal(risk.isAtRisk, true)
  assert.equal(risk.warningLevel, 'Critical Oxidation Risk')
})

test('evaluateLayeringHarmony detects accord clashes and ratios', () => {
  const clash = evaluateLayeringHarmony('Gourmand', 'Aquatic & Ozonic')
  assert.equal(clash.isClashing, true)
  assert.ok(clash.clashReason.includes('dissonance'))

  const harmony = evaluateLayeringHarmony('Woody', 'Fresh & Citrus')
  assert.equal(harmony.isClashing, false)
  assert.ok(harmony.harmonyScorePct >= 90)
})

test('checkOlfactoryFatigueRisk warns after consecutive wear days', () => {
  const fatigued = checkOlfactoryFatigueRisk(4)
  assert.equal(fatigued.isFatigued, true)
  assert.ok(fatigued.sensoryAlert.includes('adaptation'))
})

test('calculateScentBridge generates intermediate transition paths', () => {
  const bridge = calculateScentBridge('Fresh & Citrus', 'Woody')
  assert.equal(bridge.bridgeSteps.length, 2)
})

test('calculateNoseprintRadarAffinities computes 9-axis profile percentages', () => {
  const shelf = [
    { id: '1', name: 'A', brand: 'B', family: 'Woody', lifecycleStatus: 'owned', overallRank: 1, categoryRanks: {}, imageUrl: null },
    { id: '2', name: 'C', brand: 'D', family: 'Woody', lifecycleStatus: 'owned', overallRank: 2, categoryRanks: {}, imageUrl: null },
  ]
  const radar = calculateNoseprintRadarAffinities(shelf)
  assert.equal(radar.Woody, 100)
})

test('planTravelCapsule constructs 3-atomizer capsule for destination', () => {
  const capsule = planTravelCapsule('Tokyo', 24)
  assert.equal(capsule.recommendedAtomizers.length, 3)
  assert.equal(capsule.recommendedAtomizers[0].sizeMl, 10)
})
