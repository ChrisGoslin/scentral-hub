'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import TemptationCard from './TemptationCard'
import { useTemptations } from '@/hooks/useTemptations'

/**
 * TemptationProvider
 *
 * Mounts a floating temptation card on eligible routes (/discover, /collection, /you).
 * Hard-wired to NOT render on /traces or /trails routes (see allowlist).
 * Uses CSS variables for styling. Fetches fragrance data on demand.
 */

interface Fragrance {
  id: string
  name: string
  brand: string
  image_url?: string
  family?: string
}

const ALLOWED_ROUTES = ['/discover', '/collection', '/you']
const BLOCKED_ROUTES = ['/traces', '/trails', '/read', '/shelf']

export default function TemptationProvider() {
  const pathname = usePathname()
  const [fragrance, setFragrance] = useState<Fragrance | null>(null)
  const [isLoadingFragrance, setIsLoadingFragrance] = useState(false)

  // Identity is derived server-side from the auth session cookie — the API route
  // returns { temptation: null } for signed-out visitors, which is harmless here.
  const { temptation, isLoading, updateStatus, dismiss } = useTemptations(true)

  // Fetch fragrance data when temptation changes
  useEffect(() => {
    if (!temptation?.fragrance_id) {
      setFragrance(null)
      return
    }

    const fetchFragrance = async () => {
      setIsLoadingFragrance(true)
      try {
        const res = await fetch(`/api/fragrances?id=${encodeURIComponent(temptation.fragrance_id)}`)
        if (!res.ok) throw new Error('Failed to fetch fragrance')
        const data = await res.json()
        const fragrances = data.similar_fragrances || []
        if (fragrances.length > 0) {
          setFragrance(fragrances[0])
        }
      } catch (err) {
        console.error('Failed to fetch fragrance:', err)
      } finally {
        setIsLoadingFragrance(false)
      }
    }

    fetchFragrance()
  }, [temptation?.fragrance_id])

  // Check if route is eligible
  const isAllowed = ALLOWED_ROUTES.some((route) => pathname?.startsWith(route))
  const isBlocked = BLOCKED_ROUTES.some((route) => pathname?.includes(route))
  const shouldRender = isAllowed && !isBlocked && temptation && fragrance && !isLoading && !isLoadingFragrance

  if (!shouldRender) {
    return null
  }

  const handleAction = async (action: 'viewed' | 'wishlisted' | 'bought') => {
    await updateStatus(action)
  }

  return (
    <TemptationCard
      fragrance={fragrance}
      onView={() => handleAction('viewed')}
      onBlindBuy={() => handleAction('bought')}
      onWishlist={() => handleAction('wishlisted')}
      onDismiss={dismiss}
    />
  )
}
