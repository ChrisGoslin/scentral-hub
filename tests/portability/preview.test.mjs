import test from 'node:test'
import assert from 'node:assert/strict'
import { parseImportText, previewImportMatches } from '../../lib/portability/preview.js'

test('parses common collection headers and quoted notes', () => {
  const rows = parseImportText('House,Perfume,Status,Rating,Notes\nDior,Sauvage,Owned,4,"Easy, daily wear"')

  assert.deepEqual(rows, [{
    sourceRow: 2,
    brand: 'Dior',
    name: 'Sauvage',
    fullName: 'Dior Sauvage',
    status: 'Owned',
    rating: 4,
    notes: 'Easy, daily wear',
  }])
})

test('auto-selects only one exact catalogue match', () => {
  const rows = parseImportText('brand,name\nDior,Sauvage\nUnknown,Memory')
  const preview = previewImportMatches(rows, [
    { id: 'dior-sauvage', brand: 'Dior', name: 'Sauvage' },
    { id: 'dior-sauvage-elixir', brand: 'Dior', name: 'Sauvage Elixir' },
  ])

  assert.deepEqual(preview.summary, { total: 2, exact: 1, likely: 0, ambiguous: 0, unmatched: 1 })
  assert.equal(preview.results[0].selectedFragranceId, 'dior-sauvage')
  assert.equal(preview.results[1].selectedFragranceId, null)
})

test('keeps duplicate exact catalogue records for human review', () => {
  const rows = parseImportText('brand,name\nEscentric Molecules,Molecule 01')
  const preview = previewImportMatches(rows, [
    { id: 'one', brand: 'Escentric Molecules', name: 'Molecule 01' },
    { id: 'two', brand: 'Escentric Molecules', name: 'Molecule 01' },
  ])

  assert.equal(preview.results[0].outcome, 'ambiguous')
  assert.equal(preview.results[0].selectedFragranceId, null)
})
