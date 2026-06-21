/**
 * Web Push Utilities for AnotherSense
 * No-auth push subscriptions via Web Push API + Supabase Edge Function
 */

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export async function subscribeToPush(): Promise<PushSubscription | null> {
  // Check browser support
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push notifications are not supported in this browser')
    return null
  }

  try {
    // Request notification permission
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      console.info('Notification permission denied by user')
      return null
    }

    // Get service worker registration
    const registration = await navigator.serviceWorker.ready
    if (!registration) throw new Error('Service Worker not ready')

    // Check if already subscribed
    const existingSubscription = await registration.pushManager.getSubscription()
    if (existingSubscription) {
      console.info('Already subscribed to push')
      return existingSubscription
    }

    // Validate VAPID key
    if (!VAPID_PUBLIC_KEY) {
      throw new Error('VAPID_PUBLIC_KEY is not configured')
    }

    // Subscribe to push
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    })

    // Send subscription to backend
    const response = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription),
    })

    if (!response.ok) {
      throw new Error(`Failed to save subscription: ${response.statusText}`)
    }

    return subscription
  } catch (error) {
    console.error('Failed to subscribe to push:', error)
    return null
  }
}
