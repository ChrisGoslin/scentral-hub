'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { getRouteExperienceMeta, inferPresenceMode } from '@/lib/experience'

export default function AmbientModeController() {
  const pathname = usePathname()

  useEffect(() => {
    const mode = inferPresenceMode()
    const routeMeta = getRouteExperienceMeta(pathname)
    const root = document.documentElement
    root.dataset.presenceMode = routeMeta.ambientEligible ? mode : 'morning-ritual'
    root.dataset.socialSuppression = routeMeta.socialSuppression ? 'true' : 'false'
  }, [pathname])

  return null
}
