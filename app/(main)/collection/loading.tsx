export default function CollectionLoading() {
  const tiers = [
    { label: 'Signatures', sublabel: 'Active Top 20' },
    { label: 'Occasion Modifiers', sublabel: 'Transitional' },
    { label: 'Base Anchors', sublabel: 'Dense Ouds' },
    { label: 'Benching', sublabel: 'New / Unrated' },
  ]

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100dvh',
      background: `
        repeating-linear-gradient(
          90deg,
          transparent 0px,
          transparent 3px,
          rgba(0,0,0,0.04) 3px,
          rgba(0,0,0,0.04) 6px
        ),
        repeating-linear-gradient(
          178deg,
          var(--cabinet-grain-a, rgb(88,48,18)) 0px,
          var(--cabinet-grain-b, rgb(58,26,10)) 8px,
          var(--cabinet-grain-c, rgb(110,62,24)) 18px,
          var(--cabinet-grain-b, rgb(58,26,10)) 28px,
          var(--cabinet-grain-d, rgb(80,42,14)) 40px
        )
      `,
      backgroundBlendMode: 'multiply',
      boxShadow: 'inset 0 20px 40px rgba(0,0,0,0.8)',
      padding: '20px 16px 24px',
    }}>
      {/* Header skeleton */}
      <div style={{ marginBottom: 32, display: 'flex', gap: 12 }}>
        <div
          style={{
            width: 60,
            height: 40,
            background: 'rgba(255,255,255,0.08)',
            borderRadius: 'var(--r-card)',
            animation: 'pulse-skeleton 1.5s infinite',
          }}
          aria-hidden="true"
        />
        <div
          style={{
            width: 80,
            height: 40,
            background: 'rgba(255,255,255,0.08)',
            borderRadius: 'var(--r-card)',
            animation: 'pulse-skeleton 1.5s infinite',
          }}
          aria-hidden="true"
        />
      </div>

      {/* 4 shelf tier skeletons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {tiers.map((tier, idx) => (
          <div key={idx} style={{ marginBottom: 20 }}>
            {/* Tier label skeleton */}
            <div style={{ marginBottom: 6, paddingLeft: 4, display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <div
                style={{
                  width: 120,
                  height: 14,
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: 4,
                  animation: 'pulse-skeleton 1.5s infinite',
                }}
                aria-hidden="true"
              />
            </div>

            {/* Shelf skeleton with 4-5 items */}
            <div style={{
              background: 'rgba(0,0,0,0.25)',
              borderTop: '2px solid rgba(196,154,60,0.3)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.12), 0 1px 0 rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.6)',
              borderRadius: 2,
              padding: '10px 10px 14px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
              minHeight: 80,
            }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: 72,
                    height: 96,
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8,
                    animation: 'pulse-skeleton 1.5s infinite',
                  }}
                  aria-hidden="true"
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes pulse-skeleton {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  )
}
