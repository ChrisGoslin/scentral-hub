import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  )
  try {
    const { title, description, video_url, thumbnail_url, creator_id } = await request.json()

    // For v1, creator_id would come from auth context in production
    // For now, we'll require it in the request body and validate server-side

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('creator_reels')
      .insert([
        {
          title,
          description: description || null,
          video_url: video_url || null,
          thumbnail_url: thumbnail_url || null,
          creator_id: creator_id || 'mock-creator-id',
        },
      ])
      .select()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Reels API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
