import test from 'node:test'
import assert from 'node:assert/strict'

import {
  resolveConciergeQuery,
  recommendPartnerGift,
  generateInsuranceValuation,
} from '../../lib/scent-concierge.ts'
import {
  calculateDecantSplit,
  generateAwinAffiliateUrl,
} from '../../lib/trails-and-commerce.ts'

test('resolveConciergeQuery provides accurate weather-aware voice prescriptions', () => {
  const shelf = [
    {
      id: '1',
      name: 'Bleu de Chanel',
      brand: 'Chanel',
      family: 'Aromatic & Fougere',
      lifecycleStatus: 'owned',
      overallRank: 1,
      categoryRanks: {},
      imageUrl: null,
    },
    {
      id: '2',
      name: 'Oud Wood',
      brand: 'Tom Ford',
      family: 'Woody',
      lifecycleStatus: 'owned',
      overallRank: 2,
      categoryRanks: {},
      imageUrl: null,
    },
  ]

  const context = {
    queryText: 'What should I wear for my investor meeting this afternoon?',
    weather: { tempC: 21, humidityPct: 55, conditionDesc: 'Clear', isHumidOrRainy: false },
    occasionType: 'Work / Pitch',
    userShelf: shelf,
  }

  const rec = resolveConciergeQuery(context)
  assert.equal(rec.prescribedFragrance, 'Bleu de Chanel')
  assert.equal(rec.sprayCount, 4)
  assert.ok(rec.voiceResponseText.includes('Bleu de Chanel'))
})

test('recommendPartnerGift provides safe high-confidence recommendations', () => {
  const partnerShelf = [
    {
      id: '1',
      name: 'Santal 33',
      brand: 'Le Labo',
      family: 'Woody',
      lifecycleStatus: 'owned',
      overallRank: 1,
      categoryRanks: {},
      imageUrl: null,
    },
  ]

  const gift = recommendPartnerGift(partnerShelf)
  assert.equal(gift.recommendedFragrance, 'Grand Soir')
  assert.equal(gift.brand, 'Maison Francis Kurkdjian')
  assert.ok(gift.safeBlindBuyScore >= 90)
})

test('generateInsuranceValuation calculates collection totals and highest valued flacon', () => {
  const shelf = [
    { id: '1', name: 'Aventus', brand: 'Creed', family: 'Chypre', lifecycleStatus: 'owned', overallRank: 1, categoryRanks: {}, imageUrl: null },
    { id: '2', name: 'Santal 33', brand: 'Le Labo', family: 'Woody', lifecycleStatus: 'owned', overallRank: 2, categoryRanks: {}, imageUrl: null },
  ]

  const report = generateInsuranceValuation(shelf)
  assert.equal(report.totalBottleCount, 2)
  assert.equal(report.highestValuedBottle.brand, 'Creed')
  assert.equal(report.totalEstimatedValueUSD, 395 + 280)
})

test('calculateDecantSplit accurately calculates cost recovery and pricing per slot', () => {
  const split = calculateDecantSplit({
    bottleName: 'Tobacco Vanille 100ml',
    brand: 'Tom Ford',
    bottleVolumeMl: 100,
    bottleCost: 320,
    decantSizeMl: 10,
    slotsOffered: 8,
    vialCost: 2.50,
  })

  // 10ml juice = $32, vial = $2.50, recommended price = $38
  assert.equal(split.costPerDecantVial, 32)
  assert.equal(split.recommendedSlotPrice, 38)
  assert.equal(split.numberOfSlots, 8)
  // Total reclaimed = 8 * 38 = 304, host keeps 20ml for $16
  assert.equal(split.hostCostResidual, 16)
})

test('generateAwinAffiliateUrl formats valid compliant tracking URLs', () => {
  const url = generateAwinAffiliateUrl({
    publisherId: '2955445',
    merchantId: '12345',
    targetProductUrl: 'https://www.notino.ie/creed/aventus-eau-de-parfum/',
    fragranceId: 'creed-aventus',
  })

  assert.ok(url.includes('awinaffid=2955445'))
  assert.ok(url.includes('awinmid=12345'))
  assert.ok(url.includes('clickref=nota_shelf_creed-aventus'))
})
