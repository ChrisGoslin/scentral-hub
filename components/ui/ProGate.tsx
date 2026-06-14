'use client'

import Link from 'next/link'
import { Lock } from 'lucide-react'

interface ProGateProps {
  featureName: string
  description: string
  preview?: React.ReactNode // optional teaser content behind a blur
}

/**
 * ProGate — wraps Pro-tier features.
 * Free users see a locked teaser. No payment logic yet — just the visual gate.
 * Replace `isPro` logic here when billing is ready.
 */
export default function ProGate({ featureName, description, preview }: ProGateProps) {
  // TODO: replace with real subscription check when billing is wired
  const isPro = false

  if (isPro) return null // render nothing — parent renders children

  return (
    <div
      style={{
        background: 'var(--bg)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Blurred preview of content behind the gate */}
      {preview && (
        <div style={{ position: 'relative', flex: 1, overflow: 'hidden', maxHeight: 340 }}>
          <div style={{ filter: 'blur(6px)', opacity: 0.35, pointerEvents: 'none', userSelect: 'none' }}>
            {preview}
          </div>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to bottom, transparent 30%, var(--bg) 100%)',
            }}
          />
        </div>
      )}

      {/* Lock card */}
      <div
        style={{
          margin: '0 auto',
          width: '100%',
          maxWidth: 420,
          padding: '40px 24px 80px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'var(--surface)',
            border: '1px solid var(--line)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Lock size={22} color="var(--accent)" strokeWidth={1.75} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.25em',
              color: 'var(--accent)',
            }}
          >
            Scentral Pro
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 26,
              color: 'var(--text)',
              lineHeight: '32px',
            }}
          >
            {featureName}
          </h2>
          <p
            style={{
              fontSize: 14,
              color: 'var(--text-muted)',
              lineHeight: '22px',
              fontWeight: 300,
              maxWidth: 320,
            }}
          >
            {description}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 280 }}>
          <button
            disabled
            style={{
              background: 'var(--accent)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--r-btn)',
              padding: '14px 24px',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              cursor: 'not-allowed',
              opacity: 0.7,
            }}
          >
            Upgrade to Pro — Coming Soon
          </button>

          <Link
            href="/collection"
            style={{
              fontSize: 12,
              color: 'var(--text-muted)',
              textDecoration: 'none',
              paddingBottom: 2,
              borderBottom: '1px solid var(--line)',
              alignSelf: 'center',
            }}
          >
            Back to My Bottles
          </Link>
        </div>

        {/* What's included in Pro */}
        <div
          style={{
            marginTop: 8,
            padding: '20px 20px',
            background: 'var(--surface)',
            border: '1px solid var(--line)',
            width: '100%',
            maxWidth: 320,
          }}
        >
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              color: 'var(--text-muted)',
              marginBottom: 12,
            }}
          >
            Pro includes
          </p>
          {[
            'Deep Dive — collection radar & pattern analysis',
            'Compare Scents — harmony scoring between any two',
            'My Schedule — daily spritz planner',
            'Rotation Intelligence — anosmia risk & wear tracking',
          ].map((item) => (
            <div
              key={item}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                padding: '7px 0',
                borderBottom: '1px solid var(--line)',
              }}
            >
              <span style={{ color: 'var(--accent)', fontSize: 12, flexShrink: 0, marginTop: 1 }}>✦</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: '18px' }}>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
