import test from 'node:test'
import assert from 'node:assert/strict'
import { buildLikeRequest } from '../../lib/security/likes.js'

test('buildLikeRequest ignores a forged userId and uses the authenticated user', () => {
  const result = buildLikeRequest(
    { postId: 'post-123', userId: 'forged-user', action: 'like' },
    'real-user-456',
  )

  assert.deepEqual(result, {
    postId: 'post-123',
    action: 'like',
    userId: 'real-user-456',
  })
})

test('buildLikeRequest rejects unauthenticated requests', () => {
  assert.equal(
    buildLikeRequest({ postId: 'post-123', userId: 'forged-user', action: 'like' }, null),
    null,
  )
})
