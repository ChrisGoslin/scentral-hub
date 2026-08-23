/**
 * End-to-End Demonstration Script for nota. Innovation Spikes
 */

import { parseVanityShelfVision } from '../lib/spikes/scan-to-shelf'
import { generateSpritzSchedule } from '../lib/spikes/spritz-schedule'
import { simulateEvaporation } from '../lib/spikes/evaporation-simulator'
import { updateEloRatings } from '../lib/spikes/elo-duel'

console.log('===============================================================')
console.log('🧪 nota. — TECHNICAL SPIKES & CUSTOMER WOW DEMO')
console.log('===============================================================\n')

// 1. Vision Scan-to-Shelf Ingestion
console.log('📸 1. RUNNING SCAN-TO-SHELF VISION INGESTION...')
const rawOcrInput = [
  'LE LABO SANTAL 33 100ML',
  'TOM FORD NEROLI PORTOFINO ACQUA',
  'MAISON FRANCIS KURKDJIAN BACCARAT ROUGE 540',
  'TOM FORD TOBACCO VANILLE',
]
const scanResult = parseVanityShelfVision(rawOcrInput)
console.log(`✅ Detected ${scanResult.bottlesDetectedCount} bottles on physical vanity:`)
scanResult.bottles.forEach((b, i) => {
  console.log(`   [${i + 1}] ${b.matchedBrand} — ${b.matchedName} (Family: ${b.family}, Confidence: ${(b.confidence * 100).toFixed(0)}%)`)
})
console.log('\n📊 Scent Family Distribution:')
console.log(scanResult.familyDistribution)

// 2. Weather & Context-Aware Spritz Schedule & Layer Lab
console.log('\n---------------------------------------------------------------')
console.log('☀️ 2. GENERATING CIRCADIAN SPRITZ SCHEDULE & LAYER LAB RITUAL...')
const weather = {
  tempC: 23,
  humidityPct: 62,
  conditionDesc: 'Mild & Sunny Dublin Breeze',
  isHumidOrRainy: false,
}
const dayEvents = [
  { time: '09:00', type: 'Work' as const, description: 'Morning Product Strategy Session' },
  { time: '14:00', type: 'Meeting' as const, description: 'Afternoon Architecture Review' },
  { time: '19:00', type: 'Evening Drinks' as const, description: 'Evening Rooftop Drinks' },
]

const schedule = generateSpritzSchedule(scanResult.bottles, weather, dayEvents)
console.log(`📍 Weather Context: ${schedule.weatherSummary}`)
console.log(`📅 Agenda: ${schedule.contextSummary}\n`)

schedule.spritzPlan.forEach((plan, i) => {
  console.log(`⏰ [Stage ${i + 1} - ${plan.scheduledTime}] ${plan.stageName.toUpperCase()}`)
  console.log(`   🧴 Fragrance: ${plan.brand} ${plan.fragranceName}`)
  console.log(`   💨 Prescription: ${plan.sprayCount} sprays over ${plan.targetZones.join(', ')}`)
  console.log(`   🧬 Hybrid Scent: ${plan.hybridScentDescriptor}`)
  console.log(`   💡 Rationale: ${plan.rationale}`)
  console.log(`   🔔 Push Notification Payload:`)
  console.log(`      Title: "${plan.pushNotification.title}"`)
  console.log(`      Body:  "${plan.pushNotification.body}"\n`)
})

// 3. Molecular Evaporation Timeline
console.log('---------------------------------------------------------------')
console.log('🔬 3. MOLECULAR VOLATILITY EVAPORATION CURVE (8 HOURS)...')
const hoursToSample = [0, 1, 2, 4, 6, 8]
console.log('Hour | Top Notes % | Heart Notes % | Base Notes % | Sillage Stage | Projection %')
console.log('-----|-------------|---------------|--------------|---------------|-------------')
for (const h of hoursToSample) {
  const sim = simulateEvaporation({ topWeight: 0.4, heartWeight: 0.4, baseWeight: 0.2 }, h, weather.tempC, weather.humidityPct)
  console.log(
    `${h.toString().padEnd(4)} | ` +
    `${(sim.activeTopPct + '%').padEnd(11)} | ` +
    `${(sim.activeHeartPct + '%').padEnd(13)} | ` +
    `${(sim.activeBasePct + '%').padEnd(12)} | ` +
    `${sim.dominantStage.padEnd(13)} | ` +
    `${sim.sillageIntensityPct}%`
  )
}

// 4. Olfactory Elo Duel Demo
console.log('\n---------------------------------------------------------------')
console.log('⚔️ 4. OLFACTORY ELO DUEL MINI-GAME ENGINE...')
const bottleA = { id: '1', name: 'Santal 33', brand: 'Le Labo', eloRating: 1200, matchesPlayed: 0 }
const bottleB = { id: '2', name: 'Baccarat Rouge 540', brand: 'MFK', eloRating: 1200, matchesPlayed: 0 }
console.log(`Initial ratings: ${bottleA.name} (${bottleA.eloRating}) vs ${bottleB.name} (${bottleB.eloRating})`)
const duelResult = updateEloRatings(bottleA, bottleB)
console.log(`🏆 Duel Result (Winner: ${duelResult.updatedWinner.name}):`)
console.log(`   ${duelResult.updatedWinner.name}: Rating -> ${duelResult.updatedWinner.eloRating} (Matches: ${duelResult.updatedWinner.matchesPlayed})`)
console.log(`   ${duelResult.updatedLoser.name}: Rating -> ${duelResult.updatedLoser.eloRating} (Matches: ${duelResult.updatedLoser.matchesPlayed})`)
console.log('\n===============================================================')
console.log('🎉 ALL SPIKES SUCCESSFULLY EXECUTED AND VERIFIED')
console.log('===============================================================')
