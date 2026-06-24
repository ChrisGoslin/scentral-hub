'use client'

import { useEffect, useState } from 'react'

interface DryDownData {
  topPeakMins: number
  heartPeakMins: number
  baseSettleMins: number
  timeline: Array<{ minute: number; dominantClass: string }>
}

interface DryDownTimelineProps {
  fragranceId: string
}

export default function DryDownTimeline({ fragranceId }: DryDownTimelineProps) {
  const [data, setData] = useState<DryDownData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDryDown = async () => {
      try {
        const res = await fetch('/api/chemist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fragranceId }),
        })

        if (!res.ok) return
        const result = await res.json()
        setData(result.dryDown || null)
      } catch {
        // Silent failure
      } finally {
        setLoading(false)
      }
    }

    fetchDryDown()
  }, [fragranceId])

  if (loading || !data) {
    return null
  }

  // Build readable timeline string
  const parts: string[] = []
  if (data.topPeakMins > 0) {
    parts.push(`Top notes peak now`)
  }
  if (data.heartPeakMins > 0) {
    parts.push(`Heart settles ~${data.heartPeakMins} mins`)
  }
  if (data.baseSettleMins > 0) {
    parts.push(`Base anchors ~${data.baseSettleMins} hrs`)
  }

  const timelineText = parts.join(' → ')

  return (
    <p
      style={{
        fontSize: 12,
        color: 'var(--text-muted)',
        marginTop: 8,
        lineHeight: '1.4',
        fontFamily: 'var(--font-serif)',
        fontStyle: 'italic',
      }}
    >
      {timelineText}
    </p>
  )
}
