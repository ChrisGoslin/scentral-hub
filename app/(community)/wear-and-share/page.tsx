import { Metadata } from 'next'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import EmptyState from '@/components/ui/EmptyState'
import WearAndShareClient from './WearAndShareClient'

export const metadata: Metadata = {
  title: 'Wear & Share | nota.',
  description: 'A scrapbook of scent memories, tear-sheets, and presence notes from the nota. community.',
}

export const dynamic = 'force-dynamic'

export default async function WearAndSharePage() {
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)

  // Fetch current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <EmptyState
          headline="Sign in to enter the scrapbook"
          caption="Join nota. to save tear-sheets, wear notes, and scent memories with other curators."
        />
      </div>
    )
  }

  // Fetch posts with user and fragrance details
  const { data: posts, error } = await supabase
    .from('wear_posts')
    .select(`
      id,
      user_id,
      fragrance_id,
      caption,
      wear_photo_url,
      likes,
      created_at,
      profiles:user_id(display_name, avatar_url),
      fragrances:fragrance_id(id, brand, name, image_url)
    `)
    .order('created_at', { ascending: false })
    .limit(50)

  // Fetch user's likes
  const { data: userLikes } = await supabase
    .from('post_likes')
    .select('post_id')
    .eq('user_id', user.id)

  const userLikedPostIds = new Set(userLikes?.map((l) => l.post_id) || [])

  if (error) {
    return (
      <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <EmptyState
          headline="Couldn't load posts"
          caption={error.message}
        />
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100dvh', padding: '2rem 1rem 6rem' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '0 1rem' }}>
        <div className="surface-glass surface-patina" data-patina="rested" style={{ marginBottom: '1.5rem', borderRadius: 28, padding: '1.5rem' }}>
          <p style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 8px' }}>
            Wear & Share
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'clamp(2rem, 5vw, 3.1rem)', lineHeight: 1, margin: '0 0 10px', color: 'var(--text)' }}>
            The communal tear-sheet.
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.98rem', lineHeight: 1.7, margin: 0 }}>
            Save traces, watch quiet rituals accumulate, and let the room speak before the numbers do.
          </p>
        </div>

        <WearAndShareClient
          posts={posts || []}
          userLikedPostIds={userLikedPostIds}
        />

        {!posts || posts.length === 0 ? (
          <EmptyState
            headline="No posts yet"
            caption="Be the first curator to pin a wear note to the wall."
          />
        ) : null}
      </div>
    </div>
  )
}
