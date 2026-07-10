'use client'

import { type CollectionFragrance } from './CollectionClient'

const COHERENCE_READINGS: Record<string, { reading: string; missing: string[] }> = {
  'Woody+Oriental':    { reading: 'Dark, resinous, and candlelit. Your collection has a personality.',         missing: ['Citrus', 'Aquatic'] },
  'Citrus+Aquatic':    { reading: 'Clean lines and open air. Your shelf is built for motion.',                  missing: ['Woody', 'Aromatic'] },
  'Gourmand+Amber':    { reading: 'Warm and unapologetically comforting. A collection that wraps around you.', missing: ['Citrus', 'Green'] },
  'Leather+Tobacco':   { reading: 'Bold and polarising by design. This collection is not for everyone.',        missing: ['Floral', 'Aquatic'] },
  'Floral+Musk':       { reading: 'Soft and present. Your collection whispers before it announces.',            missing: ['Woody', 'Oriental'] },
  'Oud+Resinous':      { reading: "Rare taste. Your shelf reads like a perfumer's private reserve.",            missing: ['Citrus', 'Fresh'] },
  'Aromatic+Herbal':   { reading: 'Intentional and grounded. Your collection is a practice, not a habit.',     missing: ['Amber', 'Woody'] },
  'default':           { reading: 'Your collection is still finding its shape. Every new bottle narrows the focus.', missing: [] },
}

function getCoherenceReading(owned: CollectionFragrance[]) {
  const counts: Record<string, number> = {}
  for (const f of owned) {
    if (!f.family) continue
    counts[f.family] = (counts[f.family] ?? 0) + 1
  }
  const total = owned.length
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
  const dominant = sorted.find(([, n]) => n / total > 0.35)
  const secondary = sorted.find(([fam, n]) => fam !== dominant?.[0] && n / total > 0.2)

  if (dominant && secondary) {
    const key = `${dominant[0]}+${secondary[0]}`
    if (COHERENCE_READINGS[key]) return COHERENCE_READINGS[key]
    const reverseKey = `${secondary[0]}+${dominant[0]}`
    if (COHERENCE_READINGS[reverseKey]) return COHERENCE_READINGS[reverseKey]
  }
  return COHERENCE_READINGS.default
}

export default function CoherenceCard({ owned }: { owned: CollectionFragrance[] }) {
  if (owned.length < 5) {
    return (
      <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 16px 16px', fontStyle: 'italic' }}>
        Add {5 - owned.length} more {owned.length === 4 ? 'fragrance' : 'fragrances'} to unlock your cabinet reading.
      </p>
    )
  }

  const coherenceReading = getCoherenceReading(owned)

  return (
    <div style={{ margin: '0 16px 16px', padding: '16px', borderLeft: '2px solid var(--accent)', background: 'var(--surface)', borderRadius: 'var(--r-card)' }}>
      <p style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>The Cabinet</p>
      <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 16, color: 'var(--text)', lineHeight: 1.5 }}>
        {coherenceReading.reading}
      </p>
      {coherenceReading.missing.length > 0 && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--line)' }}>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>
            The cabinet doesn&apos;t have a {coherenceReading.missing[0].toLowerCase()} note yet.
          </p>
          <a href={`/study?family=${encodeURIComponent(coherenceReading.missing[0])}`} style={{ fontSize: 11, color: 'var(--accent)', textDecoration: 'none' }}>
            Study a lead → {coherenceReading.missing[0]} fragrances
          </a>
        </div>
      )}
    </div>
  )
}
