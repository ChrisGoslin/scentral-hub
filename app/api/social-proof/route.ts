import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const revalidate = 300 // Cache revalidation of 5 minutes

export async function POST(request: Request) {
  try {
    const { fragrance_ids } = await request.json()

    if (!fragrance_ids || !Array.isArray(fragrance_ids)) {
      return NextResponse.json({ error: 'fragrance_ids must be an array of strings' }, { status: 400 })
    }

    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)
    const { data, error } = await supabase.rpc('get_fragrance_social_proof', {
      fragrance_ids
    })

    if (error) {
      console.error('RPC Error:', error)
      return NextResponse.json({ error: 'Failed to retrieve social proof' }, { status: 500 })
    }

    // Map into Record<string, { ownerCount: number }>
    const result: Record<string, { ownerCount: number }> = {}
    
    // Pre-populate with all requested ids to ensure consistency
    fragrance_ids.forEach((id: string) => {
      result[id] = { ownerCount: 0 }
    })

    if (data) {
      data.forEach((row: { fragrance_id: string; owner_count: number }) => {
        result[row.fragrance_id] = { ownerCount: Number(row.owner_count) }
      })
    }

    return NextResponse.json(result)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
