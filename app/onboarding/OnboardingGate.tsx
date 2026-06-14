'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export default function OnboardingGate() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Only fire inside the main app shell, not on landing page or onboarding itself
    // We also exclude /ritual pages as per instructions
    const isExcluded = pathname === '/' || pathname === '/onboarding' || pathname.startsWith('/ritual')
    
    if (!isExcluded) {
      const onboarded = localStorage.getItem('scentral_onboarded')
      if (!onboarded) {
        router.push('/onboarding')
      }
    }
  }, [pathname, router])

  return null
}
