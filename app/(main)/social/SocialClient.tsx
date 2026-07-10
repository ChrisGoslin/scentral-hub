'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Script from 'next/script'
import { createClient } from '@/utils/supabase/client'
import { track } from '@/lib/posthog'
import { getPersonaById } from '@/lib/personas'
import { formatDistanceToNow } from 'date-fns'
import Sheet from '@/components/ui/Sheet'

function StripCard({ post, isTopOfTheWeek = false }: { post: any; isTopOfTheWeek?: boolean }) {
  const p = post.persona_id ? getPersonaById(post.persona_id) : null
  const relativeTime = formatDistanceToNow(new Date(post.created_at)) + ' ago'

  return (
    <div style={{
      borderTop: '1px solid var(--accent)',
      borderBottom: '1px solid var(--line)',
      padding: '14px 16px 12px',
      background: 'var(--bg)',
      border: isTopOfTheWeek ? '2px solid var(--accent)' : undefined,
      borderRadius: isTopOfTheWeek ? 'var(--r-card)' : undefined,
      margin: isTopOfTheWeek ? '0 16px' : undefined,
    }}>
      {isTopOfTheWeek && (
        <p style={{ fontSize: 9, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: 8 }}>
          STRIP OF THE WEEK
        </p>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <span style={{ fontSize: 9, color: p?.ui_theme?.accentColor || 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {p ? p.name : 'Unknown Persona'}
        </span>
        <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>{relativeTime}</span>
      </div>
      <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 18, color: 'var(--text)', margin: '4px 0' }}>
        {post.fragrances?.name}
      </p>
      <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
        {post.fragrances?.brand}
      </p>
      {post.note && (
        <p style={{ fontSize: 13, color: 'var(--text)', fontStyle: 'italic', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: 10 }}>
          "{post.note}"
        </p>
      )}
      <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted)' }}>
        <button style={{ background: 'none', border: 'none', color: 'inherit', padding: 0 }}>♡ {post.likes ?? 0}</button>
        {/* We don't have wearCount per day easily available here without another query, mock or omit. Let's omit or mock "wearing today" for now, or just show 0 */}
        <span>◇ wearing today</span>
      </div>
    </div>
  )
}

interface TikTokVideo {
  handle: string
  videoId: string
}

interface YouTubeVideo {
  channel: string
  videoId: string | null
  title: string
  /** Used for the fallback card when no verified video ID exists */
  profileUrl: string
}

// Verified live via TikTok oEmbed — see AGENTS.md for verification notes if these ever 404.
const TIKTOK_VIDEOS: TikTokVideo[] = [
  { handle: 'jeremyfragrance',   videoId: '7560340527447690510' },
  { handle: 'thecologneboy',     videoId: '7574159132740259090' },
  { handle: 'fragranceknowledge', videoId: '7531852874146401567' },
  { handle: 'perfumerism',       videoId: '7579359133728509191' },
]

// Verified live via YouTube oEmbed. "The Dry Down podcast" has no confirmed channel — fallback card.
const YOUTUBE_VIDEOS: YouTubeVideo[] = [
  {
    channel: 'Jeremy Fragrance',
    videoId: 'YwVqmqgye9A',
    title: 'Top 10 Fragrances For Men',
    profileUrl: 'https://www.youtube.com/@jeremyfragrance',
  },
  {
    channel: 'Demi Rawling',
    videoId: 'LN1H0Pcnp1s',
    title: 'My Favorite Colognes For Men',
    profileUrl: 'https://www.youtube.com/@demirawling',
  },
  {
    channel: 'The Fragrance Channel',
    videoId: 'MlgELuE0beE',
    title: 'Reacting to Popular Fragrances For Men',
    profileUrl: 'https://www.youtube.com/@CourtneyRyan',
  },
  {
    channel: 'The Dry Down podcast',
    videoId: null,
    title: '',
    profileUrl: 'https://www.youtube.com/results?search_query=the+dry+down+podcast+fragrance',
  },
]

const scrollStripStyle: React.CSSProperties = {
  display: 'flex',
  gap: 12,
  overflowX: 'auto',
  paddingLeft: 16,
  paddingRight: 16,
  scrollbarWidth: 'none',
}

function TrailingSpacer() {
  return <div style={{ flexShrink: 0, width: 16 }} />
}

export default function SocialClient() {
  useEffect(() => {
    track('social_tab_viewed', { section: 'community_videos' })
  }, [])

  const [posts, setPosts] = useState<any[]>([])
  const [stripOfTheWeek, setStripOfTheWeek] = useState<any | null>(null)
  
  // Wear-to-Post Queue state
  const [queue, setQueue] = useState<any[]>([])
  const [activeQueueItem, setActiveQueueItem] = useState<any | null>(null)
  const [queueNote, setQueueNote] = useState('')
  const [isPosting, setIsPosting] = useState(false)

  useEffect(() => {
    // Load queue from localStorage
    try {
      const q = JSON.parse(localStorage.getItem('scentral_strip_queue') ?? '[]')
      if (q.length > 0) {
        setQueue(q)
        setActiveQueueItem(q[0])
        setQueueNote(q[0].note ?? '')
      }
    } catch {}

    async function fetchPosts() {
      const supabase = createClient()
      
      const { data: latest } = await supabase
        .from('wear_posts')
        .select('*, fragrances(brand, name)')
        .not('note', 'is', null)
        .order('created_at', { ascending: false })
        .limit(20)

      if (latest) setPosts(latest)

      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString()
      const { data: top } = await supabase
        .from('wear_posts')
        .select('*, fragrances(brand, name)')
        .not('note', 'is', null)
        .gte('created_at', weekAgo)
        .order('likes', { ascending: false })
        .limit(1)

      if (top && top.length > 0) {
        setStripOfTheWeek(top[0])
      }
    }
    fetchPosts()
  }, [])

  async function handlePostToStrip() {
    if (!activeQueueItem) return
    setIsPosting(true)
    try {
      const res = await fetch('/api/strip/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          anonId: localStorage.getItem('scentral_anon_id'),
          fragranceId: activeQueueItem.fragranceId,
          personaId: localStorage.getItem('scentral_persona'),
          note: queueNote.trim()
        })
      })
      if (res.ok) {
        const remaining = queue.slice(1)
        setQueue(remaining)
        localStorage.setItem('scentral_strip_queue', JSON.stringify(remaining))
        if (remaining.length > 0) {
          setActiveQueueItem(remaining[0])
          setQueueNote(remaining[0].note ?? '')
        } else {
          setActiveQueueItem(null)
        }
        // Optimistically reload page or refetch
        window.location.reload()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsPosting(false)
    }
  }

  function handleSkipQueue() {
    const remaining = queue.slice(1)
    setQueue(remaining)
    localStorage.setItem('scentral_strip_queue', JSON.stringify(remaining))
    if (remaining.length > 0) {
      setActiveQueueItem(remaining[0])
      setQueueNote(remaining[0].note ?? '')
    } else {
      setActiveQueueItem(null)
    }
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'var(--bg)',
        color: 'var(--text)',
        paddingTop: 24,
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 96px)',
        overscrollBehavior: 'contain',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {/* Header */}
      <div className="px-4" style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--text)', lineHeight: '32px' }}>
          Wear & Share
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
          Tear-sheets, field notes, and what the room is quietly wearing.
        </p>
      </div>

      {/* Wear & Share Feed */}
      <div style={{ marginBottom: 40 }}>
        {stripOfTheWeek && (
          <div style={{ marginBottom: 16 }}>
            <StripCard post={stripOfTheWeek} isTopOfTheWeek />
          </div>
        )}
        
        {posts.map(post => {
          if (stripOfTheWeek && post.id === stripOfTheWeek.id) return null
          return <StripCard key={post.id} post={post} />
        })}
      </div>

      {/* On TikTok */}
      <div style={{ marginBottom: 32 }}>
        <h2
          className="px-4"
          style={{
            fontSize: 13,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--text-muted)',
            marginBottom: 12,
          }}
        >
          On TikTok
        </h2>
        <div style={scrollStripStyle}>
          {TIKTOK_VIDEOS.map((video) => (
            <div
              key={video.handle}
              style={{
                width: 280,
                minWidth: 280,
                flexShrink: 0,
                background: 'var(--surface)',
                borderRadius: 'var(--r-card)',
                overflow: 'hidden',
                border: '1px solid var(--line)',
              }}
            >
              <blockquote
                className="tiktok-embed"
                cite={`https://www.tiktok.com/@${video.handle}/video/${video.videoId}`}
                data-video-id={video.videoId}
                style={{ maxWidth: 280, minWidth: 280, margin: 0 }}
              >
                <section />
              </blockquote>
            </div>
          ))}
          <TrailingSpacer />
        </div>
      </div>

      {/* On YouTube */}
      <div>
        <h2
          className="px-4"
          style={{
            fontSize: 13,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--text-muted)',
            marginBottom: 12,
          }}
        >
          On YouTube
        </h2>
        <div style={scrollStripStyle}>
          {YOUTUBE_VIDEOS.map((video) =>
            video.videoId ? (
              <div
                key={video.channel}
                style={{
                  width: 280,
                  height: 158,
                  flexShrink: 0,
                  borderRadius: 'var(--r-card)',
                  overflow: 'hidden',
                  border: '1px solid var(--line)',
                }}
              >
                <iframe
                  width="280"
                  height="158"
                  src={`https://www.youtube.com/embed/${video.videoId}`}
                  title={`${video.channel} — ${video.title}`}
                  frameBorder="0"
                  allowFullScreen
                  style={{ borderRadius: 'var(--r-card)' }}
                />
              </div>
            ) : (
              <a
                key={video.channel}
                href={video.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: 280,
                  height: 158,
                  flexShrink: 0,
                  borderRadius: 'var(--r-card)',
                  overflow: 'hidden',
                  border: '1px solid var(--line)',
                  background: 'var(--surface)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  textDecoration: 'none',
                  textAlign: 'center',
                  padding: 16,
                }}
              >
                <span style={{ fontSize: 15, fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
                  {video.channel}
                </span>
                <span style={{ fontSize: 12, color: 'var(--accent)' }}>Tap to explore on YouTube</span>
              </a>
            )
          )}
          <TrailingSpacer />
        </div>
      </div>

      {/* Wear-to-Post Queue Sheet */}
      <Sheet open={!!activeQueueItem} onClose={handleSkipQueue}>
        <div style={{ padding: '0 16px 16px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontStyle: 'italic', color: 'var(--text)', marginBottom: 8 }}>
            Pin this to Wear & Share?
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24 }}>
            Let another curator discover the note you left behind.
          </p>
          
          {activeQueueItem && (
            <div style={{ marginBottom: 24, background: 'var(--surface-2)', padding: 16, borderRadius: 'var(--r-card)', border: '1px solid var(--line)' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontStyle: 'italic', color: 'var(--text)', marginBottom: 4 }}>
                {activeQueueItem.fragranceName}
              </p>
              <textarea
                value={queueNote}
                onChange={e => setQueueNote(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--surface)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--r-card)',
                  padding: 12,
                  fontSize: 14,
                  color: 'var(--text)',
                  resize: 'none',
                  outline: 'none',
                  minHeight: 80,
                  marginTop: 12
                }}
              />
            </div>
          )}

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={handleSkipQueue}
              style={{ flex: 1, padding: 14, background: 'transparent', border: '1px solid var(--line)', borderRadius: 999, color: 'var(--text-muted)', fontWeight: 600, cursor: 'pointer' }}
            >
              Keep private
            </button>
            <button
              onClick={handlePostToStrip}
              disabled={isPosting}
              style={{ flex: 1, padding: 14, background: 'var(--accent)', border: 'none', borderRadius: 999, color: 'var(--bg)', fontWeight: 600, cursor: isPosting ? 'not-allowed' : 'pointer', opacity: isPosting ? 0.7 : 1 }}
            >
              {isPosting ? 'Pinning...' : 'Pin to Wear & Share →'}
            </button>
          </div>
        </div>
      </Sheet>

      <Script src="https://www.tiktok.com/embed.js" strategy="lazyOnload" />

      {/* Trending Right Now */}
      <TrendingSection />
    </div>
  )
}

const TRENDING_FRAGRANCES = [
  { name: 'Asad', brand: 'Lattafa', creator: '@extraitderayen', reason: "3.2M views this week. The winter oud moment." },
  { name: 'Hareem Al Sultan', brand: 'Khadlaj', creator: '@milanscents', reason: "1.8M views. 'Cheaper than Baccarat Red.'" },
  { name: '9PM', brand: 'Afnan', creator: '@danielrenefragrances', reason: "900K views. The everyman powerhouse." },
]

function TrendingSection() {
  const [resolvedIds, setResolvedIds] = useState<Record<string, string>>({})

  useEffect(() => {
    async function resolveIds() {
      const supabase = createClient()
      const { data } = await supabase
        .from('fragrances')
        .select('id, name')
        .in('name', TRENDING_FRAGRANCES.map(f => f.name))
      
      if (data) {
        const map: Record<string, string> = {}
        data.forEach(d => { map[d.name] = d.id })
        setResolvedIds(map)
      }
    }
    resolveIds()
  }, [])

  return (
    <div style={{ marginTop: 40 }}>
      <h2
        className="px-4"
        style={{
          fontSize: 13,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--text-muted)',
          marginBottom: 12,
        }}
      >
        Trending Right Now
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '0 16px' }}>
        {TRENDING_FRAGRANCES.map(tf => {
          const id = resolvedIds[tf.name]
          const CardContent = (
            <div
              style={{
                background: 'var(--surface)',
                borderRadius: 'var(--r-card)',
                padding: '16px',
                border: '1px solid var(--line)',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                transition: 'transform var(--motion-fast) ease, box-shadow var(--motion-fast) ease',
              }}
              onMouseEnter={(e) => {
                if (id) {
                  e.currentTarget.style.transform = 'scale(1.02)'
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)'
                }
              }}
              onMouseLeave={(e) => {
                if (id) {
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.boxShadow = 'none'
                }
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {tf.brand}
                  </p>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--text)', marginTop: 2 }}>
                    {tf.name}
                  </p>
                </div>
                {id && (
                  <span style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>Explore →</span>
                )}
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                <span style={{ fontWeight: 600, color: 'var(--text)' }}>{tf.creator}</span>{' — '}{tf.reason}
              </p>
            </div>
          )

          return id ? (
            <Link key={tf.name} href={`/cabinet/${id}?from=wear-and-share`} style={{ textDecoration: 'none', color: 'inherit' }}>
              {CardContent}
            </Link>
          ) : (
            <div key={tf.name}>
              {CardContent}
            </div>
          )
        })}
      </div>
    </div>
  )
}
