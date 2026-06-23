import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  )
  try {
    const { postId, userId, action } = await request.json()

    if (!postId || !userId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

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
