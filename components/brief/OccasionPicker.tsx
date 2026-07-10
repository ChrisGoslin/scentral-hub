'use client'

import { useState } from 'react'
import { getFamilyGradient } from '@/lib/familyGradients'
import { SafeFragranceImage } from '@/components/fragrance/SafeFragranceImage'

const OCCASIONS = [
  { id: 'work',    label: 'Work',    glyph: '◻', vibes: ['Fresh','Citrus','Aquatic','Aromatic'],           projections: ['Weak','Medium','Moderate'] },
  { id: 'date',    label: 'Date',    glyph: '◆', vibes: ['Woody','Oriental','Floral','Oud','Amber'],        projections: ['Moderate','Strong'] },
  { id: 'gym',     label: 'Gym',     glyph: '◈', vibes: ['Citrus','Fresh','Aquatic'],                       projections: ['Weak','Medium'] },
  { id: 'evening', label: 'Evening', glyph: '●', vibes: ['Oud','Amber','Leather','Oriental','Tobacco'],     projections: ['Moderate','Strong','Beast Mode'] },
  { id: 'weekend', label: 'Weekend', glyph: '○', vibes: ['Green','Fresh','Floral','Chypre'],                projections: ['Medium','Moderate'] },
  { id: 'special', label: 'Special', glyph: '◇', vibes: ['Oriental','Gourmand','Floral','Oud','Resinous'],  projections: ['Strong','Beast Mode'] },
]

type CollectionFrag = {
  id: string
  brand: string
  name: string
  family: string
  projection: string
  image_url: string | null
  rating: number | null
}

type Props = {
  isOpen: boolean
  onClose: () => void
  onWear: (fragranceId: string, fragranceName: string) => void
}

export default function OccasionPicker({ isOpen, onClose, onWear }: Props) {
  const [selectedOccasion, setSelectedOccasion] = useState<string | null>(null)
  const [matches, setMatches] = useState<CollectionFrag[]>([])
  const [matchIndex, setMatchIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [noMatch, setNoMatch] = useState(false)

  async function handleOccasionSelect(occasionId: string) {
    setSelectedOccasion(occasionId)
    setMatchIndex(0)
    setNoMatch(false)
    setLoading(true)

    try {
      const collectionIds: string[] = JSON.parse(localStorage.getItem('scentral_collection') ?? '[]')
      if (collectionIds.length === 0) { setMatches([]); setNoMatch(true); setLoading(false); return }

      const { createClient } = await import('@/utils/supabase/client')
      const supabase = createClient()
      const { data } = await supabase
        .from('fragrances')
        .select('id, brand, name, family, projection, image_url, rating')
        .in('id', collectionIds)
        .order('rating', { ascending: false })

      const occasion = OCCASIONS.find(o => o.id === occasionId)!
      const filtered = (data ?? []).filter(f => {
        const fam = (f.family ?? '').toLowerCase()
        const proj = f.projection ?? ''
        const familyMatch = occasion.vibes.some(v => fam.includes(v.toLowerCase()))
        const projMatch = occasion.projections.includes(proj)
        return familyMatch || projMatch
      })

      if (filtered.length === 0) {
        setMatches([])
        setNoMatch(true)
      } else {
        setMatches(filtered)
        setNoMatch(false)
      }
    } catch {
      setMatches([])
      setNoMatch(true)
    } finally {
      setLoading(false)
    }
  }

  function handleClose() {
    setSelectedOccasion(null)
    setMatches([])
    setMatchIndex(0)
    setNoMatch(false)
    onClose()
  }

  const current = matches[matchIndex] ?? null
  const occasion = OCCASIONS.find(o => o.id === selectedOccasion)

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 90, backdropFilter: 'blur(4px)' }}
      />

      {/* Sheet */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          maxHeight: '70vh',
          background: 'var(--surface)',
          borderRadius: '20px 20px 0 0',
          zIndex: 91,
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideUp 200ms ease-out',
        }}
      >
        <style>{`@keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }`}</style>

        {/* Gold score line */}
        <div style={{ height: 2, background: 'var(--accent)', borderRadius: '20px 20px 0 0' }} />

        <div style={{ padding: '20px 20px 32px', overflowY: 'auto' }}>
          {!selectedOccasion ? (
            <>
              <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 20, color: 'var(--text)', marginBottom: 20 }}>
                What's the occasion?
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {OCCASIONS.map(o => (
                  <button
                    key={o.id}
                    onClick={() => handleOccasionSelect(o.id)}
                    style={{
                      minHeight: 72,
                      background: 'var(--surface-2)',
                      border: '1px solid var(--line)',
                      borderRadius: 'var(--r-card)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      padding: 12,
                    }}
                  >
                    <span style={{ fontSize: 20, color: 'var(--accent)', lineHeight: 1 }}>{o.glyph}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{o.label}</span>
                  </button>
                ))}
              </div>
            </>
          ) : loading ? (
            <p style={{ fontSize: 14, color: 'var(--text-muted)', textAlign: 'center', padding: '32px 0' }}>Finding your best match…</p>
          ) : noMatch || !current ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 16, color: 'var(--text)', marginBottom: 8 }}>
                None of your bottles match {occasion?.label?.toLowerCase()} perfectly.
              </p>
              <a href={`/study?vibe=${occasion?.vibes.join(',')}`} style={{ fontSize: 12, color: 'var(--accent)' }}>
                Study {occasion?.label} fragrances →
              </a>
              <br />
              <button onClick={() => setSelectedOccasion(null)} style={{ marginTop: 16, fontSize: 12, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                ← Back
              </button>
            </div>
          ) : (
            <>
              {/* Recommendation card */}
              <div
                style={{
                  borderRadius: 'var(--r-card)',
                  overflow: 'hidden',
                  background: current.image_url ? undefined : getFamilyGradient(current.family),
                  position: 'relative',
                  minHeight: 180,
                  marginBottom: 16,
                }}
              >
                <SafeFragranceImage
                  imageUrl={current.image_url}
                  brand={current.brand}
                  name={current.name}
                  family={current.family}
                  sizes="100vw"
                  wrapperStyle={{ position: 'absolute', inset: 0 }}
                  imageStyle={{ objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)', padding: '16px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                  <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0 }}>{current.brand}</p>
                  <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 22, color: '#fff', margin: '4px 0' }}>{current.name}</p>
                </div>
              </div>

              {/* Confidence line */}
              <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', marginBottom: 20 }}>
                {matches.length === 1
                  ? `Your only ${occasion?.label?.toLowerCase()} fragrance. Wearing it is the right call.`
                  : `Chosen from ${matches.length} options in your collection.`}
              </p>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => { onWear(current.id, current.name); handleClose() }}
                  style={{
                    flex: 2,
                    padding: '13px 0',
                    background: 'var(--accent)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 'var(--r-btn)',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Wear this →
                </button>
                {matches.length > 1 && (
                  <button
                    onClick={() => setMatchIndex(i => (i + 1) % matches.length)}
                    style={{
                      flex: 1,
                      padding: '13px 0',
                      background: 'var(--surface-2)',
                      border: '1px solid var(--line)',
                      borderRadius: 'var(--r-btn)',
                      fontSize: 12,
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                    }}
                  >
                    Try another →
                  </button>
                )}
              </div>

              <button onClick={() => setSelectedOccasion(null)} style={{ marginTop: 14, fontSize: 12, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'center' }}>
                ← Back
              </button>
            </>
          )}
        </div>
      </div>
    </>
  )
}
