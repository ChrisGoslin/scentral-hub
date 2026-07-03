'use client'

import { useMemo } from 'react'
import AuraAdvisory from './AuraAdvisory'

interface ShelfTopFragrance {
  id: string
  name: string
  brand: string
  family: string | null
}

interface AuraShelfAdvisoryProps {
  topThree: ShelfTopFragrance[]
  className?: string
}

export default function AuraShelfAdvisory({ topThree, className = '' }: AuraShelfAdvisoryProps) {
  // Stable object identity keyed on the actual fragrance IDs, so AuraAdvisory's
  // effect (dependency: shelfContext) doesn't refire on every ShelfClient
  // re-render (drag state, etc.) when the top three haven't actually changed.
  const idKey = topThree.map(f => f.id).join(',')
  const shelfContext = useMemo(
    () => ({
      top_three: topThree.map(f => ({ name: f.name, brand: f.brand, family: f.family ?? '' })),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [idKey]
  )

  if (topThree.length < 3) {
    return null
  }

  const families = topThree.map(f => f.family).filter((f): f is string => Boolean(f))
  if (families.length < 3) {
    return null
  }

  const isConverged =
    families.some((fam, i) => families.some((other, j) => i < j && other.includes(fam.split(' ')[0]))) ||
    families.every(fam => fam.toLowerCase().includes('amber'))

  if (!isConverged) {
    return null
  }

  return (
    <AuraAdvisory
      fragranceId={topThree[0].id}
      contextType="shelf"
      shelfContext={shelfContext}
      className={className}
    />
  )
}
