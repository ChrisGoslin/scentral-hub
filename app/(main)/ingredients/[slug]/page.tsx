import { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { createServerClient } from '@supabase/ssr'
import { FragranceCardMedia } from '@/components/discover/FragranceCardMedia'

export const dynamic = 'force-dynamic'

// Build-time Supabase client (no cookies)
function createBuildClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  return createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll() {
        return []
      },
      setAll() {},
    },
  })
}

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

const FAMILY_DESCRIPTIONS: Record<string, string> = {
  'Fresh Aromatic': 'Clean, herbal, and invigorating. A blend of fresh notes with aromatic herbs that evokes morning freshness.',
  'Fresh Woody': 'Crisp and luminous with a woody foundation. A light, uplifting take on woodiness with bright citrus accents.',
  'Fresh Aquatic': 'Mineral, ozonic, and aqueous with a sea-breeze quality. Captures the essence of water and clean air in a bottle.',
  'Fresh Marine': 'Salty and oceanic with a nautical spirit. Evokes the feeling of sea spray and coastal freshness.',
  'Fresh Floral': 'Light, airy florals with a sparkling fresh top. Delicate flowers lifted by bright, clean notes.',
  'Fresh Fougere': 'Herbaceous and green with a classical fern-like structure. Combines lavender, coumarin, and woody base notes.',
  'Fresh Citrus': 'Bright, zesty, and energizing. Dominated by citrus fruits with a crisp, uplifting character.',
  'Citrus Woody': 'A vibrant blend of citrus sparkle with woody grounding. Fresh and sophisticated in equal measure.',
  'Woody Aromatic': 'Warm, aromatic woods with herbal spice undertones. A balanced, sophisticated woody composition.',
  'Woody Spicy': 'Dark woods enhanced by warming spice accords. Rich, complex, and slightly masculine in character.',
  'Woody Oud': 'Precious oud resin with woody warmth and depth. Mysterious, intense, and deeply evocative.',
  'Woody Oriental': 'Sensual woody base layered with sweet oriental notes. A bridge between Eastern opulence and Western woodiness.',
  'Woody Powdery': 'Soft, velvety woods with powdery florals. Creates a warm, comforting, slightly vintage effect.',
  'Aromatic Woody': 'Herbaceous aromatics grounded in woody notes. Clean, balanced, and timeless in appeal.',
  'Aromatic Fougere': 'Herbal, lavender-forward with a classical chypre structure. The essence of traditional masculinity.',
  'Dark Leather Oud': 'Luxurious oud infused with leather and dark woods. Intense, smoky, and utterly captivating.',
  'Floral Oriental': 'Lush, voluptuous flowers wrapped in sweet amber warmth. Sensual, intoxicating, and deeply feminine.',
  'Floral Musk': 'Soft florals anchored by musky earthiness. Creates a skin-scent intimacy with floral beauty.',
  'Floral Fruity': 'Fruity accords dancing with tender flowers. A playful, youthful, and modern approach to florals.',
  'Floral Powdery': 'Soft, gentle flowers with a subtle powdered finish. Reminiscent of vintage cosmetics and delicate talc.',
  'Floral Musky': 'Intimate floral composition with musky undertones. Soft, enveloping, and personally intimate.',
  'Fresh Floral Musk': 'Radiant flowers with a clean, musky base. Bright yet grounding, fresh yet sensual.',
  'White Floral Woody': 'Pristine white flowers anchored by woody depth. A classic, elegant, and enduring combination.',
  'Fruity Chypre': 'Fruity brightness over a classic chypre structure of oakmoss and amber. Modern yet timeless.',
  'Fruity Floral': 'Ripe fruits intertwined with blooming flowers. A sweet, fresh, and utterly appealing composition.',
  'Fruit Oriental': 'Juicy fruits kissed with oriental warmth and sweetness. A luscious and indulgent experience.',
  'Oriental Amber': 'Warm, resinous amber notes with oriental spice and sweetness. Rich, honey-like, and deeply comforting.',
  'Oriental Spicy': 'Exotic spices and warm resins creating an intoxicating oriental signature. Complex and seductive.',
  'Oriental Floral': 'Lush flowers softened by oriental amber and musk. Sensual, sophisticated, and timelessly elegant.',
  'Oriental Musk': 'Soft, animalic musk with oriental sweetness. Deeply intimate and skin-scent in its sensuality.',
  'Oriental Vanilla': 'Creamy vanilla enveloped in warm oriental sweetness. Comforting, dreamy, and utterly embracing.',
  'Oriental Woody': 'Dark, mysterious woods with oriental warmth and incense. A sophisticated, unisex composition.',
  'Spicy Amber': 'Warm amber illuminated by exotic spices. Inviting, sensual, and complexly aromatic.',
  'Spicy Oriental': 'Intense oriental spices woven with sweet resins and amber. Provocative and deeply alluring.',
  'Sweet Aromatic': 'Aromatic herbs and spices mellowed with a touch of sweetness. Balanced and invitingly warm.',
  'Amber Gourmand': 'Warm amber combined with dessert-like sweetness. Indulgent, wearable, and emotionally resonant.',
  'Gourmand': 'Edible, dessert-inspired notes — vanilla, caramel, chocolate, praline. Comfort in a bottle.',
  'Vanilla Amber': 'Creamy vanilla deepened by warm amber resin. The ultimate comfort accord, familiar and beloved.',
  'Aromatic': 'Herbaceous and spiced with a clean, masculine edge. The heart of classical fougere and barbershop fragrances.',
  'Musky': 'Soft, skin-like musk as the primary note. Creates a close, intimate, and nearly imperceptible sillage.',
}

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const familyName = slug.replace(/-/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  return {
    title: `${familyName} Fragrances | AnotherSense`,
    description: `Explore fragrances in the ${familyName} scent family. Discover notes and find your next signature scent.`,
  }
}

export async function generateStaticParams() {
  const supabase = createBuildClient()
  const { data } = await supabase
    .from('fragrances')
    .select('family')

  const families = new Set(
    (data ?? [])
      .map(row => row.family)
      .filter((f): f is string => !!f)
  )

  return Array.from(families).map(family => ({
    slug: family.toLowerCase().replace(/ /g, '-'),
  }))
}

export default async function IngredientsPage({ params }: Props) {
  const { slug } = await params

  // Convert slug back to family name
  const familyName = slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  const supabase = await createClient()

  // Fetch fragrances with this family
  const { data: fragrances } = await supabase
    .from('fragrances')
    .select('id, brand, name, family, image_url')
    .eq('family', familyName)
    .order('brand')

  const axis = AXIS_MAP[familyName] ?? 'Unknown'
  const description = FAMILY_DESCRIPTIONS[familyName] ?? 'Explore this scent family.'

  return (
    <main style={{ minHeight: '100vh', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 96px)' }}>
      {/* Hero */}
      <section style={{ padding: '48px 16px 32px' }}>
        <h1
          style={{
            fontSize: 'clamp(2.5rem, 10vw, 3.5rem)',
            fontWeight: 700,
            marginBottom: '8px',
            color: 'var(--text)',
          }}
        >
          <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
            {familyName}
          </span>
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <span
            style={{
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--text-muted)',
              fontWeight: 600,
            }}
          >
            {axis} Axis
          </span>
          <span style={{ color: 'var(--text-muted)' }}>·</span>
          <span
            style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
            }}
          >
            {fragrances?.length ?? 0} fragrance{fragrances && fragrances.length !== 1 ? 's' : ''}
          </span>
        </div>

        <p
          style={{
            fontSize: '16px',
            lineHeight: '1.6',
            color: 'var(--text)',
            maxWidth: '600px',
            marginBottom: '24px',
          }}
        >
          {description}
        </p>

        <style>{`
          .ingredients-cta {
            display: inline-block;
            padding: 10px 16px;
            background-color: var(--accent);
            color: #fff;
            border-radius: 8px;
            text-decoration: none;
            font-size: 14px;
            font-weight: 500;
            transition: opacity 200ms ease-out;
          }
          .ingredients-cta:hover {
            opacity: 0.85;
          }
        `}</style>
        <Link
          href={`/discover?family=${encodeURIComponent(familyName)}`}
          className="ingredients-cta"
        >
          Explore in Discover →
        </Link>
      </section>

      {/* Fragrances grid / horizontal scroll */}
      {fragrances && fragrances.length > 0 && (
        <section style={{ padding: '32px 16px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
              gap: '12px',
            }}
          >
            {fragrances.map(frag => (
              <Link
                key={frag.id}
                href={`/collection/${frag.id}?from=notes`}
                style={{
                  textDecoration: 'none',
                  aspectRatio: '3/4',
                  position: 'relative',
                  cursor: 'pointer',
                }}
              >
                <FragranceCardMedia
                  imageUrl={frag.image_url}
                  brand={frag.brand}
                  name={frag.name}
                  family={frag.family}
                  compact
                />
              </Link>
            ))}
          </div>
        </section>
      )}

      {(!fragrances || fragrances.length === 0) && (
        <section style={{ padding: '32px 16px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            No fragrances found in this family yet.
          </p>
        </section>
      )}
    </main>
  )
}
