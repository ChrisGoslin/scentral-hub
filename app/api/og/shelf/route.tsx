import { ImageResponse } from 'next/og'
import { type NextRequest } from 'next/server'
import { makeLimiter, enforce, clientIp } from '@/lib/rate-limit'

export const runtime = 'edge'

// Unauthenticated by design (link unfurlers fetch this) — so params are
// hostile input and the route needs its own abuse cap (06 §2.4, §3.1), same
// pattern as app/api/og/noseprint.
const ogLimiter = makeLimiter('og-shelf', 20, '1 m')

export async function GET(request: NextRequest) {
  if (!(await enforce(ogLimiter, clientIp(request)))) {
    return new Response('Too many requests', { status: 429 })
  }

  const { searchParams } = new URL(request.url)

  // Top items passed as "Brand — Name" pairs, csv-joined by the client at
  // share time. No DB read here — this route stays auth-free like og/noseprint.
  const rawItems = (searchParams.get('items') || '').split('|').filter(Boolean).slice(0, 5)
  const items = rawItems.length > 0 ? rawItems : ['Room to be wrong.']
  const count = searchParams.get('count') || String(rawItems.length || 0)

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

        {/* Shelf */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{
            fontSize: 14,
            color: '#475569',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
          }}>
            My Shelf · Top {count}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {items.map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  fontSize: i === 0 ? 48 : 30,
                  fontStyle: 'italic',
                  color: i === 0 ? '#F1F5F9' : '#94A3B8',
                  lineHeight: 1.2,
                  letterSpacing: '-0.01em',
                }}
              >
                {item.slice(0, 60)}
              </div>
            ))}
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
