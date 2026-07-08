import { getFamilyGradient } from '@/lib/familyGradients'

type Props = {
  brand: string
  name: string
  family: string
  compact?: boolean
  style?: React.CSSProperties
}

export function GradientPlaceholder({ brand, name, family, compact = false, style }: Props) {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: getFamilyGradient(family),
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: compact ? '14px 12px' : '18px 14px',
        overflow: 'hidden',
        borderRadius: 'inherit',
        border: '1px solid color-mix(in srgb, var(--line) 70%, transparent)',
        boxShadow: '0 18px 32px rgba(0,0,0,0.22)',
        ...style
      }}
    >
      {/* Top row — brand in small caps (matches wall card convention) + initial as ghost anchor */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
        <p
          style={{
            fontSize: 9,
            color: 'var(--accent)',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            margin: 0,
            opacity: 0.9,
            textShadow: '0 1px 2px rgba(0,0,0,0.4)',
            fontFamily: 'var(--font-hand)',
          }}
        >
          {brand}
        </p>
        {/* Brand initial — ghost typographic anchor, top-right */}
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: compact ? 40 : 52,
            lineHeight: 0.9,
            color: 'rgba(255,255,255,0.10)',
            fontStyle: 'italic',
            userSelect: 'none',
            letterSpacing: '-0.02em',
            marginTop: -4,
          }}
        >
          {brand.charAt(0)}
        </span>
      </div>

      {/* Lower third — gold score line + name */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, position: 'relative', zIndex: 2 }}>
        <div
          style={{
            height: 1,
            background: 'linear-gradient(to right, var(--accent), rgba(255,255,255,0.12), transparent)',
            opacity: 0.68,
          }}
        />
        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: compact ? 13 : 15,
            fontStyle: 'italic',
            color: 'rgba(255,255,255,0.9)',
            lineHeight: 1.25,
            margin: 0,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            textShadow: '0 1px 3px rgba(0,0,0,0.5)',
          }}
        >
          {name}
        </p>
      </div>
      
      {/* Ombre overlay for text readability */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.04) 0, transparent 24%), linear-gradient(to top, rgba(0,0,0,0.74) 0%, rgba(0,0,0,0.18) 45%, transparent 70%)',
          zIndex: 1,
        }}
      />
    </div>
  )
}
