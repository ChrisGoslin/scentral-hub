import Link from 'next/link'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

type TrailRow = {
  id: string
  title: string
  hook: string
  slug: string
}

type ProgressRow = {
  trail_id: string
  last_step: number
  completed_at: string | null
}

export default async function TrailsPage() {
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)

  const { data: trails } = await supabase
    .from('trails')
    .select('id, title, hook, slug')
    .eq('published', true)
    .order('created_at', { ascending: true })

  const { data: { user } } = await supabase.auth.getUser()

  let progressByTrail: Record<string, ProgressRow> = {}
  if (user && trails && trails.length > 0) {
    const { data: progress } = await supabase
      .from('trail_progress')
      .select('trail_id, last_step, completed_at')
      .eq('user_id', user.id)
      .in('trail_id', trails.map((t: TrailRow) => t.id))

    progressByTrail = (progress ?? []).reduce((acc: Record<string, ProgressRow>, row: ProgressRow) => {
      acc[row.trail_id] = row
      return acc
    }, {})
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 96px)' }}>
      <div style={{ padding: '32px 20px 8px' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          Guided Paths
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 34, color: 'var(--text)', marginTop: 6, lineHeight: 1.15 }}>
          Trails
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-muted)', marginTop: 8, maxWidth: 480 }}>
          Slow, curious walks through how fragrance actually works — not threads, not feeds. One idea per screen.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 16,
          padding: '24px 20px',
        }}
      >
        {(trails ?? []).map((trail: TrailRow) => {
          const progress = progressByTrail[trail.id]
          const isComplete = !!progress?.completed_at
          const isStarted = !!progress && !isComplete

          return (
            <Link
              key={trail.id}
              href={`/trails/${trail.slug}`}
              style={{
                display: 'block',
                borderRadius: 'var(--r-card)',
                border: '1px solid var(--line)',
                background: 'var(--surface)',
                boxShadow: 'var(--shadow-object)',
                padding: 24,
                textDecoration: 'none',
                transition: `transform var(--motion-responsive), box-shadow var(--motion-responsive)`,
              }}
            >
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--accent)' }}>
                {isComplete ? 'Completed' : isStarted ? `Continue — step ${progress.last_step + 1}` : 'Start'}
              </p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 24, color: 'var(--text)', marginTop: 8, lineHeight: 1.2 }}>
                {trail.title}
              </h2>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-muted)', marginTop: 10, lineHeight: 1.5 }}>
                {trail.hook}
              </p>
            </Link>
          )
        })}
      </div>

      {(!trails || trails.length === 0) && (
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-muted)' }}>
            No trails published yet.
          </p>
        </div>
      )}
    </div>
  )
}
