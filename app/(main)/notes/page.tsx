import { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'

export const metadata: Metadata = {
  title: 'Scent Encyclopedia | AnotherSense',
  description: 'Explore our encyclopedia of scent families. Discover fragrances by olfactive family and axis.',
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

export default async function NotesPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('fragrances')
    .select('family')

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
    <main style={{ minHeight: '100vh', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 96px)' }}>
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
    </main>
  )
}
