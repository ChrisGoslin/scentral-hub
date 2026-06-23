import { Metadata } from 'next'
import { createClient } from '@/utils/supabase/server'
import WheelClient from './WheelClient'

export const metadata: Metadata = {
  title: 'Fragrance Wheel | AnotherSense',
  description: 'Explore the AnotherSense fragrance wheel. See which scent families dominate the catalogue and find your blind spots.',
}

export const dynamic = 'force-dynamic'

export type WheelFamily = {
  axis: string
  families: string[]
  count: number
  totalFragrances: number
}

// Map every DB family string to one of 9 radar axes
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

export default async function WheelPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('fragrances')
    .select('family, id')

  const total = data?.length ?? 0

  // Count per axis
  const axisCounts = new Map<string, number>(AXES.map(a => [a, 0]))
  const axisFamilies = new Map<string, Set<string>>(AXES.map(a => [a, new Set()]))

  for (const f of data ?? []) {
    const family = f.family ?? ''
    const axis = AXIS_MAP[family] ?? null
    if (axis) {
      axisCounts.set(axis, (axisCounts.get(axis) ?? 0) + 1)
      axisFamilies.get(axis)?.add(family)
    }
  }

  const wheelData: WheelFamily[] = AXES.map(axis => ({
    axis,
    families: Array.from(axisFamilies.get(axis) ?? []),
    count: axisCounts.get(axis) ?? 0,
    totalFragrances: total,
  }))

  return <WheelClient wheelData={wheelData} total={total} />
}
