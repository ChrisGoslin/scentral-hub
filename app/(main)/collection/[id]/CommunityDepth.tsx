import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { getBrandEmoji } from '@/lib/brandEmoji'
import Image from 'next/image'

export default async function CommunityDepth({ fragranceId }: { fragranceId: string }) {
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)

  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString()
  
  const { count: wearsThisWeek } = await supabase
    .from('wear_logs')
    .select('id', { count: 'exact', head: true })
    .eq('fragrance_id', fragranceId)
    .gte('created_at', weekAgo)

  const { data: alsoOwnRows } = await supabase
    .rpc('get_also_owned_fragrances', { f_id: fragranceId, limit_count: 6 })

  let alsoOwnFragrances = []
  if (alsoOwnRows && alsoOwnRows.length > 0) {
    const ids = alsoOwnRows.map((r: any) => r.fragrance_id)
    const { data: frags } = await supabase
      .from('fragrances')
      .select('id, name, brand, image_url')
      .in('id', ids)
    
    if (frags) {
      const lookup = new Map(frags.map(f => [f.id, f]))
      alsoOwnFragrances = alsoOwnRows
        .map((r: any) => lookup.get(r.fragrance_id))
        .filter(Boolean)
    }
  }

  if ((!wearsThisWeek || wearsThisWeek === 0) && alsoOwnFragrances.length === 0) {
    return null
  }

  return (
    <div style={{ marginTop: 24, padding: '16px', background: 'var(--surface)', borderRadius: 'var(--r-card)' }}>
      <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--accent)', marginBottom: 12 }}>
        Community
      </p>

      {wearsThisWeek !== null && wearsThisWeek > 0 && (
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 14, color: 'var(--text)' }}>
            Worn <strong>{wearsThisWeek}</strong> time{wearsThisWeek !== 1 ? 's' : ''} this week
          </p>
        </div>
      )}

      {alsoOwnFragrances.length > 0 && (
        <div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
            Members who own this also own:
          </p>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 8 }}>
            {alsoOwnFragrances.map((f: any) => (
              <Link key={f.id} href={`/collection/${f.id}`} style={{ textDecoration: 'none', flexShrink: 0, width: 90 }}>
                <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--r-card)', overflow: 'hidden', background: 'var(--bg)', height: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 8 }}>
                  {f.image_url ? (
                    <div style={{ position: 'relative', width: 60, height: 60, marginBottom: 8 }}>
                      <Image src={f.image_url} alt={f.name} fill style={{ objectFit: 'contain' }} sizes="60px" />
                    </div>
                  ) : (
                    <span style={{ fontSize: 24, marginBottom: 8 }}>{getBrandEmoji(f.brand)}</span>
                  )}
                  <p style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', width: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'center', marginTop: 'auto' }}>{f.brand}</p>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 12, color: 'var(--text)', fontStyle: 'italic', width: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'center' }}>{f.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
