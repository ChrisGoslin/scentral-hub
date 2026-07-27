import test from 'node:test'
import assert from 'node:assert/strict'
import {
  PORTABILITY_PREVIEW_LIMITS,
  buildPortabilityPreviewRequest,
  sanitizePreviewSearchTerm,
  validatePortabilityPreviewContentLength,
} from '../../lib/security/portability-preview.js'

test('buildPortabilityPreviewRequest rejects empty payloads', () => {
  const result = buildPortabilityPreviewRequest({})
  assert.equal(result.ok, false)
  assert.equal(result.error, 'Paste a list or load a CSV or TSV export first.')
})

test('buildPortabilityPreviewRequest rejects oversized previews', () => {
  const rows = Array.from({ length: PORTABILITY_PREVIEW_LIMITS.maxRows + 1 }, (_, index) => `Brand ${index},Name ${index}`)
  const result = buildPortabilityPreviewRequest({ text: rows.join('\n') })

  assert.equal(result.ok, false)
  assert.match(result.error, /rows/)
})

test('sanitizePreviewSearchTerm strips filter syntax', () => {
  assert.equal(sanitizePreviewSearchTerm(`L'Eau,(Test);100%`), 'L Eau  Test  100')
})

test('buildPortabilityPreviewRequest rejects null bytes', () => {
  const result = buildPortabilityPreviewRequest({ text: 'brand,name\0Dior,Sauvage' })
  assert.equal(result.ok, false)
  assert.equal(result.error, 'That preview contains invalid characters.')
})

test('validatePortabilityPreviewContentLength rejects oversized request bodies before JSON parsing', () => {
  const result = validatePortabilityPreviewContentLength(String(PORTABILITY_PREVIEW_LIMITS.maxRequestBytes + 1))
  assert.equal(result.ok, false)
  assert.match(result.error, /too large/)
})

test('validatePortabilityPreviewContentLength allows missing content length', () => {
  assert.deepEqual(validatePortabilityPreviewContentLength(null), { ok: true })
})

test('validatePortabilityPreviewContentLength rejects malformed content length', () => {
  const result = validatePortabilityPreviewContentLength('12 bytes')
  assert.equal(result.ok, false)
  assert.equal(result.error, 'The preview payload was not valid.')
})
