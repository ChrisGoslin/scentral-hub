export function isAuthorizedPushBroadcast(request, broadcastSecret) {
  if (!broadcastSecret) return false

  return request.headers.get('x-push-broadcast-secret') === broadcastSecret
}
