import { ImageResponse } from 'next/og'
import { type NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const name = searchParams.get('name') || 'The Still Night'
  const descriptor = searchParams.get('descriptor') || 'Your scent identity.'

  const trimmedDescriptor = descriptor.length > 100
    ? descriptor.slice(0, 97) + '…'
    : descriptor

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#0F172A',
          padding: '60px',
          fontFamily: 'serif',
        }}
      >
        {/* nota. wordmark */}
        <div style={{
          display: 'flex',
          fontSize: 18,
          color: '#475569',
          letterSpacing: '0.14em',
          textTransform: 'lowercase',
        }}>
          nota.
        </div>

        {/* Noseprint name */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{
            fontSize: 14,
            color: '#475569',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
          }}>
            My Noseprint
          </div>
          <div style={{
            fontSize: 72,
            fontStyle: 'italic',
            color: '#F1F5F9',
            lineHeight: 1.1,
            letterSpacing: '-0.01em',
          }}>
            {name}
          </div>
          <div style={{
            fontSize: 22,
            color: '#64748B',
            lineHeight: 1.5,
            maxWidth: 700,
          }}>
            {trimmedDescriptor}
          </div>
        </div>

        {/* CTA */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <div style={{
            fontSize: 16,
            color: '#B8913A',
          }}>
            Find yours at nota.
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
