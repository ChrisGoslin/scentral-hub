export default function DiscoverLoading() {
  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', padding: '16px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
          The Study
        </p>
        <div
          style={{
            width: '100%',
            height: 40,
            background: 'var(--surface)',
            borderRadius: 'var(--r-card)',
            animation: 'pulse-skeleton 1.5s infinite',
          }}
          aria-hidden="true"
        />
      </div>

      {/* Feel filter skeleton */}
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', paddingLeft: 16, marginBottom: 6 }}>
          Feel
        </p>
        <div style={{ display: 'flex', gap: 8, paddingLeft: 16, paddingRight: 16 }}>
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              style={{
                width: 100,
                height: 32,
                background: 'var(--surface)',
                borderRadius: 'var(--r-card)',
                flexShrink: 0,
                animation: 'pulse-skeleton 1.5s infinite',
              }}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>

      {/* Grid of skeleton cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 12,
        padding: '16px',
        marginBottom: 16,
      }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--r-card)',
              padding: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            {/* Image skeleton */}
            <div
              style={{
                width: '100%',
                aspectRatio: '3/4',
                background: 'var(--surface)',
                borderRadius: 10,
                animation: 'pulse-skeleton 1.5s infinite',
              }}
              aria-hidden="true"
            />

            {/* Text skeletons */}
            <div style={{
              height: 12,
              background: 'var(--surface-2)',
              borderRadius: 4,
              width: '80%',
              animation: 'pulse-skeleton 1.5s infinite',
            }} aria-hidden="true" />
            <div style={{
              height: 14,
              background: 'var(--surface-2)',
              borderRadius: 4,
              width: '100%',
              animation: 'pulse-skeleton 1.5s infinite',
            }} aria-hidden="true" />
            <div style={{
              height: 12,
              background: 'var(--surface-2)',
              borderRadius: 4,
              width: '60%',
              animation: 'pulse-skeleton 1.5s infinite',
            }} aria-hidden="true" />
          </div>
        ))}
      </div>

      <style>{`
        @keyframes pulse-skeleton {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
