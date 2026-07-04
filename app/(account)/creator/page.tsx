import { Metadata } from 'next'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import EmptyState from '@/components/ui/EmptyState'
import CreatorDashboardClient from './CreatorDashboardClient'

export const metadata: Metadata = {
  title: 'Creator Dashboard | nota.',
  description: 'Manage your creator profile and upload fragrance reels.',
}

export const dynamic = 'force-dynamic'

export default async function CreatorPage() {
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)

  // Fetch current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Check if user is a creator (stored in profiles table - is_creator column)
  // For v1, all authenticated users can be creators
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, avatar_url')
    .eq('id', user.id)
    .single()

  // Fetch creator reels
  const { data: reels, error: reelsError } = await supabase
    .from('creator_reels')
    .select('id, title, description, video_url, thumbnail_url, views, created_at')
    .eq('creator_id', user.id)
    .order('created_at', { ascending: false })

  // Fetch follower count (placeholder - will need followers table)
  const followerCount = 0

  if (reelsError) {
    return (
      <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <EmptyState
          headline="Couldn't load creator dashboard"
          caption={reelsError.message}
        />
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100dvh', paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--text)' }}>
            Creator Dashboard
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Welcome, {profile?.display_name || 'Creator'}
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid var(--line)' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
              Total Reels
            </p>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text)' }}>
              {reels?.length || 0}
            </p>
          </div>
          <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid var(--line)' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
              Followers
            </p>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text)' }}>
              {followerCount}
            </p>
          </div>
        </div>

        {/* Reel Management */}
        <CreatorDashboardClient reels={reels || []} creatorId={user.id} />
      </div>
    </div>
  )
}
