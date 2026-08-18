import test from 'node:test'
import assert from 'node:assert/strict'

import {
  calculateAuraResponse,
  AURA_STATE_MATRIX,
} from '../../lib/aura-companion.ts'

test('calculateAuraResponse transitions states accurately across interactions', () => {
  const idle = calculateAuraResponse('Woody', 'idle')
  assert.equal(idle.oscillationSpeedSec, 3.2)
  assert.equal(idle.ambientSoundFrequencyHz, 432)

  const hover = calculateAuraResponse('Fresh & Citrus', 'hover')
  assert.equal(hover.particleDensity, 48)
  assert.ok(hover.companionDialogueSnippet.includes('Inhaling'))

  const harmoniousLayer = calculateAuraResponse('Woody', 'layer', 92)
  assert.equal(harmoniousLayer.primaryColor, '#A0622A')
  assert.ok(harmoniousLayer.companionDialogueSnippet.includes('third accord'))

  const clashingLayer = calculateAuraResponse('Aquatic & Ozonic', 'layer', 35)
  assert.equal(clashingLayer.primaryColor, '#8A4A3B')
  assert.ok(clashingLayer.companionDialogueSnippet.includes('Warning'))
})
