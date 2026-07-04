// Minimal consent management for analytics

const CONSENT_KEY = 'nota_consent'

export type ConsentType = 'analytics' | 'error-tracking'

export interface ConsentState {
  analytics: boolean
  errorTracking: boolean
  timestamp: number
}

export function getConsent(): ConsentState | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem(CONSENT_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export function setConsent(consent: Partial<ConsentState>): void {
  if (typeof window === 'undefined') return
  const current = getConsent() || { analytics: false, errorTracking: false, timestamp: 0 }
  const updated = { ...current, ...consent, timestamp: Date.now() }
  localStorage.setItem(CONSENT_KEY, JSON.stringify(updated))
  window.dispatchEvent(new CustomEvent('consent-changed', { detail: updated }))
}

export function hasAnalyticsConsent(): boolean {
  return getConsent()?.analytics ?? false
}

export function hasErrorTrackingConsent(): boolean {
  return getConsent()?.errorTracking ?? false
}
