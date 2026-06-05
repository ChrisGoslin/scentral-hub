import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Button from '@/components/ui/Button'
import SensoryAnatomy from '@/components/ui/SensoryAnatomy'
import SimilarFragrances from './SimilarFragrances'
import { cookies } from 'next/headers'

const PHASE_LABEL: Record<number, string> = {
  1: 'Anchor',
  2: 'Modulator',
  3: 'Top',
}

export default async function FragranceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)

  const { data, error } = await supabase
    .from('fragrances')
    .select('id, brand, name, phase, phase_label, family, projection, anosmia_risk, lean, rating, image_url, use_case, spritz_count, application_zone')
    .eq('id', id)
    .single()

  if (error || !data) {
    notFound()
  }

  const f = data
  const phaseLabel = PHASE_LABEL[f.phase] ?? f.phase_label

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Back nav */}
      <div className="px-4 pt-6 pb-2">
        <Link
          href="/collection"
          style={{ fontSize: 14, color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}
        >
          ‹ Collection
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
              background: 'var(--surface-2)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 6, padding: 16, textAlign: 'center',
            }}
          >
            <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {f.brand}
            </p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--text)', lineHeight: '20px' }}>
              {f.name}
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

        {/* Sensory Anatomy */}
        {f.application_zone && (
          <SensoryAnatomy zone={f.application_zone} />
        )}

        {/* Resonance — Find Similar */}
        <SimilarFragrances fragranceId={f.id} />

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
          <Button fullWidth>Use in Lab →</Button>
        </Link>
      </div>
    </div>
  )
}
