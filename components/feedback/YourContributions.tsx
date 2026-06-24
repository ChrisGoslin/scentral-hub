'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import LoadingShimmer from '@/components/ui/LoadingShimmer'

type FeedbackRow = {
  id: string
  status: 'in_review' | 'building' | 'captured'
  xp_awarded: number
  admin_note: string | null
}

export default function YourContributions() {
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<FeedbackRow[]>([])

  useEffect(() => {
    const anonId = localStorage.getItem('scentral_anon_id')
    if (!anonId) {
      setLoading(false)
      return
    }
    ;(async () => {
      try {
        const { data } = await createClient()
          .from('feedback')
          .select('id, status, xp_awarded, admin_note')
          .eq('session_id', anonId)
          .order('created_at', { ascending: false })
        setRows(data ?? [])
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (loading) return <LoadingShimmer variant="card" />

  if (rows.length === 0) {
    return (
      <div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--text)', marginBottom: 8 }}>
          Your Contributions
        </h2>
        <EmptyState headline="Nothing yet — spotted a bug or have an idea? Tap the ✦ button." />
      </div>
    )
  }

  const buildingCount = rows.filter(r => r.status === 'building').length
  const totalXp = rows.reduce((sum, r) => sum + (r.xp_awarded ?? 0), 0)
  const personalNote = rows.find(r => r.admin_note)?.admin_note ?? null

  return (
    <div className="flex flex-col gap-3">
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--text)' }}>
        Your Contributions
      </h2>

      <Card style={{ padding: '14px 16px', display: 'flex', gap: 24 }}>
        <div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--text)' }}>{buildingCount}</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>being built</p>
        </div>
        <div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--xp-color)' }}>{totalXp}</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>XP earned</p>
        </div>
      </Card>

      {personalNote && (
        <Card style={{ padding: '14px 16px', background: 'var(--aura-surface)', border: '1px solid var(--aura-border)' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 14, color: 'var(--text)', lineHeight: '20px' }}>
            “{personalNote}”
          </p>
        </Card>
      )}
    </div>
  )
}
