import { ImageResponse } from 'next/og'
import { NextResponse, type NextRequest } from 'next/server'
import { makeLimiter, enforce, clientIp } from '@/lib/rate-limit'

export const runtime = 'nodejs'

// Same budget as app/api/og/noseprint (resilience-abuse skill: og/* 20/min/IP).
const ogTemplateLimiter = makeLimiter('og-template', 20, '1 m')

const COLORS = {
  bg: '#F7F3EE',
  darkBg: '#0F172A',
  text: '#1E1714',
  textLight: '#F1F5F9',
  muted: '#6B635A',
  gold: '#B8913A',
  goldLight: '#E8C060',
  error: '#A03050',
}

const FAMILY_GRADIENTS: Record<string, { start: string; end: string }> = {
  floral: { start: '#e8b4d4', end: '#c2185b' },
  fresh: { start: '#4ecdc4', end: '#0288a8' },
  woody: { start: '#5c4033', end: '#8d7662' },
  oriental: { start: '#c49a3c', end: '#8a4b2e' },
  fougere: { start: '#6b8f71', end: '#3f5c44' },
  musk: { start: '#d9c7c0', end: '#a98e9b' },
  green: { start: '#7cb083', end: '#3e6b4a' },
  gourmand: { start: '#d4a373', end: '#8b5a2b' },
  oud: { start: '#4a2c2a', end: '#1c0f0e' },
  default: { start: '#5c4033', end: '#8d7662' },
}

interface OGParams {
  type?: 'home' | 'fragrance' | 'insight' | 'trace'
  brand?: string
  name?: string
  family?: string
  persona?: string
  feeling?: string
  date?: string
  theme?: 'light' | 'dark'
}

export async function GET(req: NextRequest) {
  if (!(await enforce(ogTemplateLimiter, clientIp(req)))) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429 })
  }

  const searchParams = req.nextUrl.searchParams
  const type = (searchParams.get('type') || 'home') as OGParams['type']
  const brand = searchParams.get('brand') || ''
  const name = searchParams.get('name') || ''
  const family = (searchParams.get('family') || 'default').toLowerCase()
  const persona = searchParams.get('persona') || ''
  const feeling = searchParams.get('feeling') || ''
  const date = searchParams.get('date') || ''
  const theme = (searchParams.get('theme') || 'light') as 'light' | 'dark'

  const bgColor = theme === 'dark' ? COLORS.darkBg : COLORS.bg
  const textColor = theme === 'dark' ? COLORS.textLight : COLORS.text
  const accentColor = theme === 'dark' ? COLORS.goldLight : COLORS.gold

  try {
    switch (type) {
      case 'fragrance':
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
                background: `linear-gradient(135deg, ${FAMILY_GRADIENTS[family]?.start || FAMILY_GRADIENTS.default.start} 0%, ${FAMILY_GRADIENTS[family]?.end || FAMILY_GRADIENTS.default.end} 100%)`,
                padding: '60px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: 48,
                  fontWeight: 400,
                  color: 'rgba(255, 255, 255, 0.7)',
                  marginBottom: 20,
                  fontFamily: 'Georgia, serif',
                }}
              >
                {brand}
              </div>
              <div
                style={{
                  fontSize: 64,
                  fontWeight: 400,
                  color: 'white',
                  marginBottom: 20,
                  fontFamily: 'Georgia, serif',
                  letterSpacing: '-0.02em',
                }}
              >
                {name}
              </div>
              <div
                style={{
                  fontSize: 32,
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontFamily: 'system-ui, sans-serif',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                {family.charAt(0).toUpperCase() + family.slice(1)}
              </div>
            </div>
          ),
          { width: 1200, height: 630 }
        )

      case 'insight':
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
                background: `linear-gradient(135deg, ${COLORS.gold}33 0%, ${COLORS.gold}11 100%)`,
                padding: '60px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: 42,
                  color: COLORS.muted,
                  marginBottom: 20,
                  fontFamily: 'system-ui, sans-serif',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                }}
              >
                Your Scent Story
              </div>
              <div
                style={{
                  fontSize: 56,
                  fontWeight: 400,
                  color: COLORS.gold,
                  marginBottom: 30,
                  fontFamily: 'Georgia, serif',
                  letterSpacing: '-0.02em',
                }}
              >
                {persona || 'Discovering Your Identity'}
              </div>
              <div
                style={{
                  fontSize: 24,
                  color: COLORS.text,
                  fontFamily: 'system-ui, sans-serif',
                }}
              >
                nota.
              </div>
            </div>
          ),
          { width: 1200, height: 630 }
        )

      case 'trace':
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
                background: `radial-gradient(circle at center, ${COLORS.bg} 0%, ${COLORS.bg}dd 50%, ${COLORS.text}33 100%)`,
                padding: '60px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: 48,
                  color: COLORS.muted,
                  marginBottom: 20,
                  fontFamily: 'system-ui, sans-serif',
                  letterSpacing: '0.05em',
                }}
              >
                {date || 'A Moment in Time'}
              </div>
              <div
                style={{
                  fontSize: 56,
                  fontWeight: 400,
                  color: COLORS.gold,
                  marginBottom: 20,
                  fontFamily: 'Georgia, serif',
                }}
              >
                {name || 'A Fragrance'}
              </div>
              <div
                style={{
                  fontSize: 32,
                  color: COLORS.text,
                  marginBottom: 20,
                  fontFamily: 'system-ui, sans-serif',
                }}
              >
                {feeling || 'Felt Something'}
              </div>
              <div
                style={{
                  fontSize: 20,
                  color: COLORS.muted,
                  marginTop: 40,
                  fontFamily: 'system-ui, sans-serif',
                }}
              >
                Remembered on nota.
              </div>
            </div>
          ),
          { width: 1200, height: 630 }
        )

      case 'home':
      default:
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
                background: bgColor,
                color: textColor,
              }}
            >
              <div
                style={{
                  fontSize: 96,
                  fontFamily: 'Georgia, serif',
                  letterSpacing: '-0.02em',
                  marginBottom: 20,
                }}
              >
                nota.
              </div>
              <div
                style={{
                  fontSize: 28,
                  color: accentColor,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  fontFamily: 'system-ui, sans-serif',
                  fontWeight: 600,
                }}
              >
                Your Daily Scent Ritual
              </div>
            </div>
          ),
          { width: 1200, height: 630 }
        )
    }
  } catch (error) {
    console.error('OG image generation error:', error)
    // Fallback to home OG image on error
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: COLORS.bg,
            color: COLORS.text,
            fontSize: 48,
          }}
        >
          nota.
        </div>
      ),
      { width: 1200, height: 630 }
    )
  }
}
