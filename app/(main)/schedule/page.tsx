import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { createClient as createPublicClient } from '@supabase/supabase-js'
import ScheduleClient from './ScheduleClient'
import ProGate from '@/components/ui/ProGate'
import type { ScheduleFragrance, SavedSchedule } from './types'

export const dynamic = 'force-dynamic'

export default async function SchedulePage() {
  // Pro gate — remove this block when billing is ready
  return (
    <ProGate
      featureName="My Schedule"
      description="Plan which scent to wear morning, midday, and evening — and save your routines for the week. Especially useful once you have 5+ bottles and want to stop reaching for the same one."
      preview={
        <div className="px-4 pt-8 pb-4 space-y-4 pointer-events-none">
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28 }}>My Schedule</h1>
          <div className="grid grid-cols-3 gap-3">
            {['Morning', 'Midday', 'Evening'].map(t => (
              <div key={t} className="h-28 bg-[var(--surface)] border border-[var(--line)] rounded-xl" />
            ))}
          </div>
        </div>
      }
    />
  )

  /* ── Unreachable until ProGate isPro = true ─────────────────────────────
  // Load fragrances (public)
  const { data: fragrances } = await publicSupabase
    .from('fragrances')
    .select('id, brand, name, phase, phase_label, family, projection, anosmia_risk, spritz_count, application_zone, lean')
    .order('brand', { ascending: true })

  // Load saved schedules (auth required)
  // Use getUser() — validates with the auth server (not just the local cookie)
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  let savedSchedules: SavedSchedule[] = []

  if (user) {
    const { data } = await supabase
      .from('spritz_schedules')
      .select(`
        id, name, occasion, created_at,
        morning_sprays, midday_sprays, evening_sprays,
        morning_frag:fragrances!morning_fragrance_id(id, brand, name, phase, phase_label, family, projection, anosmia_risk, spritz_count, application_zone, lean),
        midday_frag:fragrances!midday_fragrance_id(id, brand, name, phase, phase_label, family, projection, anosmia_risk, spritz_count, application_zone, lean),
        evening_frag:fragrances!evening_fragrance_id(id, brand, name, phase, phase_label, family, projection, anosmia_risk, spritz_count, application_zone, lean)
      `)
      .order('created_at', { ascending: false })
      .limit(10)

    savedSchedules = (data ?? []).map((row: any) => ({
      id: row.id,
      name: row.name,
      occasion: row.occasion,
      created_at: row.created_at,
      morning_sprays: row.morning_sprays,
      midday_sprays: row.midday_sprays,
      evening_sprays: row.evening_sprays,
      morning_frag: Array.isArray(row.morning_frag) ? (row.morning_frag[0] ?? null) : (row.morning_frag ?? null),
      midday_frag: Array.isArray(row.midday_frag) ? (row.midday_frag[0] ?? null) : (row.midday_frag ?? null),
      evening_frag: Array.isArray(row.evening_frag) ? (row.evening_frag[0] ?? null) : (row.evening_frag ?? null),
    }))
  }

  return (
    <ScheduleClient
      fragrances={(fragrances ?? []) as ScheduleFragrance[]}
      savedSchedules={savedSchedules}
      isSignedIn={!!user}
    />
  )
  // ── end unreachable ─────────────────────────────────────────────────── */
}
