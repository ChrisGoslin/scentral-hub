export function buildLikeRequest(body, authUserId) {
  if (!authUserId) return null

  const postId = typeof body?.postId === 'string' ? body.postId.trim() : ''
  const action = body?.action === 'like' || body?.action === 'unlike' ? body.action : ''

  if (!postId || !action) return null

  return {
    postId,
    action,
    userId: authUserId,
  }
}
