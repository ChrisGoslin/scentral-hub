import posthog from 'posthog-js'

if (typeof window !== 'undefined') {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  if (key) {
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
}

export default posthog

export function track(
  event: string,
  props?: Record<string, string | number | boolean>
) {
  if (process.env.NEXT_PUBLIC_POSTHOG_KEY && typeof window !== 'undefined') {
    posthog.capture(event, props)
  }
}
