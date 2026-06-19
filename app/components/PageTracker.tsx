'use client'

import { useEffect, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import posthog from '@/lib/posthog'

function Tracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
    if (pathname && key && typeof window !== 'undefined') {
      let url = window.origin + pathname
      if (searchParams && searchParams.toString()) {
        url = url + `?${searchParams.toString()}`
      }
      posthog.capture('page_view', {
        url,
        pathname,
      })
    }
  }, [pathname, searchParams])

  return null
}

export default function PageTracker() {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  if (!key) return null

  return (
    <Suspense fallback={null}>
      <Tracker />
    </Suspense>
  )
}
