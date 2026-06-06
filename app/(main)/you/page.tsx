import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import YouClient, { type SavedCombination, type WeekWearEntry } from './YouClient'

export const dynamic = 'force-dynamic'

interface RawWearLogRow {
  col: Array<{
    fragrance_id: string | null
    frag: Array<{ brand: string; name: string }>
  }> | {
    fragrance_id: string | null
    frag: { brand: string; name: string } | Array<{ brand: string; name: string }> | null
  } | null
}

export default async function YouPage() {
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)

  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return <YouClient state="signed-out" />
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  // Three parallel fetches — RLS enforces user isolation on all three
  const [
    { data: savesRaw, error: savesError },
    { data: wearRaw },
    { count: ownedCount },
  ] = await Promise.all([
    supabase
      .from('layering_combinations')
      .select(`
        id,
        name,
        occasion,
        created_at,
        base_sprays,
        top_sprays,
        base_frag:fragrances!base_fragrance_id(brand, name),
        top_frag:fragrances!top_fragrance_id(brand, name)
      `)
      .eq('is_saved', true)
      .order('created_at', { ascending: false }),
    supabase
      .from('wear_logs')
      .select('col:collections!wear_logs_collection_id_fkey(fragrance_id, frag:fragrances!collections_fragrance_id_fkey(brand, name))')
      .gte('logged_at', sevenDaysAgo),
    supabase
      .from('collections')
      .select('id', { count: 'exact', head: true }),
  ])

  // Supabase returns multi-FK joins as arrays; unwrap to single object or null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const saves: SavedCombination[] = (savesRaw ?? [] as any[]).map((row: any) => ({
    id: row.id,
    name: row.name,
    occasion: row.occasion,
    created_at: row.created_at,
    base_sprays: row.base_sprays,
    top_sprays: row.top_sprays,
    base_frag: Array.isArray(row.base_frag)
      ? (row.base_frag[0] ?? null)
      : (row.base_frag ?? null),
    top_frag: Array.isArray(row.top_frag)
      ? (row.top_frag[0] ?? null)
      : (row.top_frag ?? null),
  }))

  // Group wear_logs by fragrance_id, counting occurrences in the last 7 days
  const wearMap = new Map<string, WeekWearEntry>()
  for (const raw of (wearRaw ?? []) as unknown as RawWearLogRow[]) {
    const col = Array.isArray(raw.col) ? raw.col[0] : raw.col
    if (!col?.fragrance_id) continue
    const frag = Array.isArray(col.frag) ? col.frag[0] : col.frag
    if (!frag?.brand || !frag?.name) continue
    const entry = wearMap.get(col.fragrance_id)
    if (entry) {
      entry.count++
    } else {
      wearMap.set(col.fragrance_id, {
        fragrance_id: col.fragrance_id,
        brand: frag.brand,
        name: frag.name,
        count: 1,
      })
    }
  }
  const weekWear: WeekWearEntry[] = [...wearMap.values()].sort((a, b) => b.count - a.count)

  return (
    <YouClient
      state="signed-in"
      email={session.user.email ?? ''}
      saves={saves}
      fetchError={savesError?.message ?? null}
      weekWear={weekWear}
      ownedCount={ownedCount ?? 0}
    />
  )
}
