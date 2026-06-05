import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import YouClient, { type SavedCombination } from './YouClient'

export const dynamic = 'force-dynamic'

export default async function YouPage() {
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)

  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return <YouClient state="signed-out" />
  }

  // RLS enforces user isolation — no app-layer filter needed beyond the session
  const { data, error } = await supabase
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
    .order('created_at', { ascending: false })

  // Supabase returns multi-FK joins as arrays; unwrap to single object or null
  const saves: SavedCombination[] = (data ?? []).map(row => ({
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

  return (
    <YouClient
      state="signed-in"
      email={session.user.email ?? ''}
      saves={saves}
      fetchError={error?.message ?? null}
    />
  )
}
