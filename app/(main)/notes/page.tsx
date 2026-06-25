import { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'

export const metadata: Metadata = {
  title: 'Scent Encyclopedia | AnotherSense',
  description: 'Explore our encyclopedia of scent families. Discover fragrances by olfactive family and axis, from fresh aromatic to dark oud.',
  alternates: { canonical: '/notes' },
}

export const dynamic = 'force-dynamic'

// Map every DB family string to one of the radar axes
const AXIS_MAP: Record<string, string> = {
  'Fresh Aromatic':   'Fresh',
  'Fresh Woody':      'Fresh',
  'Fresh Aquatic':    'Aquatic',
  'Fresh Marine':     'Aquatic',
  'Fresh Floral':     'Fresh',
  'Fresh Fougere':    'Fresh',
  'Fresh Citrus':     'Fresh',
  'Citrus Woody':     'Fresh',
  'Woody Aromatic':   'Woody',
  'Woody Spicy':      'Woody',
  'Woody Oud':        'Oud',
  'Woody Oriental':   'Oriental',
  'Woody Powdery':    'Woody',
  'Aromatic Woody':   'Woody',
  'Aromatic Fougere': 'Aromatic',
  'Dark Leather Oud': 'Oud',
  'Floral Oriental':  'Floral',
  'Floral Musk':      'Floral',
  'Floral Fruity':    'Floral',
  'Floral Powdery':   'Floral',
  'Floral Musky':     'Floral',
  'Fresh Floral Musk':'Floral',
  'White Floral Woody':'Floral',
  'Fruity Chypre':    'Fruity',
  'Fruity Floral':    'Fruity',
  'Fruit Oriental':   'Fruity',
  'Oriental Amber':   'Oriental',
  'Oriental Spicy':   'Oriental',
  'Oriental Floral':  'Oriental',
  'Oriental Musk':    'Oriental',
  'Oriental Vanilla': 'Oriental',
  'Oriental Woody':   'Oriental',
  'Spicy Amber':      'Spicy',
  'Spicy Oriental':   'Spicy',
  'Sweet Aromatic':   'Gourmand',
  'Amber Gourmand':   'Gourmand',
  'Gourmand':         'Gourmand',
  'Vanilla Amber':    'Gourmand',
  'Aromatic':         'Aromatic',
  'Musky':            'Aromatic',
}

const AXES = ['Fresh', 'Aquatic', 'Woody', 'Oud', 'Oriental', 'Spicy', 'Floral', 'Fruity', 'Gourmand', 'Aromatic'] as const

const AXIS_EMOJIS: Record<string, string> = {
  'Fresh': '🌿',
  'Aquatic': '💧',
  'Woody': '🌲',
  'Oud': '✨',
  'Oriental': '🌙',
  'Spicy': '🌶️',
  'Floral': '🌸',
  'Fruity': '🍓',
  'Gourmand': '🍨',
  'Aromatic': '🫧',
}

// Common individual notes (distinct from the family/axis taxonomy above) — matched
// against the freeform fragrances.notes text, e.g. "Top: Oud, saffron, Base: Amber, musk"
const FEATURED_NOTES = [
  'Oud', 'Rose', 'Vanilla', 'Amber', 'Musk', 'Bergamot', 'Cedarwood',
  'Lavender', 'Patchouli', 'Sandalwood', 'Jasmine', 'Saffron', 'Vetiver',
  'Leather', 'Praline', 'Ambergris',
]

type NoteFragrance = { id: string; brand: string; name: string }

export default async function NotesPage() {
  const supabase = await createClient()

  const [{ data }, noteResultsRaw] = await Promise.all([
    supabase.from('fragrances').select('family'),
    Promise.all(
      FEATURED_NOTES.map(note =>
        supabase
          .from('fragrances')
          .select('id, brand, name')
          .ilike('notes', `%${note}%`)
          .limit(6)
          .then(({ data }) => [note, data ?? []] as [string, NoteFragrance[]])
      )
    ),
  ])

  const noteResults = new Map<string, NoteFragrance[]>(noteResultsRaw.filter(([, rows]) => rows.length > 0))

  // Count fragrances per family
  const familyCounts = new Map<string, number>()
  for (const row of data ?? []) {
    const family = row.family ?? ''
    if (family) {
      familyCounts.set(family, (familyCounts.get(family) ?? 0) + 1)
    }
  }

  // Group families by axis
  const axisFamilies = new Map<string, Array<{ family: string; count: number }>>()
  AXES.forEach(axis => axisFamilies.set(axis, []))

  for (const [family, count] of familyCounts.entries()) {
    const axis = AXIS_MAP[family]
    if (axis && axisFamilies.has(axis)) {
      axisFamilies.get(axis)!.push({ family, count })
    }
  }

  // Sort families within each axis alphabetically
  for (const families of axisFamilies.values()) {
    families.sort((a, b) => a.family.localeCompare(b.family))
  }

  return (
    <main style={{ minHeight: '100vh', paddingTop: 'calc(44px + env(safe-area-inset-top, 0px))', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 96px)' }}>
      {/* Hero */}
      <section style={{ padding: '48px 16px 32px' }}>
        <h1
          style={{
            fontSize: 'clamp(2.5rem, 10vw, 4rem)',
            fontWeight: 700,
            marginBottom: '8px',
            color: 'var(--text)',
          }}
        >
          Scent Encyclopedia
        </h1>
        <p
          style={{
            fontSize: '16px',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
          }}
        >
          Explore our complete catalog of scent families, grouped by olfactive axis.
        </p>
      </section>

      <style>{`
        .note-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          border-radius: 24px;
          background-color: var(--surface-2);
          color: var(--text);
          text-decoration: none;
          font-size: 14px;
          transition: all 200ms ease-out;
          border: 1px solid var(--line);
          cursor: pointer;
        }
        .note-pill:hover {
          background-color: var(--accent);
          color: #fff;
          border-color: var(--accent);
        }
      `}</style>

      {/* Axes grouped sections */}
      {AXES.map(axis => {
        const families = axisFamilies.get(axis) ?? []
        if (families.length === 0) return null

        return (
          <section key={axis} style={{ paddingBottom: '48px' }}>
            {/* Axis header */}
            <div style={{ padding: '0 16px 24px' }}>
              <h2
                style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  color: 'var(--text)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span style={{ fontSize: '24px' }}>{AXIS_EMOJIS[axis]}</span>
                {axis}
              </h2>
            </div>

            {/* Family pills */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                padding: '0 16px',
              }}
            >
              {families.map(({ family, count }) => {
                const slug = family.toLowerCase().replace(/ /g, '-')
                return (
                  <Link
                    key={family}
                    href={`/ingredients/${slug}`}
                    className="note-pill"
                  >
                    <span>{family}</span>
                    <span
                      style={{
                        fontSize: '12px',
                        opacity: 0.7,
                        minWidth: '24px',
                        textAlign: 'right',
                      }}
                    >
                      {count}
                    </span>
                  </Link>
                )
              })}
            </div>
          </section>
        )
      })}

      {/* Browse by individual note — cross-links into Discover */}
      {noteResults.size > 0 && (
        <section style={{ padding: '8px 16px 0', borderTop: '1px solid var(--line)' }}>
          <h2
            style={{
              fontSize: '18px',
              fontWeight: 600,
              color: 'var(--text)',
              margin: '32px 0 24px',
            }}
          >
            Browse by Note
          </h2>

          {FEATURED_NOTES.map(note => {
            const fragrances = noteResults.get(note)
            if (!fragrances) return null

            return (
              <div key={note} style={{ marginBottom: '32px' }}>
                <h3
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: '12px',
                  }}
                >
                  Fragrances featuring {note}
                </h3>
                <div
                  style={{
                    display: 'flex',
                    gap: '10px',
                    overflowX: 'auto',
                    paddingBottom: '4px',
                  }}
                >
                  {fragrances.map(frag => (
                    <Link
                      key={frag.id}
                      href={`/discover?q=${encodeURIComponent(frag.name)}`}
                      style={{
                        flex: '0 0 auto',
                        minWidth: '160px',
                        padding: '12px 14px',
                        borderRadius: '12px',
                        background: 'var(--surface-2)',
                        border: '1px solid var(--line)',
                        textDecoration: 'none',
                      }}
                    >
                      <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>
                        {frag.name}
                      </p>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {frag.brand}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
        </section>
      )}
    </main>
  )
}
