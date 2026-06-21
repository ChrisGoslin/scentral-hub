'use client'

import React, { useEffect } from 'react'
import { PostHogProvider } from 'posthog-js/react'
import posthog from '@/lib/posthog'
import { initTheme } from '@/lib/theme'

export function Providers({ children }: { children: React.ReactNode }) {
  const isPostHogEnabled = typeof window !== 'undefined' && !!process.env.NEXT_PUBLIC_POSTHOG_KEY

  useEffect(() => {
    // Initialize theme on app startup (before Analytics)
    initTheme()
  }, [])

  if (!isPostHogEnabled) {
    return <>{children}</>
  }

  return (
    <PostHogProvider client={posthog}>
      {children}
    </PostHogProvider>
  )
}
