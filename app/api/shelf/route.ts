import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

type ShelfAction = 'add' | 'remove' | 'reorder' | 'replace'

type ShelfRequest =
  | { action: 'add'; fragranceId: string; rank: number }
  | { action: 'remove'; itemId: string }
  | { action: 'reorder'; order: { itemId: string; rank: number }[] }
  | { action: 'replace'; itemId: string; fragranceId: string }

const SHELF_SIZE = 20

export async function POST(req: Request) {
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: ShelfRequest
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const action: ShelfAction | undefined = (body as any)?.action
  if (!action) return NextResponse.json({ error: 'Missing action' }, { status: 400 })

  try {
    switch (action) {
      case 'add':
        return await handleAdd(supabase, user.id, body as Extract<ShelfRequest, { action: 'add' }>)
      case 'remove':
        return await handleRemove(supabase, user.id, body as Extract<ShelfRequest, { action: 'remove' }>)
      case 'reorder':
        return await handleReorder(supabase, user.id, body as Extract<ShelfRequest, { action: 'reorder' }>)
      case 'replace':
        return await handleReplace(supabase, user.id, body as Extract<ShelfRequest, { action: 'replace' }>)
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('[/api/shelf] error:', error?.message || error)
    return NextResponse.json({ error: 'Shelf mutation failed' }, { status: 500 })
  }
}

type SupabaseClient = Awaited<ReturnType<typeof createClient>>

async function logEvent(
  supabase: SupabaseClient,
  userId: string,
  fragranceId: string,
  event: 'added' | 'removed' | 'rank_changed' | 'replaced' | 'returned',
  oldRank: number | null,
  newRank: number | null
) {
  await supabase.from('shelf_events').insert({
    user_id: userId,
    fragrance_id: fragranceId,
    event,
    old_rank: oldRank,
    new_rank: newRank,
  })
}

async function logInteraction(
  supabase: SupabaseClient,
  userId: string,
  eventType: string,
  fragranceId: string,
  metadata: Record<string, unknown> = {}
) {
  await supabase.from('interactions').insert({
    user_id: userId,
    event_type: eventType,
    entity_type: 'fragrance',
    entity_id: fragranceId,
    metadata,
  })
}

async function handleAdd(
  supabase: SupabaseClient,
  userId: string,
  body: Extract<ShelfRequest, { action: 'add' }>
) {
  const { fragranceId, rank } = body
  if (!fragranceId || !rank || rank < 1 || rank > SHELF_SIZE) {
    return NextResponse.json({ error: 'fragranceId and a rank 1-10 are required' }, { status: 400 })
  }

  // Slot must be empty — the client drives "replace" as its own action when a slot is occupied.
  const { data: existing } = await supabase
    .from('shelf_items')
    .select('id')
    .eq('user_id', userId)
    .eq('rank', rank)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ error: 'Slot occupied — use replace' }, { status: 409 })
  }

  const { data: inserted, error } = await supabase
    .from('shelf_items')
    .insert({ user_id: userId, fragrance_id: fragranceId, rank, source: 'manual' })
    .select('id')
    .single()

  if (error) throw error

  await Promise.all([
    logEvent(supabase, userId, fragranceId, 'added', null, rank),
    logInteraction(supabase, userId, 'shelf_added', fragranceId, { rank }),
  ])

  return NextResponse.json({ itemId: inserted.id })
}

async function handleRemove(
  supabase: SupabaseClient,
  userId: string,
  body: Extract<ShelfRequest, { action: 'remove' }>
) {
  const { itemId } = body
  if (!itemId) return NextResponse.json({ error: 'itemId is required' }, { status: 400 })

  const { data: item, error: fetchError } = await supabase
    .from('shelf_items')
    .select('id, fragrance_id, rank')
    .eq('id', itemId)
    .eq('user_id', userId)
    .single()

  if (fetchError || !item) {
    return NextResponse.json({ error: 'Shelf item not found' }, { status: 404 })
  }

  const { error: deleteError } = await supabase
    .from('shelf_items')
    .delete()
    .eq('id', itemId)
    .eq('user_id', userId)

  if (deleteError) throw deleteError

  await Promise.all([
    logEvent(supabase, userId, item.fragrance_id, 'removed', item.rank, null),
    logInteraction(supabase, userId, 'shelf_removed', item.fragrance_id, { rank: item.rank }),
  ])

  return NextResponse.json({ ok: true })
}

async function handleReorder(
  supabase: SupabaseClient,
  userId: string,
  body: Extract<ShelfRequest, { action: 'reorder' }>
) {
  const { order } = body
  if (!Array.isArray(order) || order.length === 0) {
    return NextResponse.json({ error: 'order array is required' }, { status: 400 })
  }
  for (const entry of order) {
    if (!entry.itemId || !entry.rank || entry.rank < 1 || entry.rank > SHELF_SIZE) {
      return NextResponse.json({ error: 'Each order entry needs itemId and rank 1-10' }, { status: 400 })
    }
  }

  const { data: currentItems, error: fetchError } = await supabase
    .from('shelf_items')
    .select('id, fragrance_id, rank')
    .eq('user_id', userId)
    .in('id', order.map(o => o.itemId))

  if (fetchError) throw fetchError

  const currentById = new Map((currentItems ?? []).map(i => [i.id, i]))

  // Two-phase update avoids transient rank collisions on the (user_id, rank) space:
  // shift everything to negative ranks first, then to final ranks.
  for (const entry of order) {
    const current = currentById.get(entry.itemId)
    if (!current) continue
    await supabase
      .from('shelf_items')
      .update({ rank: -entry.rank })
      .eq('id', entry.itemId)
      .eq('user_id', userId)
  }

  for (const entry of order) {
    await supabase
      .from('shelf_items')
      .update({ rank: entry.rank })
      .eq('id', entry.itemId)
      .eq('user_id', userId)
  }

  const changed = order.filter(entry => {
    const current = currentById.get(entry.itemId)
    return current && current.rank !== entry.rank
  })

  await Promise.all(
    changed.flatMap(entry => {
      const current = currentById.get(entry.itemId)!
      return [
        logEvent(supabase, userId, current.fragrance_id, 'rank_changed', current.rank, entry.rank),
        logInteraction(supabase, userId, 'shelf_rank_changed', current.fragrance_id, {
          oldRank: current.rank,
          newRank: entry.rank,
        }),
      ]
    })
  )

  return NextResponse.json({ ok: true })
}

async function handleReplace(
  supabase: SupabaseClient,
  userId: string,
  body: Extract<ShelfRequest, { action: 'replace' }>
) {
  const { itemId, fragranceId } = body
  if (!itemId || !fragranceId) {
    return NextResponse.json({ error: 'itemId and fragranceId are required' }, { status: 400 })
  }

  const { data: item, error: fetchError } = await supabase
    .from('shelf_items')
    .select('id, fragrance_id, rank')
    .eq('id', itemId)
    .eq('user_id', userId)
    .single()

  if (fetchError || !item) {
    return NextResponse.json({ error: 'Shelf item not found' }, { status: 404 })
  }

  const outgoingFragranceId = item.fragrance_id

  const { error: updateError } = await supabase
    .from('shelf_items')
    .update({ fragrance_id: fragranceId, source: 'manual' })
    .eq('id', itemId)
    .eq('user_id', userId)

  if (updateError) throw updateError

  await Promise.all([
    logEvent(supabase, userId, outgoingFragranceId, 'returned', item.rank, null),
    logEvent(supabase, userId, fragranceId, 'replaced', item.rank, item.rank),
    logInteraction(supabase, userId, 'shelf_returned', outgoingFragranceId, { rank: item.rank }),
    logInteraction(supabase, userId, 'shelf_replaced', fragranceId, { rank: item.rank, replaced: outgoingFragranceId }),
  ])

  return NextResponse.json({ ok: true })
}
