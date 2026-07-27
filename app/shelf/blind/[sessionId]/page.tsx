import { createClient } from '@/utils/supabase/server'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ sessionId: string }>
}

export async function generateMetadata(_props: PageProps): Promise<Metadata> {
  return {
    title: "That's what I prefer? — nota. Blind Ranking",
    description: 'A blind Top 10, ranked on notes and accords alone — no brand, no bottle, no bias.',
  }
}

type RevealedRow = {
  brand: string
  name: string
  placed_rank: number
}

export default async function BlindRankingSharePage({ params }: PageProps) {
  const { sessionId } = await params
  const supabase = await createClient()

  const { data: session } = await supabase
    .from('blind_ranking_sessions')
    .select('id, revealed_at')
    .eq('id', sessionId)
    .maybeSingle()

  if (!session?.revealed_at) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 20, color: 'var(--text)', textAlign: 'center' }}>
          This blind ranking hasn&apos;t been revealed yet.
        </p>
      </div>
    )
  }

  const { data: choices } = await supabase
    .from('blind_ranking_choices')
    .select('fragrance_id, placed_rank')
    .eq('session_id', sessionId)
    .order('placed_rank', { ascending: true })

  const fragranceIds = (choices ?? []).map(c => c.fragrance_id)
  const { data: fragrances } = fragranceIds.length
    ? await supabase.from('fragrances').select('id, brand, name').in('id', fragranceIds)
    : { data: [] as { id: string; brand: string; name: string }[] }

  const byId = new Map((fragrances ?? []).map(f => [f.id, f]))
  const revealed: RevealedRow[] = (choices ?? [])
    .map(c => {
      const f = byId.get(c.fragrance_id)
      return f ? { brand: f.brand, name: f.name, placed_rank: c.placed_rank } : null
    })
    .filter((f): f is RevealedRow => f !== null)

  return (
    <div style={{ padding: '32px 16px calc(5rem + env(safe-area-inset-bottom, 0px))', maxWidth: 480, margin: '0 auto' }}>
      <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 28, color: 'var(--text)', textAlign: 'center', marginBottom: 24 }}>
        That&apos;s what I prefer?
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {revealed.map(f => (
          <div
            key={`${f.placed_rank}-${f.name}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: 12,
              borderRadius: 'var(--r-card)',
              background: 'var(--surface)',
              border: '1px solid var(--line)',
            }}
          >
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 700, color: 'var(--xp-color)' }}>
              #{f.placed_rank}
            </span>
            <div>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{f.brand}</p>
              <p style={{ fontSize: 14, fontFamily: 'var(--font-display)', color: 'var(--text)' }}>{f.name}</p>
            </div>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 24 }}>
        Ranked blind, on notes and accords alone. Find your own Top 10 on nota.
      </p>
    </div>
  )
}
