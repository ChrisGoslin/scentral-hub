import posthog from 'posthog-js'

export const initAnalytics = () => {
  if (typeof window !== 'undefined') {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
    if (!key) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('PostHog key missing. Analytics disabled.')
      }
      return
    }

    posthog.init(key, {
      api_host: 'https://eu.posthog.com',
      capture_pageview: false, // We'll handle this manually or via Next.js router
      persistence: 'localStorage',
      autocapture: false, // Disable autocapture to ensure PII safety
      disable_session_recording: true, // Privacy guardrail
      respect_dnt: true,
    })

    if (process.env.NODE_ENV === 'development') {
      posthog.debug()
    }
  }
}

export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  // Privacy guardrail: remove potential PII from properties
  const safeProperties = { ...properties }
  if (safeProperties.email) delete safeProperties.email
  if (safeProperties.search_query) {
    safeProperties.search_query_length = String(safeProperties.search_query).length
    delete safeProperties.search_query
  }

  posthog.capture(eventName, safeProperties)
}

export const identifyPersona = (personaId: string, traits?: Record<string, any>) => {
  posthog.identify(personaId, traits)
}
