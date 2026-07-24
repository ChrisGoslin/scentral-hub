import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient as createServerClient } from '@/utils/supabase/server'
import { buildLikeRequest } from '@/lib/security/likes'

export async function POST(request: NextRequest) {
  const supabase = await createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  )
  try {
    const cookieStore = await cookies()
    const authedSupabase = await createServerClient(cookieStore)
    const { data: { user }, error: authError } = await authedSupabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const likeRequest = buildLikeRequest(body, user.id)

    if (!likeRequest) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { postId, action, userId } = likeRequest

    if (action === 'like') {
      const { data, error } = await supabase
        .from('post_likes')
        .insert([{ post_id: postId, user_id: userId }])
        .select()

      if (error) {
        if (error.code === '23505') {
          // Unique constraint violation (already liked)
          return NextResponse.json(
            { error: 'Already liked' },
            { status: 409 }
          )
        }
        throw error
      }

      return NextResponse.json({ success: true, data })
    } else if (action === 'unlike') {
      const { data, error } = await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId)
        .select()

      if (error) throw error

      return NextResponse.json({ success: true, data })
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Like API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
