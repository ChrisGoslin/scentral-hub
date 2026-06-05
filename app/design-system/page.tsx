'use client'

import React, { useState } from 'react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Chip from '@/components/ui/Chip'
import EmptyState from '@/components/ui/EmptyState'
import LoadingShimmer from '@/components/ui/LoadingShimmer'
import ErrorInline from '@/components/ui/ErrorInline'
import Sheet from '@/components/ui/Sheet'
import Disclosure from '@/components/ui/Disclosure'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--text-muted)', letterSpacing: '-0.01em' }}>
        {title}
      </h2>
      {children}
    </section>
  )
}

export default function DesignSystemPage() {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedChip, setSelectedChip] = useState('Anytime')
  const [selectedCard, setSelectedCard] = useState(false)

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', padding: '32px 16px' }}>
      <div style={{ maxWidth: 430, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 40 }}>

        {/* Header */}
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--text)', lineHeight: '34px' }}>
            Design System
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Scentral UI primitives</p>
        </div>

        {/* Typography */}
        <Section title="Typography">
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--text)' }}>Display LG — Fraunces</p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--text)' }}>Display SM — Fraunces</p>
          <p style={{ fontSize: 16, color: 'var(--text)' }}>Body — Inter 16/24</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Caption — Inter 13/18</p>
          <p style={{ fontVariantNumeric: 'tabular-nums', fontSize: 16, color: 'var(--text)' }}>Data 3 sprays — tabular</p>
        </Section>

        {/* Colours */}
        <Section title="Colour Tokens">
          <div className="grid grid-cols-3 gap-2">
            {[
              ['--bg', 'BG Ink'],
              ['--surface', 'Surface'],
              ['--surface-2', 'Surface 2'],
              ['--text', 'Text'],
              ['--text-muted', 'Text Muted'],
              ['--accent', 'Accent'],
              ['--accent-press', 'Accent Press'],
              ['--line', 'Line'],
              ['--positive', 'Positive'],
              ['--warning', 'Warning'],
              ['--danger', 'Danger'],
            ].map(([token, label]) => (
              <div key={token} className="flex flex-col items-center gap-1">
                <div style={{ width: '100%', height: 40, background: `var(${token})`, borderRadius: 8, border: '1px solid var(--line)' }} />
                <span style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center' }}>{label}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Buttons */}
        <Section title="Button">
          <Button fullWidth>Primary Button</Button>
          <Button variant="secondary" fullWidth>Secondary Button</Button>
          <Button disabled fullWidth>Disabled Button</Button>
        </Section>

        {/* Cards */}
        <Section title="Card">
          <Card>
            <p style={{ color: 'var(--text)', fontSize: 14 }}>Default card with content.</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>Caption text</p>
          </Card>
          <Card selected={selectedCard} as="button" onClick={() => setSelectedCard(!selectedCard)} style={{ width: '100%', textAlign: 'left', cursor: 'pointer' }}>
            <p style={{ color: 'var(--text)', fontSize: 14 }}>Selectable card — click me</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>{selectedCard ? '✓ Selected' : 'Not selected'}</p>
          </Card>
        </Section>

        {/* Chips */}
        <Section title="Chip">
          <div className="flex flex-wrap gap-2">
            {['Anytime', 'Date', 'Office', 'Gym', 'Formal'].map(label => (
              <Chip
                key={label}
                selected={selectedChip === label}
                onClick={() => setSelectedChip(label)}
              >
                {label}
              </Chip>
            ))}
          </div>
          <div className="flex gap-2">
            <Chip selected dot="var(--accent)">Anchor</Chip>
            <Chip dot="var(--positive)">Top</Chip>
          </div>
        </Section>

        {/* EmptyState */}
        <Section title="Empty State">
          <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--r-card)' }}>
            <EmptyState
              headline="No fragrances yet"
              caption="Your collection will appear here."
              action={<Button>Add a fragrance</Button>}
            />
          </div>
        </Section>

        {/* LoadingShimmer */}
        <Section title="Loading Shimmer">
          <LoadingShimmer variant="line" />
          <LoadingShimmer variant="card" count={3} />
        </Section>

        {/* ErrorInline */}
        <Section title="Error Inline">
          <ErrorInline message="Couldn't formulate. Please try again." onRetry={() => {}} />
          <ErrorInline message="High anosmia risk — apply sparingly." color="warning" />
        </Section>

        {/* Disclosure */}
        <Section title="Disclosure">
          <Disclosure text="Personal recommendation — not sponsored." />
        </Section>

        {/* Sheet */}
        <Section title="Sheet">
          <Button onClick={() => setSheetOpen(true)} fullWidth>Open Sheet</Button>
          <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)}>
            <div className="flex flex-col gap-4 py-4">
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--text)' }}>Sheet Content</h2>
              <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>This is a bottom sheet. Press Escape or tap outside to close.</p>
              <Disclosure text="Personal recommendation — not sponsored." />
              <Button onClick={() => setSheetOpen(false)} fullWidth>Close</Button>
            </div>
          </Sheet>
        </Section>

      </div>
    </div>
  )
}
