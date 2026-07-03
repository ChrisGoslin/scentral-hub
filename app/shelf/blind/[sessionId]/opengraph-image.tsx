import { ImageResponse } from 'next/og'
import { createClient } from '@/utils/supabase/server'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Colors hardcoded here (not CSS vars) — same precedent as app/opengraph-image.tsx:
// the OG image render context has no access to app/globals.css custom properties.
const BG = '#f7f3ee'
const TEXT = '#1a1714'
const TEXT_MUTED = '#7a6f63'
const GOLD = '#B8913A' // Parfumeur's Gold

export default async function BlindRankingOpengraphImage({
  params,
}: {
  params: Promise<{ sessionId: string }>
}) {
  const { sessionId } = await params

  // Public share surface — only render real identity for sessions that have
  // actually been revealed. Pre-reveal sessions render a teaser card instead,
  // so the blind mechanic can never leak via a guessed/shared URL.
  const supabase = await createClient()

  const { data: session } = await supabase
    .from('blind_ranking_sessions')
    .select('id, revealed_at')
    .eq('id', sessionId)
    .maybeSingle()

  if (!session?.revealed_at) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: BG,
            color: TEXT,
          }}
        >
          <div style={{ fontSize: 64, fontFamily: 'Georgia, serif', letterSpacing: '-0.02em' }}>
            That's what I prefer?
          </div>
          <div style={{ marginTop: 16, fontSize: 24, color: GOLD, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            A blind Top 10 on BaseNote
          </div>
        </div>
      ),
      { ...size }
    )
  }

  const { data: choices } = await supabase
    .from('blind_ranking_choices')
    .select('fragrance_id, placed_rank')
    .eq('session_id', sessionId)
    .order('placed_rank', { ascending: true })
    .limit(3)

  const fragranceIds = (choices ?? []).map(c => c.fragrance_id)
  const { data: fragrances } = fragranceIds.length
    ? await supabase.from('fragrances').select('id, brand, name').in('id', fragranceIds)
    : { data: [] as { id: string; brand: string; name: string }[] }

  const byId = new Map((fragrances ?? []).map(f => [f.id, f]))
  const topThree = (choices ?? [])
    .map(c => {
      const f = byId.get(c.fragrance_id)
      return f ? { ...f, rank: c.placed_rank } : null
    })
    .filter((f): f is { id: string; brand: string; name: string; rank: number } => f !== null)

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: BG,
          color: TEXT,
          padding: 60,
        }}
      >
        <div style={{ fontSize: 56, fontFamily: 'Georgia, serif', letterSpacing: '-0.02em', marginBottom: 36 }}>
          That's what I prefer?
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, width: '100%', maxWidth: 820 }}>
          {topThree.map(f => (
            <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 999,
                  background: GOLD,
                  color: BG,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  fontWeight: 700,
                }}
              >
                {f.rank}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: 18, color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {f.brand}
                </div>
                <div style={{ fontSize: 30, fontFamily: 'Georgia, serif' }}>{f.name}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 40, fontSize: 22, color: GOLD, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Blind-ranked on BaseNote
        </div>
      </div>
    ),
    { ...size }
  )
}
