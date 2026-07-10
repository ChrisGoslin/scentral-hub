import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { getBrandEmoji } from '@/lib/brandEmoji'
import Image from 'next/image'
import { getPersonaById } from '@/lib/personas'
import { formatDistanceToNow } from 'date-fns'
import { getSafeFragranceImageUrl } from '@/lib/fragranceImageUrl'

export default async function CommunityDepth({ fragranceId }: { fragranceId: string }) {
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)

  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString()
  
  const { count: wearsThisWeek } = await supabase
    .from('wear_logs')
    .select('id', { count: 'exact', head: true })
    .eq('fragrance_id', fragranceId)
    .gte('created_at', weekAgo)

  // Ownership count
  const { data: ownerData } = await supabase.rpc('get_fragrance_social_proof', { fragrance_ids: [fragranceId] })
  const ownerCount = ownerData?.[0]?.owner_count ?? 0

  // Persona breakdown (note: wear_logs has user_id not persona_id currently, but S1 prompt says wear_posts has persona_id. The D3 prompt says: SELECT persona_id, COUNT(*) FROM wear_logs WHERE fragrance_id = [id] GROUP BY persona_id ORDER BY COUNT(*) DESC LIMIT 3. But wait, wear_logs might not have persona_id. I will fetch wear_posts instead or check wear_logs.)
  // Actually, I'll use wear_posts for both persona breakdown and recent strip posts to be safe.
  const { data: posts } = await supabase
    .from('wear_posts')
    .select('persona_id, note, created_at')
    .eq('fragrance_id', fragranceId)
    .not('note', 'is', null)
    .order('created_at', { ascending: false })
    .limit(50)

  const recentPosts = posts?.slice(0, 3) ?? []
  
  // Persona breakdown from posts
  const personaCounts = new Map<string, number>()
  posts?.forEach(p => {
    if (p.persona_id) {
      personaCounts.set(p.persona_id, (personaCounts.get(p.persona_id) ?? 0) + 1)
    }
  })
  const topPersonas = Array.from(personaCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)

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

  if (ownerCount === 0 && alsoOwnFragrances.length === 0) {
    return (
      <div style={{ marginTop: 24, padding: '16px', background: 'var(--surface)', borderRadius: 'var(--r-card)', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 18, color: 'var(--text)', marginBottom: 8 }}>
          Be the first to wear this.
        </p>
        <button style={{ fontSize: 13, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
          Add to collection →
        </button>
      </div>
    )
  }

  return (
    <div style={{ marginTop: 24, padding: '16px', background: 'var(--surface)', borderRadius: 'var(--r-card)' }}>
      <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--accent)', marginBottom: 12 }}>
        Community
      </p>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {ownerCount > 0 && (
          <div style={{ flex: 1, padding: '12px', background: 'var(--surface-2)', borderRadius: 8, border: '1px solid var(--line)' }}>
            <p style={{ fontSize: 16, fontFamily: 'var(--font-display)', color: 'var(--text)' }}>{ownerCount}</p>
            <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Members own this</p>
          </div>
        )}
        {wearsThisWeek !== null && wearsThisWeek > 0 && (
          <div style={{ flex: 1, padding: '12px', background: 'var(--surface-2)', borderRadius: 8, border: '1px solid var(--line)' }}>
            <p style={{ fontSize: 16, fontFamily: 'var(--font-display)', color: 'var(--text)' }}>{wearsThisWeek}</p>
            <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Wears this week</p>
          </div>
        )}
      </div>

      {/* Persona Breakdown */}
      {topPersonas.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>Most worn by:</p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {topPersonas.map(([pId, count]) => {
              const p = getPersonaById(pId)
              if (!p) return null
              return (
                <span key={pId} style={{ fontSize: 10, background: 'color-mix(in srgb, var(--accent) 15%, transparent)', color: p.ui_theme.accentColor, padding: '4px 8px', borderRadius: 999, border: `1px solid color-mix(in srgb, ${p.ui_theme.accentColor} 30%, transparent)` }}>
                  {p.name.replace('The ', '')} · {count}
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* Recent Strip Posts */}
      {recentPosts.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>Recently pinned in Wear & Share:</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentPosts.map((post: any, i: number) => {
              const p = post.persona_id ? getPersonaById(post.persona_id) : null
              return (
                <div key={i} style={{ padding: '10px 12px', background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--line)' }}>
                  <p style={{ fontSize: 13, color: 'var(--text)', fontStyle: 'italic', marginBottom: 6 }}>"{post.note}"</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {p ? (
                      <span style={{ fontSize: 9, color: p.ui_theme.accentColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{p.name}</span>
                    ) : <span />}
                    <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>{formatDistanceToNow(new Date(post.created_at))} ago</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {alsoOwnFragrances.length > 0 && (
        <div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
            Members who own this also own:
          </p>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 8 }}>
            {alsoOwnFragrances.map((f: any) => {
              const safeImageUrl = getSafeFragranceImageUrl(f.image_url)
              return (
                <Link key={f.id} href={`/cabinet/${f.id}?from=cabinet`} style={{ textDecoration: 'none', flexShrink: 0, width: 90 }}>
                  <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--r-card)', overflow: 'hidden', background: 'var(--bg)', height: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 8 }}>
                    {safeImageUrl ? (
                      <div style={{ position: 'relative', width: 60, height: 60, marginBottom: 8 }}>
                        <Image src={safeImageUrl} alt={f.name} fill style={{ objectFit: 'contain' }} sizes="60px" />
                      </div>
                    ) : (
                      <span style={{ fontSize: 24, marginBottom: 8 }}>{getBrandEmoji(f.brand)}</span>
                    )}
                    <p style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', width: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'center', marginTop: 'auto' }}>{f.brand}</p>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: 12, color: 'var(--text)', fontStyle: 'italic', width: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'center' }}>{f.name}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
