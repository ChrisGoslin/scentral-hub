import test from 'node:test'
import assert from 'node:assert/strict'

import {
  divineTarotPersona,
  TAROT_SOMMELIER_DECK,
} from '../../lib/personas-tarot.ts'
import {
  filterAndRankShelfBottles,
  parseSupplierOrderText,
  CATEGORY_LENS_CONFIG,
} from '../../lib/shelf-multi-lens.ts'

test('divineTarotPersona accurately resolves Tarot Sommelier Archetype', () => {
  const reading1 = divineTarotPersona({
    sanctuary: 'archive',
    projection: 'intimate_whisper',
    anchor: 'paper_cedar',
  })
  assert.equal(reading1.id, 'velvet_intellectual')
  assert.equal(reading1.arcanaNumber, 'IX')
  assert.ok(reading1.tarotNarrative.reading.includes('atmosphere'))

  const reading2 = divineTarotPersona({
    sanctuary: 'midnight_streets',
    projection: 'intoxicating_mystery',
    anchor: 'amber_smoke',
  })
  assert.equal(reading2.id, 'midnight_alchemist')
  assert.equal(reading2.element, 'Smoke')

  const reading3 = divineTarotPersona({
    sanctuary: 'greenhouse',
    projection: 'confident_punctuation',
    anchor: 'citrus_neroli',
  })
  assert.equal(reading3.id, 'solar_minimalist')
  assert.equal(reading3.element, 'Solar')
})

test('filterAndRankShelfBottles accurately filters by category lenses and lifecycle states', () => {
  const sampleBottles = [
    {
      id: '1',
      name: 'Oud Wood',
      brand: 'Tom Ford',
      family: 'Woody',
      lifecycleStatus: 'owned',
      overallRank: 1,
      categoryRanks: { top_ouds: 1 },
      imageUrl: null,
    },
    {
      id: '2',
      name: 'Neroli Portofino',
      brand: 'Tom Ford',
      family: 'Fresh & Citrus',
      lifecycleStatus: 'on_the_way',
      overallRank: 2,
      categoryRanks: { top_freshies: 1 },
      imageUrl: null,
    },
    {
      id: '3',
      name: 'Carnal Flower',
      brand: 'Frederic Malle',
      family: 'Floral',
      lifecycleStatus: 'tested_sample',
      sampleFillPct: 40,
      overallRank: 3,
      categoryRanks: { top_florals: 1 },
      imageUrl: null,
    },
  ]

  // Filter by Oud lens
  const ouds = filterAndRankShelfBottles(sampleBottles, 'top_ouds', 'all')
  assert.equal(ouds.length, 1)
  assert.equal(ouds[0].name, 'Oud Wood')

  // Filter by Lifecycle status: On the way
  const inbound = filterAndRankShelfBottles(sampleBottles, 'overall_top_20', 'on_the_way')
  assert.equal(inbound.length, 1)
  assert.equal(inbound[0].name, 'Neroli Portofino')
})

test('parseSupplierOrderText extracts inbound bottles from receipt lines', () => {
  const mockReceipt = `
    Order #849202 confirmed
    Baccarat Rouge 540 Extrait 70ml
    Grand Soir Eau de Parfum 70ml
    Total: $680.00
  `
  const parsed = parseSupplierOrderText(mockReceipt, 'LuckyScent')
  assert.equal(parsed.length, 2)
  assert.equal(parsed[0].name, 'Baccarat Rouge 540 Extrait 70ml')
  assert.equal(parsed[0].lifecycleStatus, 'on_the_way')
  assert.equal(parsed[0].purchaseVendor, 'LuckyScent')
})
