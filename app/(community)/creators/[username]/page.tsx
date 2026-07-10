import { Metadata } from 'next'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import EmptyState from '@/components/ui/EmptyState'
import CreatorProfileClient from './CreatorProfileClient'

export const metadata: Metadata = {
  title: 'Creator Profile | nota.',
  description: 'Discover creator fragrance content and recommendations.',
}

export const dynamic = 'force-dynamic'

interface Props {
  params: {
    username: string
  }
}

export default async function CreatorProfilePage({ params }: Props) {
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)

  // Fetch current user for follow check
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  // Fetch creator by username (using display_name from profiles)
  const { data: creatorProfile } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_url')
    .eq('display_name', decodeURIComponent(params.username))
    .single()

  if (!creatorProfile) {
    return (
      <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <EmptyState
          headline="Creator not found"
          caption={`No creator named "${params.username}" found.`}
        />
      </div>
    )
  }

  // Fetch creator's reels
  const { data: reels } = await supabase
    .from('creator_reels')
    .select('id, title, description, video_url, thumbnail_url, views, created_at')
    .eq('creator_id', creatorProfile.id)
    .order('created_at', { ascending: false })

  // Fetch creator's wear posts
  const { data: posts } = await supabase
    .from('wear_posts')
    .select(`
      id,
      user_id,
      fragrance_id,
      caption,
      wear_photo_url,
      likes,
      created_at,
      fragrances(id, brand, name, image_url)
    `)
    .eq('user_id', creatorProfile.id)
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100dvh', paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1rem' }}>
        {/* Creator Header */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '0.75rem', padding: '2rem', marginBottom: '2rem', textAlign: 'center' }}>
          {creatorProfile.avatar_url && (
            <img
              src={creatorProfile.avatar_url}
              alt={creatorProfile.display_name}
              style={{
                width: '4rem',
                height: '4rem',
                borderRadius: '50%',
                objectFit: 'cover',
                marginBottom: '1rem',
              }}
            />
          )}
          <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--text)' }}>
            {creatorProfile.display_name}
          </h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Fragrance Creator
          </p>

          <CreatorProfileClient
            creatorId={creatorProfile.id}
            currentUserId={currentUser?.id}
          />
        </div>

        {/* Reels Section */}
        {reels && reels.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text)' }}>
              Reels
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
              {reels.map((reel) => (
                <div
                  key={reel.id}
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--line)',
                    borderRadius: '0.75rem',
                    overflow: 'hidden',
                    cursor: 'pointer',
                  }}
                >
                  {reel.thumbnail_url && (
                    <div style={{ width: '100%', aspectRatio: '9 / 16', overflow: 'hidden' }}>
                      <img
                        src={reel.thumbnail_url}
                        alt={reel.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    </div>
                  )}
                  <div style={{ padding: '0.75rem' }}>
                    <p style={{ fontWeight: '500', color: 'var(--text)', fontSize: '0.85rem', lineHeight: '1.4' }}>
                      {reel.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Posts Section */}
        {posts && posts.length > 0 && (
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text)' }}>
              Recent Fragrance Posts
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {posts.map((post) => (
                <div
                  key={post.id}
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--line)',
                    borderRadius: '0.75rem',
                    overflow: 'hidden',
                  }}
                >
                  {post.wear_photo_url && (
                    <div style={{ width: '100%', aspectRatio: '1 / 1', overflow: 'hidden' }}>
                      <img
                        src={post.wear_photo_url}
                        alt="Post"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    </div>
                  )}
                  <div style={{ padding: '1rem' }}>
                    {post.fragrances && (() => {
                      const raw = post.fragrances as { brand: string; name: string } | { brand: string; name: string }[]
                      const fragrance = Array.isArray(raw) ? raw[0] : raw
                      if (!fragrance) return null
                      return (
                        <p style={{ color: 'var(--text)', fontWeight: '500', marginBottom: '0.5rem' }}>
                          {fragrance.brand} {fragrance.name}
                        </p>
                      )
                    })()}
                    {post.caption && (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        {post.caption}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
