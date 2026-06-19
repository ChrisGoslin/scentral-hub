'use client'

import React from 'react'
import { PostHogProvider } from 'posthog-js/react'
import posthog from '@/lib/posthog'

export function Providers({ children }: { children: React.ReactNode }) {
  const isPostHogEnabled = typeof window !== 'undefined' && !!process.env.NEXT_PUBLIC_POSTHOG_KEY

  if (!isPostHogEnabled) {
    return <>{children}</>
  }

  return (
    <PostHogProvider client={posthog}>
      {children}
    </PostHogProvider>
  )
}
