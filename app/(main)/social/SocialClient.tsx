'use client'

import Script from 'next/script'

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
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        color: 'var(--text)',
        paddingTop: 24,
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 96px)',
      }}
    >
      {/* Header */}
      <div className="px-4" style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--text)', lineHeight: '32px' }}>
          Community
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
          What the fragrance world is watching
        </p>
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

      <Script src="https://www.tiktok.com/embed.js" strategy="lazyOnload" />
    </div>
  )
}
