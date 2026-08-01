import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Progress thresholds per AGENTS.md §1.
const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500]
const SWIPE_RIGHT_RESONANCE = 10

function levelForXp(xp: number): number {
  let level = 1
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1
  }
  return level
}

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10)
}

function isYesterday(dateStr: string, today: string): boolean {
  const d = new Date(dateStr + 'T00:00:00Z')
  const t = new Date(today + 'T00:00:00Z')
  const diffDays = Math.round((t.getTime() - d.getTime()) / 86400000)
  return diffDays === 1
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const anonId: string | undefined = body.anonId
    const fragranceId: string | undefined = body.fragranceId

    if (!anonId) {
      return NextResponse.json({ error: 'Missing anonId' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Missing Supabase Service Role Key or URL')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const supabaseAdmin = await createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    // --- Insert Wear Log ---
    let wearLogId = null
    if (fragranceId) {
      const { data: logData, error: logError } = await supabaseAdmin
        .from('wear_logs')
        .insert({
          user_id: anonId,
          fragrance_id: fragranceId,
          logged_at: new Date().toISOString(),
          rating: null
        })
        .select('id')
        .single()

      if (!logError && logData) {
        wearLogId = logData.id
      } else {
        console.error('wear_logs insert error:', logError)
      }
    }

    // --- Progress ---
    const { data: xpRow } = await supabaseAdmin
      .from('user_xp')
      .select('total_xp, level')
      .eq('anon_id', anonId)
      .maybeSingle()

    const newTotalXp = (xpRow?.total_xp ?? 0) + SWIPE_RIGHT_RESONANCE
    const newLevel = levelForXp(newTotalXp)

    const { error: xpError } = await supabaseAdmin
      .from('user_xp')
      .upsert({ anon_id: anonId, total_xp: newTotalXp, level: newLevel, updated_at: new Date().toISOString() })

    if (xpError) {
      console.error('user_xp upsert error:', xpError)
      return NextResponse.json({ error: xpError.message }, { status: 500 })
    }

    // --- Streak ---
    const { data: streakRow } = await supabaseAdmin
      .from('user_streaks')
      .select('current_streak, longest_streak, last_worn_date')
      .eq('anon_id', anonId)
      .maybeSingle()

    const today = todayUTC()
    let currentStreak = streakRow?.current_streak ?? 0
    const lastWornDate = streakRow?.last_worn_date ?? null

    if (lastWornDate === today) {
      // Already logged today — streak unchanged.
    } else if (lastWornDate && isYesterday(lastWornDate, today)) {
      currentStreak += 1
    } else {
      currentStreak = 1
    }

    const longestStreak = Math.max(streakRow?.longest_streak ?? 0, currentStreak)

    const { error: streakError } = await supabaseAdmin
      .from('user_streaks')
      .upsert({
        anon_id: anonId,
        current_streak: currentStreak,
        longest_streak: longestStreak,
        last_worn_date: today,
        updated_at: new Date().toISOString(),
      })

    if (streakError) {
      console.error('user_streaks upsert error:', streakError)
      return NextResponse.json({ error: streakError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      xp: { totalXp: newTotalXp, level: newLevel, gained: SWIPE_RIGHT_RESONANCE },
      streak: { current: currentStreak, longest: longestStreak },
      wearLogId,
    })
  } catch (error) {
    console.error('Spritz Log Wear API Error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 })
  }
}
