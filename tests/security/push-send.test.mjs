import test from 'node:test'
import assert from 'node:assert/strict'
import { isAuthorizedPushBroadcast } from '../../lib/security/push.js'

test('isAuthorizedPushBroadcast denies anonymous callers', () => {
  const request = new Request('https://example.com/api/push/send', { method: 'POST' })

  assert.equal(isAuthorizedPushBroadcast(request, 'shared-secret'), false)
})

test('isAuthorizedPushBroadcast allows the shared secret header', () => {
  const request = new Request('https://example.com/api/push/send', {
    method: 'POST',
    headers: { 'x-push-broadcast-secret': 'shared-secret' },
  })

  assert.equal(isAuthorizedPushBroadcast(request, 'shared-secret'), true)
})
