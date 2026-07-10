'use client'

import { useEffect, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import posthog from '@/lib/posthog'
import { getBrandedRouteInfo, resolveCanonicalPathname } from '@/lib/rebrand'

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
      const brandedInfo = getBrandedRouteInfo(pathname)
      posthog.capture('page_view', {
        url,
        pathname,
        canonical_pathname: resolveCanonicalPathname(pathname),
        branded_route: brandedInfo?.visibleLabel ?? null,
        branded_status: brandedInfo?.status ?? null,
        analytics_alias: brandedInfo?.analyticsAlias ?? null,
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
