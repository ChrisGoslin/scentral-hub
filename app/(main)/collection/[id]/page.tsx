import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Button from '@/components/ui/Button'
import SensoryAnatomy from '@/components/ui/SensoryAnatomy'
import SimilarFragrances from './SimilarFragrances'
import InspiredByClones from './InspiredByClones'
import LogWearButton from './LogWearButton'
import { cookies } from 'next/headers'

const PHASE_LABEL: Record<number, string> = {
  1: 'Anchor',
  2: 'Modulator',
  3: 'Top',
}

const SEASON_CHIP: Record<string, string> = {
  'High Heat':     '☀️ Summer',
  'All-Year':      '📅 All year',
  'Winter/Fall':   '🍂 Winter',
  'Spring/Summer': '🌸 Spring',
}

const LONGEVITY_CHIP: Record<string, string> = {
  'Beast Mode': '🔥 Lasts all day',
  'Strong':     '💪 Long-lasting',
  'Moderate':   '⏱ A few hours',
  'Soft':       '🌤 Light wear',
  'Light':      '🌤 Light wear',
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

import { getBrandEmoji } from '@/lib/brandEmoji'

export default async function FragranceDetailPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ id: string }>
  searchParams: Promise<{ from?: string }>
}) {
  const { id } = await params
  const { from } = await searchParams
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)

  const [{ data, error }, { data: collectionRow }] = await Promise.all([
    supabase
      .from('fragrances')
      .select('id, brand, name, phase, phase_label, family, projection, anosmia_risk, lean, rating, image_url, use_case, spritz_count, application_zone, maturation, inspired_by, is_user_created, optimal_season')
      .eq('id', id)
      .single(),
    supabase
      .from('collections')
      .select('id, maceration_started_at, maceration_ready_at')
      .eq('fragrance_id', id)
      .maybeSingle(),
  ])

  if (error || !data) {
    notFound()
  }

  const f = data

  // Look up the reference fragrance this clone is inspired by (server-side, single extra query)
  let inspiredByRef: { id: string; brand: string; name: string } | null = null
  if (f.inspired_by) {
    const { data: refRow } = await supabase
      .from('fragrances')
      .select('id, brand, name')
      .ilike('full_name', f.inspired_by)
      .maybeSingle()
    inspiredByRef = refRow ?? null
  }

  let initialWears = 0
  let initialStreak = 0

  if (collectionRow?.id) {
    const { data: logs } = await supabase
      .from('wear_logs')
      .select('logged_at')
      .eq('collection_id', collectionRow.id)
      .order('logged_at', { ascending: false })

    if (logs) {
      initialWears = logs.length
      if (initialWears > 0) {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        let streakDate = new Date(today)
        let logIndex = 0

        const mostRecentWear = new Date(logs[0].logged_at)
        mostRecentWear.setHours(0, 0, 0, 0)

        // Streak counts if worn today OR yesterday
        if (mostRecentWear.getTime() === streakDate.getTime() || mostRecentWear.getTime() === streakDate.getTime() - 86400000) {
          initialStreak = 1
          streakDate = new Date(mostRecentWear)
          logIndex = 1
          streakDate.setDate(streakDate.getDate() - 1)

          while (logIndex < logs.length) {
            const logDate = new Date(logs[logIndex].logged_at)
            logDate.setHours(0, 0, 0, 0)

            if (logDate.getTime() === streakDate.getTime()) {
              initialStreak++
              streakDate.setDate(streakDate.getDate() - 1)
            } else if (logDate.getTime() < streakDate.getTime()) {
               break;
            }
            logIndex++
          }
        }
      }
    }
  }

  const phaseLabel = PHASE_LABEL[f.phase] ?? f.phase_label

  const goodForChips = [
    f.optimal_season ? SEASON_CHIP[f.optimal_season] : null,
    f.projection ? LONGEVITY_CHIP[f.projection] : null,
    f.use_case ? `📍 ${f.use_case.charAt(0).toUpperCase()}${f.use_case.slice(1)}` : null,
    f.lean ? `🎯 ${f.lean}` : null,
  ].filter((c): c is string => Boolean(c))

  const now = new Date()
  const readyAt = collectionRow?.maceration_ready_at ? new Date(collectionRow.maceration_ready_at) : null
  const startedAt = collectionRow?.maceration_started_at ? new Date(collectionRow.maceration_started_at) : null

  let maturationChip: 'maturing' | 'macerated' | 'recommended' | null = null
  if (readyAt && readyAt > now) {
    maturationChip = 'maturing'
  } else if (readyAt && readyAt <= now) {
    maturationChip = 'macerated'
  } else if (startedAt) {
    maturationChip = 'macerated'
  } else if (f.maturation) {
    maturationChip = 'recommended'
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Back nav */}
      <div className="px-4 pt-6 pb-2">
        <Link
          href={from === 'discover' ? "/discover" : "/collection"}
          style={{ fontSize: 14, color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}
        >
          ‹ {from === 'discover' ? 'Discover' : 'My Bottles'}
        </Link>
      </div>

      {/* Bottle image */}
      <div className="px-8 py-6 flex justify-center">
        {f.image_url ? (
          <div style={{ width: 200, height: 200, borderRadius: 'var(--r-card)', overflow: 'hidden', background: 'var(--surface-2)' }}>
            <img
              src={f.image_url}
              alt={`${f.brand} ${f.name}`}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
        ) : (
          <div
            style={{
              width: 200, height: 200,
              borderRadius: 'var(--r-card)',
              background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-2) 100%)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 8, padding: 16, textAlign: 'center',
            }}
          >
            <span style={{ fontSize: 48 }}>{getBrandEmoji(f.brand)}</span>
            <p style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 }}>
              {f.brand}
            </p>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="px-4 flex flex-col gap-5">
        <div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {f.brand}
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--text)', lineHeight: '32px', marginTop: 4 }}>
            {f.name}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
            {phaseLabel} · {f.family}
          </p>
        </div>

        {/* Rating */}
        {f.rating !== null && (
          <p style={{ fontSize: 14, color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>
            {f.rating}/10
          </p>
        )}

        {/* Maturation status */}
        {maturationChip === 'maturing' && readyAt && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontSize: 12, fontWeight: 500, color: 'var(--accent)',
            background: 'color-mix(in srgb, var(--accent) 12%, transparent)',
            borderRadius: 999, padding: '4px 10px', alignSelf: 'flex-start',
          }}>
            ⏳ Maturing · Ready {formatDate(collectionRow!.maceration_ready_at!)}
          </span>
        )}
        {maturationChip === 'macerated' && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontSize: 12, fontWeight: 500, color: 'var(--positive)',
            background: 'color-mix(in srgb, var(--positive) 12%, transparent)',
            borderRadius: 999, padding: '4px 10px', alignSelf: 'flex-start',
          }}>
            Macerated ✓
          </span>
        )}
        {maturationChip === 'recommended' && (
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Maceration: {f.maturation} recommended
          </p>
        )}

        {/* Metadata */}
        <div className="flex flex-col gap-2">
          {f.projection && (
            <div className="flex justify-between">
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Projection</span>
              <span style={{ fontSize: 13, color: 'var(--text)' }}>{f.projection}</span>
            </div>
          )}
          {f.application_zone && (
            <div className="flex justify-between">
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Apply to</span>
              <span style={{ fontSize: 13, color: 'var(--text)', textAlign: 'right', maxWidth: '60%' }}>{f.application_zone}</span>
            </div>
          )}
          {f.spritz_count && (
            <div className="flex justify-between">
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Sprays</span>
              <span style={{ fontSize: 13, color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>{f.spritz_count}</span>
            </div>
          )}
        </div>

        {/* Good for — context chips */}
        {goodForChips.length > 0 && (
          <div>
            <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: 8 }}>
              Good for
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
              {goodForChips.map(chip => (
                <span key={chip} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'var(--surface-2)',
                  border: '1px solid var(--line)',
                  borderRadius: 999,
                  padding: '6px 14px',
                  fontSize: 12,
                  color: 'var(--text-muted)',
                }}>
                  {chip}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Sensory Anatomy */}
        {f.application_zone && (
          <SensoryAnatomy zone={f.application_zone} />
        )}

        {/* Resonance — Find Similar */}
        <SimilarFragrances fragranceId={f.id} />

        {/* Inspired By — "Smells like" card */}
        {f.inspired_by && (
          <div style={{
            padding: '16px',
            background: 'var(--surface)',
            border: '1px solid color-mix(in srgb, var(--accent) 40%, transparent)',
            borderRadius: 'var(--r-card)',
          }}>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--accent)' }}>
              Smells like
            </p>
            {inspiredByRef ? (
              <Link href={`/collection/${inspiredByRef.id}`} style={{ textDecoration: 'none' }}>
                <p style={{ fontSize: 20, fontFamily: 'var(--font-display)', color: 'var(--text)', marginTop: 6, lineHeight: '24px' }}>
                  {f.inspired_by} →
                </p>
              </Link>
            ) : (
              <p style={{ fontSize: 20, fontFamily: 'var(--font-display)', color: 'var(--text)', marginTop: 6, lineHeight: '24px' }}>
                {f.inspired_by}
              </p>
            )}
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
              A fraction of the price — same DNA.
            </p>
          </div>
        )}

        {/* Clones — shown on reference fragrances (no rating, catalogue entry) */}
        {f.rating === null && f.is_user_created === false && (
          <InspiredByClones fragranceName={f.name} fragranceBrand={f.brand} fragranceId={f.id} from={from} />
        )}

        {/* Anosmia — inline pill only */}
        {f.anosmia_risk === 'High' && (
          <span
            title="High anosmia risk — wear in open environments and space from other high-ARR fragrances"
            style={{ fontSize: 10, color: 'var(--text-muted)', border: '1px solid var(--line)', background: 'var(--surface)', borderRadius: 999, padding: '2px 8px', display: 'inline-block', cursor: 'help' }}
          >
            ⚠ High ARR
          </span>
        )}

        {/* CTA */}
        <Link href="/layering">
          <Button fullWidth>Try layering this →</Button>
        </Link>
        {collectionRow?.id && (
          <LogWearButton collectionId={collectionRow.id} initialWears={initialWears} initialStreak={initialStreak} />
        )}
        <Link
          href="/discover"
          style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', display: 'block', padding: 8 }}
        >
          Back to Discover
        </Link>
      </div>
    </div>
  )
}
