import test from 'node:test'
import assert from 'node:assert/strict'

import {
  pairScentWithAcousticPlaylist,
  synthesizeMemoryDreamPrompt,
  createPinnedMemoryNote,
} from '../../lib/olfactory-synesthesia.ts'

test('pairScentWithAcousticPlaylist generates 3-stage acoustic song tracks by note volatility', () => {
  const pairing = pairScentWithAcousticPlaylist('Santal 33', 'Le Labo', 'Woody', 'Cardamom', 'Iris', 'Cedarwood')
  assert.equal(pairing.fragranceName, 'Santal 33')
  assert.equal(pairing.playlistTracks.length, 3)

  // Verify top, heart, and base stages
  assert.equal(pairing.playlistTracks[0].stage, 'Top Note Burst')
  assert.equal(pairing.playlistTracks[1].stage, 'Heart Evolution')
  assert.equal(pairing.playlistTracks[2].stage, 'Base Resonant Trail')
  assert.ok(pairing.playlistTracks[0].mood.includes('Cardamom'))
  assert.ok(pairing.spotifySearchQuery.includes('Le%20Labo'))
})

test('synthesizeMemoryDreamPrompt generates rich editorial prompts from user memories', () => {
  const userMemory = 'burning marshmallows on a boat in the middle of the caspian sea'
  const dream = synthesizeMemoryDreamPrompt(userMemory, 'By the Fireplace', 'Woody')

  assert.equal(dream.userMemoryText, userMemory)
  assert.ok(dream.recommendedImagePrompt.includes('caspian sea'))
  assert.ok(dream.recommendedImagePrompt.includes('tactile editorial photograph'))
  assert.ok(dream.synestheticColorPalette.includes('#A0622A')) // Amber
})

test('createPinnedMemoryNote creates an organically tilted pinned note with date', () => {
  const note = createPinnedMemoryNote('bottle_123', 'Leo the cat by rainy window', 'pet')
  assert.equal(note.bottleId, 'bottle_123')
  assert.equal(note.sketchType, 'pet')
  assert.ok(note.tapedAngleDeg >= -3.0 && note.tapedAngleDeg <= 3.0)
  assert.ok(note.createdDate.length > 0)
})
