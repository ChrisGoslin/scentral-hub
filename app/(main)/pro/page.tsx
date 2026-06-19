'use client'

import React from 'react'
import Link from 'next/link'
import Button from '@/components/ui/Button'

export default function ProPage() {
  return (
    <div style={{ padding: 24, minHeight: '100dvh', background: 'var(--bg)', color: 'var(--text)' }}>
      <header style={{ marginBottom: 32 }}>
        <Link href="/you" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}>
          ← Back
        </Link>
      </header>

      <div style={{ maxWidth: 400, margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, marginBottom: 16 }}>
          Scentral Pro
        </h1>
        <p style={{ fontSize: 16, color: 'var(--text-muted)', marginBottom: 40, lineHeight: 1.5 }}>
          Unlock the full potential of your fragrance wardrobe with advanced intelligence and limitless layering formulas.
        </p>

        <div style={{ background: 'var(--surface)', borderRadius: 16, padding: 24, border: '1px solid var(--accent)', textAlign: 'left', marginBottom: 40 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: 'var(--accent)' }}>Pro Features</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <li style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--accent)' }}>✦</span>
              <div>
                <strong style={{ display: 'block', fontSize: 14 }}>Aura Intelligence™</strong>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Advanced weather and context-aware scent recommendations.</span>
              </div>
            </li>
            <li style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--accent)' }}>✦</span>
              <div>
                <strong style={{ display: 'block', fontSize: 14 }}>Unlimited DNA Matching</strong>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Find perfect clones and dupes across the entire database.</span>
              </div>
            </li>
            <li style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--accent)' }}>✦</span>
              <div>
                <strong style={{ display: 'block', fontSize: 14 }}>Wear Scheduling</strong>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Plan your wardrobe week by week.</span>
              </div>
            </li>
          </ul>
        </div>

        <Button
          fullWidth
          style={{ padding: '16px', fontSize: 16, background: 'var(--text)', color: 'var(--bg)', borderRadius: 999 }}
          onClick={() => {}} // Stripe checkout logic goes here
        >
          Subscribe for $4.99/mo
        </Button>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 16 }}>
          Powered by Stripe. Cancel anytime.
        </p>
      </div>
    </div>
  )
}
