import { cache } from 'react'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

// Deduped across StatsCard + InspiredByMore so the three count queries run once per request,
// outside the initial render path — keeps the hero text unblocked for LCP.
const getCounts = cache(async () => {
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)

  const [{ count: totalCount }, { count: ownedCount }, { count: inspiredByCount }] = await Promise.all([
    supabase.from('fragrances').select('*', { count: 'exact', head: true }),
    supabase.from('fragrances').select('*', { count: 'exact', head: true }).eq('is_user_created', false).not('rating', 'is', null),
    supabase.from('fragrances').select('*', { count: 'exact', head: true }).not('inspired_by', 'is', null),
  ])

  return { totalCount, ownedCount, inspiredByCount }
})

export async function StatsCard() {
  const { totalCount, ownedCount, inspiredByCount } = await getCounts()

  const STATS = [
    { value: String(ownedCount ?? 106), label: 'In your collection' },
    { value: String(totalCount ?? 282), label: 'Scents to explore' },
    { value: String(inspiredByCount ?? 76), label: 'Inspired-by alternatives' },
  ]

  return (
    <div className="grid grid-cols-3 gap-4">
      {STATS.map(({ value, label }) => (
        <div key={label} className="text-center">
          <p className="text-3xl font-bold text-[var(--accent)] font-serif">{value}</p>
          <p className="text-[8px] md:text-[9px] uppercase tracking-widest text-[var(--text-muted)] mt-1 font-bold leading-tight">{label}</p>
        </div>
      ))}
    </div>
  )
}

export function StatsCardFallback() {
  const STATS = [
    { value: '106', label: 'In your collection' },
    { value: '282', label: 'Scents to explore' },
    { value: '76', label: 'Inspired-by alternatives' },
  ]

  return (
    <div className="grid grid-cols-3 gap-4">
      {STATS.map(({ value, label }) => (
        <div key={label} className="text-center">
          <p className="text-3xl font-bold text-[var(--accent)] font-serif">{value}</p>
          <p className="text-[8px] md:text-[9px] uppercase tracking-widest text-[var(--text-muted)] mt-1 font-bold leading-tight">{label}</p>
        </div>
      ))}
    </div>
  )
}

export async function InspiredByMore() {
  const { inspiredByCount } = await getCounts()

  return (
    <p className="text-[12px] text-[var(--text-muted)] font-light mt-4 px-1">
      + {Math.max(0, (inspiredByCount ?? 76) - 3)} more in the catalogue
    </p>
  )
}

export function InspiredByMoreFallback() {
  return (
    <p className="text-[12px] text-[var(--text-muted)] font-light mt-4 px-1">
      + 73 more in the catalogue
    </p>
  )
}
