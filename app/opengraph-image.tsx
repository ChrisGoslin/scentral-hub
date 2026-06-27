import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f7f3ee',
          color: '#1a1714',
        }}
      >
        <div
          style={{
            fontSize: 96,
            fontFamily: 'Georgia, serif',
            letterSpacing: '-0.02em',
          }}
        >
          BaseNote
        </div>
        <div
          style={{
            marginTop: 20,
            fontSize: 28,
            color: '#B8913A', /* Parfumeur's Gold — hardcoded: canvas/OG image context, CSS vars unavailable */
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          Your Daily Scent Ritual
        </div>
      </div>
    ),
    { ...size },
  )
}
