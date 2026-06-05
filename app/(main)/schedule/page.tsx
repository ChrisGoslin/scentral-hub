import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { createClient as createPublicClient } from '@supabase/supabase-js'
import ScheduleClient from './ScheduleClient'
import type { ScheduleFragrance, SavedSchedule } from './types'

export const dynamic = 'force-dynamic'

const publicSupabase = createPublicClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
)

export default async function SchedulePage() {
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
}
