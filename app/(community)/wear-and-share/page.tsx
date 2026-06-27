import { Metadata } from 'next'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import EmptyState from '@/components/ui/EmptyState'
import Link from 'next/link'
import WearAndShareClient from './WearAndShareClient'

export const metadata: Metadata = {
  title: 'The Strip | BaseNote',
  description: 'Discover fragrance posts from the community. Share your scent experiences with others.',
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
          headline="Sign in to view the community"
          caption="Join BaseNote to share your fragrance experiences and connect with other enthusiasts."
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
    <div style={{ background: 'var(--bg)', minHeight: '100dvh', paddingTop: '2rem' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '0 1rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--text)' }}>
            The Strip
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Discover fragrance experiences from the community
          </p>
        </div>

        <WearAndShareClient
          posts={posts || []}
          currentUserId={user.id}
          userLikedPostIds={userLikedPostIds}
        />

        {!posts || posts.length === 0 ? (
          <EmptyState
            headline="No posts yet"
            caption="Be the first to share your fragrance experience"
          />
        ) : null}
      </div>
    </div>
  )
}
