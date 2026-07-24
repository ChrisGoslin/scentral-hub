/* eslint-disable @typescript-eslint/no-explicit-any */

export interface TraceRow {
  id: string
  user_id: string
  body: string
}

export interface CollectionRow {
  id: string
  fragrance_id: string | number
  affinity_score: number | null
}

export interface ShelfEventRow {
  id: string
  fragrance_id: string | number
  event_type: string
  created_at: string
}

export function fetchUserTraces(supabase: any, userId: string): Promise<{ data: TraceRow[] | null; error: any }> {
  return supabase
    .from('traces')
    .select('id, user_id, body')
    .eq('user_id', userId) as any
}

export function fetchUserCollections(supabase: any, userId: string): Promise<{ data: CollectionRow[] | null; error: any }> {
  return supabase
    .from('collections')
    .select('id, fragrance_id, affinity_score')
    .eq('user_id', userId) as any
}

export function fetchShelfEvents(supabase: any, userId: string): Promise<{ data: ShelfEventRow[] | null; error: any }> {
  return supabase
    .from('shelf_events')
    .select('id, fragrance_id, event_type, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: true }) as any
}
