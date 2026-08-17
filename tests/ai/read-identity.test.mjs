import test from 'node:test'
import assert from 'node:assert/strict'
import { parseReadIdentity } from '../../lib/ai/read-identity.js'

const validIdentity = {
  opening: 'Quiet things hold your attention longest.',
  noseprintName: 'Still Gravity',
  descriptor: 'You gravitate toward calm that reveals a hidden edge.',
  signals: [
    'You linger where warmth feels restrained.',
    'You notice atmosphere before spectacle.',
    'You return to contrasts that unfold slowly.',
  ],
  stretchNote: 'Try something brighter that keeps the same quiet depth.',
}

test('parseReadIdentity accepts the exact identity JSON contract', () => {
  assert.deepEqual(parseReadIdentity(JSON.stringify(validIdentity)), validIdentity)
})

test('parseReadIdentity accepts JSON inside a complete markdown fence', () => {
  const fenced = `\`\`\`json\n${JSON.stringify(validIdentity, null, 2)}\n\`\`\``

  assert.deepEqual(parseReadIdentity(fenced), validIdentity)
})

test('parseReadIdentity rejects missing and wrongly typed fields', () => {
  const { stretchNote: _missing, ...missingField } = validIdentity
  const wrongType = { ...validIdentity, signals: 'You linger.' }

  assert.equal(parseReadIdentity(JSON.stringify(missingField)), null)
  assert.equal(parseReadIdentity(JSON.stringify(wrongType)), null)
})

test('parseReadIdentity rejects signal arrays larger than the three-item contract', () => {
  const oversized = {
    ...validIdentity,
    signals: [...validIdentity.signals, 'You follow one signal too many.'],
  }

  assert.equal(parseReadIdentity(JSON.stringify(oversized)), null)
})

test('parseReadIdentity rejects oversized identity strings', () => {
  const oversized = { ...validIdentity, descriptor: 'x'.repeat(20_000) }

  assert.equal(parseReadIdentity(JSON.stringify(oversized)), null)
})

test('parseReadIdentity rejects invalid or prose-wrapped JSON', () => {
  assert.equal(parseReadIdentity('{"opening":'), null)
  assert.equal(parseReadIdentity(`Here is the result:\n${JSON.stringify(validIdentity)}`), null)
})
