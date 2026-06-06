'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

type CloneRow = {
  id: string
  brand: string
  name: string
  rating: number | null
}

type Props = {
  fragranceName: string
  fragranceBrand: string
}

export default function InspiredByClones({ fragranceName, fragranceBrand }: Props) {
  const [clones, setClones] = useState<CloneRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('fragrances')
      .select('id, brand, name, rating')
      .or(`inspired_by.ilike.%${fragranceName}%,inspired_by.ilike.%${fragranceBrand}%`)
      .then(({ data }: { data: CloneRow[] | null }) => {
        setClones(data ?? [])
        setLoading(false)
      })
  }, [fragranceName, fragranceBrand])

  if (loading || clones.length === 0) return null

  return (
    <div className="flex flex-col gap-2">
      <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
        Clones in your wardrobe
      </p>
      {clones.map(c => (
        <Link
          key={c.id}
          href={`/collection/${c.id}`}
          className="flex items-center justify-between px-3 py-2 rounded-[var(--r-card)] transition-colors hover:border-[var(--accent)]"
          style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}
        >
          <div>
            <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{c.brand}</p>
            <p style={{ fontSize: 14, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>{c.name}</p>
          </div>
          {c.rating !== null && (
            <span style={{ fontSize: 11, color: 'var(--accent)', fontVariantNumeric: 'tabular-nums', fontWeight: 700 }}>
              {c.rating}/10
            </span>
          )}
        </Link>
      ))}
    </div>
  )
}
