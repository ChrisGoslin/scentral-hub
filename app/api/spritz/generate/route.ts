import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient as createPublicClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/utils/supabase/server'
import { getPersonaById } from '@/lib/personas'
import { generateSpritzSchedule, type SpritzFragrance } from '@/lib/aura'

function getPublicSupabase() {
  return createPublicClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

const FRAGRANCE_COLS = 'id, brand, name, family, projection, application_zone, spritz_count, anosmia_risk, lean'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const personaId: string | undefined = body.personaId

    let pool: SpritzFragrance[] = []

    // Signed-in users: pull from their actual collection.
    const cookieStore = await cookies()
    const supabase = await createServerClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data } = await supabase
        .from('collections')
        .select(`fragrance_id, fragrances (${FRAGRANCE_COLS})`)
        .eq('user_id', user.id)
        .eq('status', 'owned')
        .limit(20)

      pool = (data ?? [])
        .map((row: any) => (Array.isArray(row.fragrances) ? row.fragrances[0] : row.fragrances))
        .filter(Boolean)
    }

    // Anonymous (or empty collection): fall back to persona-matched public fragrances.
    if (pool.length === 0) {
      const persona = personaId ? getPersonaById(personaId) : undefined
      const publicSupabase = getPublicSupabase()
      let query = publicSupabase.from('fragrances').select(FRAGRANCE_COLS).limit(12)

      if (persona?.discover_filters.families.length) {
        query = query.in('family', persona.discover_filters.families)
      }

      const { data } = await query
      pool = (data ?? []) as SpritzFragrance[]
    }

    if (pool.length === 0) {
      return NextResponse.json({ error: 'No fragrances available to schedule' }, { status: 404 })
    }

    const schedule = generateSpritzSchedule(pool)
    return NextResponse.json({ schedule })
  } catch (error: any) {
    console.error('Spritz Generate API Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
