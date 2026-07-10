import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { collection_id } = await request.json()
    if (!collection_id) {
      return NextResponse.json({ error: 'collection_id required' }, { status: 400 })
    }

    const supabase = await createClient()
    
    const { error: insertError } = await supabase
      .from('wear_logs')
      .insert({ collection_id })

    if (insertError) throw insertError

    // Calculate streaks and totals
    const { data: logs, error: fetchError } = await supabase
      .from('wear_logs')
      .select('logged_at')
      .eq('collection_id', collection_id)
      .order('logged_at', { ascending: false })

    if (fetchError) throw fetchError

    const total_wears = logs.length
    let current_streak = 0

    if (total_wears > 0) {
      const uniqueDates = Array.from(new Set(logs.map(log => {
        // Just extract the YYYY-MM-DD part directly from ISO string
        return log.logged_at.split('T')[0]
      }))).sort().reverse() // sort descending

      const todayStr = new Date().toISOString().split('T')[0]
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]

      const checkDateStr = uniqueDates[0]

      if (checkDateStr === todayStr || checkDateStr === yesterdayStr) {
        current_streak = 1
        
        // Parse the start date to iterate backwards
        const currentIterDate = new Date(checkDateStr)

        for (let i = 1; i < uniqueDates.length; i++) {
          currentIterDate.setDate(currentIterDate.getDate() - 1)
          const expectedStr = currentIterDate.toISOString().split('T')[0]
          
          if (uniqueDates[i] === expectedStr) {
            current_streak++
          } else {
            break
          }
        }
      }
    }

    return NextResponse.json({ ok: true, current_streak, total_wears })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
