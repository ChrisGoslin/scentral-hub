import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

type CloneRow = {
  id: string
  brand: string
  name: string
  image_url: string | null
}

type Props = {
  fragranceName: string
  fragranceBrand: string
  fragranceId: string
  from?: string
}

export default async function InspiredByClones({ fragranceName, fragranceId, from }: Props) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('fragrances')
    .select('id, brand, name, image_url')
    .ilike('inspired_by', `%${fragranceName}%`)
    .neq('id', fragranceId)
    .limit(6)

  const clones: CloneRow[] = data ?? []

  if (clones.length === 0) return null

  return (
    <div className="flex flex-col gap-2">
      <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
        Affordable alternatives inspired by this
      </p>
      {clones.map(c => (
        <Link
          key={c.id}
          href={`/collection/${c.id}${from ? `?from=${from}` : ''}`}
          className="flex items-center justify-between px-3 py-2 rounded-[var(--r-card)] transition-colors hover:border-[var(--accent)]"
          style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}
        >
          <div>
            <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{c.brand}</p>
            <p style={{ fontSize: 14, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>{c.name}</p>
          </div>
          <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-gold)',
            background: 'var(--color-gold-highlight, rgba(196,154,60,0.12))',
            borderRadius: 999, padding: '2px 8px' }}>
            ~90% match
          </span>
        </Link>
      ))}
    </div>
  )
}
