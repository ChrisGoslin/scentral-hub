'use client'

// PostHog initialization now happens once, lazily, via initDeferred() in
// app/providers.tsx. This component previously called initAnalytics() from
// lib/analytics.ts, which re-initialized posthog-js a second time with
// conflicting session_recording settings and eagerly imported the SDK,
// duplicating the ~190KB chunk already loaded by Providers. Kept as a
// pass-through wrapper since several pages still import it as a layout node.
export default function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
