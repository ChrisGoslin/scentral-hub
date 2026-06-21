// PostHog's bundled client (~80-90KB gzipped) is loaded lazily, deferred until
// after the browser is idle, so it never blocks LCP / inflates the initial
// route bundle on first paint. All callers below go through the same lazy
// singleton so PostHog is only ever initialized once.
import type posthogJs from 'posthog-js'

type PostHogClient = typeof posthogJs

let clientPromise: Promise<PostHogClient> | null = null

function loadClient(): Promise<PostHogClient> {
  if (!clientPromise) {
    clientPromise = import('posthog-js').then(({ default: posthog }) => {
      const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
      if (key && !posthog.__loaded) {
        posthog.init(key, {
          api_host: 'https://eu.i.posthog.com',
          person_profiles: 'identified_only',
          capture_pageview: false,
          persistence: 'localStorage',
          autocapture: false,
          session_recording: {
            maskAllInputs: false,
            maskInputFn: (text, element) => {
              if (element?.attributes?.getNamedItem('data-ph-no-mask')) return text;
              return text;
            },
          },
        })
      }
      return posthog
    })
  }
  return clientPromise
}

/** Schedules PostHog to load once the main thread is idle (or after a short
 * timeout on browsers without requestIdleCallback). Call once from a root
 * provider; safe to call multiple times. */
export function initDeferred() {
  if (typeof window === 'undefined' || !process.env.NEXT_PUBLIC_POSTHOG_KEY) return
  const schedule = (cb: () => void) =>
    'requestIdleCallback' in window
      ? (window as any).requestIdleCallback(cb, { timeout: 4000 })
      : setTimeout(cb, 1)
  schedule(() => { void loadClient() })
}

export function track(
  event: string,
  props?: Record<string, string | number | boolean>
) {
  if (process.env.NEXT_PUBLIC_POSTHOG_KEY && typeof window !== 'undefined') {
    void loadClient().then((posthog) => posthog.capture(event, props))
  }
}

/** Lazy proxy preserving the old `import posthog from '@/lib/posthog'` call
 * sites (`posthog.capture(...)`, `posthog.identify(...)`, etc.) without
 * pulling the real SDK into the synchronous import graph. */
const lazyPosthog = new Proxy({} as PostHogClient, {
  get(_target, prop) {
    return (...args: unknown[]) => {
      void loadClient().then((posthog) => (posthog as any)[prop](...args))
    }
  },
})

export default lazyPosthog
