'use client'

import React, { useEffect } from 'react'
import { initDeferred } from '@/lib/posthog'
import { initTheme } from '@/lib/theme'

// Note: PostHog's React context provider (posthog-js/react) is intentionally
// NOT used here — nothing in the app calls usePostHog(), every call site
// imports the lazy `posthog` singleton from '@/lib/posthog' directly. Wrapping
// children in <PostHogProvider> would force-load the full posthog-js SDK
// synchronously on every route (including the landing page), which is the
// ~190KB unused-JS chunk this fix removes from the initial bundle.
export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize theme on app startup (before Analytics)
    initTheme()
    // Defer PostHog's SDK load until the browser is idle so it never
    // competes with LCP-critical work on first paint.
    initDeferred()
  }, [])

  return <>{children}</>
}
