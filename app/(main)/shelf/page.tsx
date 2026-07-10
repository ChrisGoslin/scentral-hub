import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import Button from '@/components/ui/Button'
import ShelfClient from './ShelfClient'
import type { ShelfSlot, ShelfFragrance, ShelfSource } from './types'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'Shelf | nota.',
  description: 'Arrange your physical scent shelf in nota. with patina, memory, and what is ready to wear next.',
}

const SHELF_SIZE = 20

const FRAGRANCE_COLUMNS = 'id, brand, name, family, image_url'

type ShelfItemRow = {
  id: string
  rank: number
  source: ShelfSource
  locked: boolean
  fragrance: ShelfFragrance | ShelfFragrance[] | null
}

function normalizeFragrance(f: ShelfItemRow['fragrance']): ShelfFragrance | null {
  if (!f) return null
  return Array.isArray(f) ? (f[0] ?? null) : f
}

function buildSlots(rows: { id: string; rank: number; source: ShelfSource; locked: boolean; fragrance: ShelfFragrance | null }[]): ShelfSlot[] {
  const byRank = new Map(rows.map(r => [r.rank, r]))
  const slots: ShelfSlot[] = []
  for (let rank = 1; rank <= SHELF_SIZE; rank++) {
    const row = byRank.get(rank)
    slots.push(
      row
        ? { itemId: row.id, rank, source: row.source, locked: row.locked, fragrance: row.fragrance }
        : { itemId: null, rank, source: null, locked: false, fragrance: null }
    )
  }
  return slots
}

/**
 * Seed shelf_items for a first-time visitor (zero rows so far):
 *   1. First 3 entries of the user's most recent noseprints.matches (status='current') → source='noseprint_match'
 *   2. Remaining slots (up to 10) filled from collections (status='owned'), ordered by
 *      shelf_tier ascending then affinity_score descending → source='manual'
 * Runs once — subsequent visits just read existing shelf_items.
 */
async function seedShelfItems(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<void> {
  const usedFragranceIds = new Set<string>()
  const toInsert: { user_id: string; fragrance_id: string; rank: number; source: ShelfSource }[] = []

  const { data: noseprint } = await supabase
    .from('noseprints')
    .select('matches')
    .eq('user_id', userId)
    .eq('status', 'current')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const matchIds = (noseprint?.matches ?? []).slice(0, 3) as string[]

  // Ensure noseprint matches exist in collections with 'tested' status (required by DB-003 trigger)
  if (matchIds.length > 0) {
    const matchesToInsert = matchIds.map(id => ({
      user_id: userId,
      fragrance_id: id,
      status: 'tested' as const,
    }))
    await supabase.from('collections').upsert(matchesToInsert, {
      onConflict: 'user_id,fragrance_id',
    })
  }

  matchIds.forEach((fragranceId, i) => {
    if (usedFragranceIds.has(fragranceId)) return
    usedFragranceIds.add(fragranceId)
    toInsert.push({ user_id: userId, fragrance_id: fragranceId, rank: i + 1, source: 'noseprint_match' })
  })

  if (toInsert.length < SHELF_SIZE) {
    const { data: owned } = await supabase
      .from('collections')
      .select('fragrance_id, shelf_tier, affinity_score')
      .eq('user_id', userId)
      .eq('status', 'owned')
      .order('shelf_tier', { ascending: true })
      .order('affinity_score', { ascending: false })

    for (const row of owned ?? []) {
      if (toInsert.length >= SHELF_SIZE) break
      if (!row.fragrance_id || usedFragranceIds.has(row.fragrance_id)) continue
      usedFragranceIds.add(row.fragrance_id)
      toInsert.push({
        user_id: userId,
        fragrance_id: row.fragrance_id,
        rank: toInsert.length + 1,
        source: 'manual',
      })
    }
  }

  if (toInsert.length === 0) return

  await supabase.from('shelf_items').insert(toInsert)

  await Promise.all([
    supabase.from('shelf_events').insert(
      toInsert.map(item => ({
        user_id: userId,
        fragrance_id: item.fragrance_id,
        event: 'added' as const,
        old_rank: null,
        new_rank: item.rank,
      }))
    ),
    supabase.from('interactions').insert(
      toInsert.map(item => ({
        user_id: userId,
        event_type: 'shelf_added',
        entity_type: 'fragrance',
        entity_id: item.fragrance_id,
        metadata: { rank: item.rank, source: item.source, seeded: true },
      }))
    ),
  ])
}

export default async function ShelfPage() {
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div
          style={{
            textAlign: 'center',
            maxWidth: 380,
            width: '100%',
            padding: 24,
            borderRadius: 20,
            border: '1px solid color-mix(in srgb, var(--accent) 20%, var(--line))',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
          }}
        >
          <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--text-muted)', margin: '0 0 10px' }}>
            Shelf
          </p>
          <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 24, color: 'var(--text)', marginBottom: 8 }}>
            Your bottles are waiting.
          </p>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: '22px', marginBottom: 16 }}>
            Sign in to arrange your Top 20. The first row is seeded from your scent identity and can be edited at any time.
          </p>
          <div style={{ display: 'grid', gap: 10 }}>
            <Link href="/login?next=/shelf" style={{ width: '100%' }}>
              <Button fullWidth>Sign in</Button>
            </Link>
            <Link href="/study" style={{ width: '100%' }}>
              <Button fullWidth variant="secondary">Enter The Study first</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const { count } = await supabase
    .from('shelf_items')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)

  if (!count || count === 0) {
    await seedShelfItems(supabase, user.id)
  }

  const { data: rows } = await supabase
    .from('shelf_items')
    .select(`id, rank, source, locked, fragrance:fragrances(${FRAGRANCE_COLUMNS})`)
    .eq('user_id', user.id)
    .order('rank', { ascending: true })

  const normalized = ((rows ?? []) as ShelfItemRow[]).map((r) => ({
    id: r.id,
    rank: r.rank,
    source: r.source as ShelfSource,
    locked: r.locked,
    fragrance: normalizeFragrance(r.fragrance),
  }))

  const slots = buildSlots(normalized)

  const topThree = normalized
    .filter(s => s.fragrance)
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 3)
    .map(s => ({
      id: s.fragrance!.id,
      name: s.fragrance!.name,
      brand: s.fragrance!.brand,
      family: s.fragrance!.family,
    }))

  return <ShelfClient slots={slots} topThree={topThree} />
}
