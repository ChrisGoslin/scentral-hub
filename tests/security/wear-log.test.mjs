import test from 'node:test'
import assert from 'node:assert/strict'
import { buildWearLogInsert } from '../../lib/security/wear-log.js'

test('wear log insert uses the authenticated user instead of a forged user id', () => {
  const result = buildWearLogInsert({
    user_id: 'forged-user',
    fragrance_id: 'fragrance-123',
    worn_on: '2026-07-19',
    rating: 4,
  }, 'authenticated-user')

  assert.equal(result.ok, true)
  assert.equal(result.value.user_id, 'authenticated-user')
  assert.equal('user_id' in result.value && result.value.user_id === 'forged-user', false)
})

test('wear log insert rejects invalid ratings and dates', () => {
  assert.equal(buildWearLogInsert({ fragrance_id: 'f-1', rating: 6 }, 'user-1').ok, false)
  assert.equal(buildWearLogInsert({
    fragrance_id: 'f-1',
    rating: 4,
    worn_on: '2026-02-30',
  }, 'user-1').ok, false)
})
