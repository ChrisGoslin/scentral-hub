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
        ...style
      }}
    >
      {/* Brand initial — large typographic anchor */}
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: compact ? 48 : 64,
          lineHeight: 1,
          color: 'rgba(255,255,255,0.15)',
          fontStyle: 'italic',
          userSelect: 'none',
          letterSpacing: '-0.02em',
        }}
      >
        {brand.charAt(0)}
      </span>

      {/* Lower third — gold score line + name */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, position: 'relative', zIndex: 2 }}>
        <div
          style={{
            height: 1,
            background: 'linear-gradient(to right, var(--accent), transparent)',
            opacity: 0.6,
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
        <p
          style={{
            fontSize: 8,
            color: 'var(--accent)',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            margin: 0,
            opacity: 0.9,
            textShadow: '0 1px 2px rgba(0,0,0,0.4)',
          }}
        >
          {brand}
        </p>
      </div>
      
      {/* Ombre overlay for text readability */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.15) 45%, transparent 70%)',
          zIndex: 1,
        }}
      />
    </div>
  )
}
