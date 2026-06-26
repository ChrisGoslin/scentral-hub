import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
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
          backgroundColor: '#0F172A',
          fontFamily: 'serif',
        }}
      >
        <div
          style={{
            fontSize: 96,
            fontStyle: 'italic',
            color: '#ffffff',
            letterSpacing: '-0.02em',
          }}
        >
          BaseNote
        </div>
        <div
          style={{
            marginTop: 20,
            fontSize: 28,
            color: '#a0a8b8',
            fontFamily: 'sans-serif',
            letterSpacing: '0.02em',
          }}
        >
          Your daily scent ritual
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
