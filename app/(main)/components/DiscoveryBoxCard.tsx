'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

interface Box {
  id: string
  name: string
  theme: string
  price_gbp: number | null
  fragrances: string[]
}

export default function DiscoveryBoxCard() {
  const [box, setBox] = useState<Box | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBox = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('discovery_boxes')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (!error && data) {
          setBox(data as Box)
        }
      } catch (err) {
        console.error('Failed to fetch box:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchBox()
  }, [])

  if (loading || !box) {
    return null
  }

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--r-card)',
      padding: '24px',
      marginBottom: 24,
    }}>
      <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 12px 0' }}>
        Discovery Box
      </p>
      <h3 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 20, color: 'var(--text)', margin: '0 0 6px 0' }}>
        {box.name}
      </h3>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 12px 0' }}>
        Theme: {box.theme}
      </p>
      <p style={{ fontSize: 13, color: 'var(--text)', margin: '0 0 16px 0' }}>
        {box.fragrances.length} premium fragrances
      </p>
      {box.price_gbp && (
        <p style={{ fontSize: 14, color: 'var(--accent)', fontWeight: 600, margin: '0 0 16px 0' }}>
          £{box.price_gbp.toFixed(2)}
        </p>
      )}
      <Link href="/waitlist" style={{ textDecoration: 'none' }}>
        <button style={{
          width: '100%',
          background: 'var(--accent)',
          color: 'var(--bg)',
          border: 'none',
          borderRadius: 6,
          padding: '12px 16px',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 160ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        onMouseEnter={(e) => {
          (e.target as HTMLButtonElement).style.opacity = '0.9'
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLButtonElement).style.opacity = '1'
        }}>
          Join Waitlist →
        </button>
      </Link>
    </div>
  )
}
