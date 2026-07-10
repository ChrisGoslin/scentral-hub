import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import type { SavedSchedule, ScheduleFragrance } from '@/app/(main)/schedule/types'

function getPublicSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}

function getSeason(): string {
  const m = new Date().getMonth() // 0–11
  if (m >= 2 && m <= 4) return 'Spring'
  if (m >= 5 && m <= 7) return 'Summer'
  if (m >= 8 && m <= 10) return 'Autumn'
  return 'Winter'
}

type RawScheduleRow = {
  id: string
  name: string
  occasion: string | null
  created_at: string
  morning_sprays: number | null
  midday_sprays: number | null
  evening_sprays: number | null
  morning_frag: ScheduleFragrance | ScheduleFragrance[] | null
  midday_frag: ScheduleFragrance | ScheduleFragrance[] | null
  evening_frag: ScheduleFragrance | ScheduleFragrance[] | null
}

async function fetchSchedule(id: string): Promise<SavedSchedule | null> {
  const { data, error } = await getPublicSupabase()
    .from('spritz_schedules')
    .select(`
      id, name, occasion, created_at,
      morning_sprays, midday_sprays, evening_sprays,
      morning_frag:fragrances!morning_fragrance_id(id, brand, name, phase, phase_label, family, projection, anosmia_risk, spritz_count, application_zone, lean),
      midday_frag:fragrances!midday_fragrance_id(id, brand, name, phase, phase_label, family, projection, anosmia_risk, spritz_count, application_zone, lean),
      evening_frag:fragrances!evening_fragrance_id(id, brand, name, phase, phase_label, family, projection, anosmia_risk, spritz_count, application_zone, lean)
    `)
    .eq('id', id)
    .single()

  if (error || !data) return null

  const row = data as unknown as RawScheduleRow

  const normalize = (v: ScheduleFragrance | ScheduleFragrance[] | null): ScheduleFragrance | null => {
    if (!v) return null
    if (Array.isArray(v)) return v[0] ?? null
    return v
  }

  return {
    id: row.id,
    name: row.name,
    occasion: row.occasion,
    created_at: row.created_at,
    morning_sprays: row.morning_sprays,
    midday_sprays: row.midday_sprays,
    evening_sprays: row.evening_sprays,
    morning_frag: normalize(row.morning_frag),
    midday_frag: normalize(row.midday_frag),
    evening_frag: normalize(row.evening_frag),
  }
}

// ─── Metadata ────────────────────────────────────────────────────────────────

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params
  const schedule = await fetchSchedule(id)

  if (!schedule) return { title: 'Ritual · nota.' }

  const title = `${schedule.name} · nota.`
  const description = schedule.occasion
    ? `A ${schedule.occasion} ritual formulated on nota. — your digital fragrance wardrobe.`
    : 'A ritual formulated on nota. — your digital fragrance wardrobe.'

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: '/images/landing-art.svg', width: 1200, height: 630, alt: title }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/images/landing-art.svg'],
    },
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const phaseLabels: Record<number, string> = { 1: 'Anchor', 2: 'Modulator', 3: 'Top' }
const phaseStyles: Record<number, { background: string; color: string }> = {
  1: { background: 'var(--accent)', color: 'var(--bg)' },
  2: { background: 'var(--surface-2)', color: 'var(--text)' },
  3: { background: 'var(--surface)', color: 'var(--text-muted)' },
}

function PhaseChip({ phase }: { phase: number }) {
  const style = phaseStyles[phase] ?? phaseStyles[3]
  return (
    <span
      style={{
        ...style,
        fontSize: 9,
        padding: '2px 8px',
        fontWeight: 700,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        borderRadius: 'var(--r-chip)',
        display: 'inline-block',
        whiteSpace: 'nowrap',
      }}
    >
      {phaseLabels[phase] ?? 'Note'}
    </span>
  )
}

type SlotRowProps = {
  label: string
  time: string
  frag: ScheduleFragrance | null
  sprays: number | null
  isLast?: boolean
}

function SlotRow({ label, time, frag, sprays, isLast }: SlotRowProps) {
  return (
    <div
      style={{
        padding: '20px 24px',
        borderBottom: isLast ? 'none' : '1px solid var(--line)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
          }}
        >
          {label} · {time}
        </span>
        {frag?.phase != null && <PhaseChip phase={frag.phase} />}
      </div>

      {frag ? (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <p
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                marginBottom: 4,
              }}
            >
              {frag.brand}
            </p>
            <p
              style={{
                fontSize: 19,
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontStyle: 'italic',
                color: 'var(--text)',
                margin: 0,
              }}
            >
              {frag.name}
            </p>
          </div>
          {sprays != null && (
            <span
              style={{
                fontSize: 11,
                color: 'var(--text-muted)',
                fontWeight: 700,
                whiteSpace: 'nowrap',
                paddingLeft: 16,
              }}
            >
              {sprays} {sprays === 1 ? 'spray' : 'sprays'}
            </span>
          )}
        </div>
      ) : (
        <p style={{ fontSize: 14, fontStyle: 'italic', color: 'var(--text-muted)', margin: 0 }}>—</p>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function RitualPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const scheduleData = await fetchSchedule(id)

  if (!scheduleData) notFound()

  // notFound() throws; cast narrows the type for the lines that follow
  const schedule = scheduleData as SavedSchedule

  const season = getSeason()
  const occasionLabel = schedule.occasion ?? 'every day'

  return (
    <div
      style={{
        background: 'var(--bg)',
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '40px 16px 96px',
      }}
    >
      <div style={{ width: '100%', maxWidth: 480 }}>

        {/* Wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 56 }}>
          <span
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: 22,
              color: 'var(--text)',
              lineHeight: 1,
            }}
          >
            nota.
          </span>
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: 999,
              background: 'var(--accent)',
              display: 'inline-block',
              flexShrink: 0,
            }}
          />
        </div>

        {/* Eyebrow */}
        <p
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            margin: '0 0 10px',
          }}
        >
          Ritual
        </p>

        {/* Schedule name */}
        <h1
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: 36,
            fontWeight: 400,
            color: 'var(--text)',
            margin: '0 0 6px',
            lineHeight: 1.05,
          }}
        >
          {schedule.name}
        </h1>

        {/* Occasion sub-label */}
        {schedule.occasion && (
          <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: '0 0 16px' }}>
            {schedule.occasion}
          </p>
        )}

        {/* AURA harmony context */}
        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--accent)',
            margin: 0,
            paddingBottom: 28,
            borderBottom: '1px solid var(--line)',
            marginBottom: 32,
          }}
        >
          Formulated for {occasionLabel} · {season}
        </p>

        {/* Fragrance slots */}
        <div
          style={{
            border: '1px solid var(--line)',
            background: 'var(--surface)',
            marginBottom: 40,
          }}
        >
          <SlotRow label="Morning" time="7:30 am" frag={schedule.morning_frag} sprays={schedule.morning_sprays} />
          <SlotRow label="Midday" time="12:30 pm" frag={schedule.midday_frag} sprays={schedule.midday_sprays} />
          <SlotRow label="Evening" time="6:00 pm" frag={schedule.evening_frag} sprays={schedule.evening_sprays} isLast />
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 18px' }}>
            Inspired? Compose your own.
          </p>
          <Link
            href="/lab"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--accent)',
              color: 'var(--ivory)',
              padding: '14px 36px',
              borderRadius: 'var(--r-btn)',
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              textDecoration: 'none',
            }}
          >
            Build your own ritual
          </Link>
        </div>
      </div>
    </div>
  )
}
