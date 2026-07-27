import { Metadata } from 'next'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { permanentRedirect } from 'next/navigation'
import Button from '@/components/ui/Button'
import YouClient, { type SavedCombination, type WeekWearEntry } from './YouClient'
import { mapSearchParamsToString } from '@/lib/rebrand'
import { getArchiveSession } from '../archive/archive-session'

export const metadata: Metadata = {
  title: 'Archive | nota.',
  description: 'Review what you wear, save favourite layering combinations, and watch your scent archive gather patina.',
  alternates: { canonical: '/archive' },
}

export const dynamic = 'force-dynamic'

interface RawWearLogRow {
  col: Array<{
    fragrance_id: string | null
    frag: Array<{ brand: string; name: string }>
  }> | {
    fragrance_id: string | null
    frag: { brand: string; name: string } | Array<{ brand: string; name: string }> | null
  } | null
}

export async function ArchivePageContent() {
  const { supabase, session } = await getArchiveSession()

  if (!session) {
    return (
      <div style={{ background: 'var(--bg)', minHeight: '100dvh', paddingTop: 'calc(44px + env(safe-area-inset-top, 0px))' }}>
        <div className="px-4 pt-8 pb-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--line)' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--text)', lineHeight: '34px' }}>Archive</h1>
        </div>
        <div className="px-4 py-8">
          <div
            style={{
              maxWidth: 420,
              margin: '0 auto',
              minHeight: '60vh',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: 16,
              padding: 24,
              borderRadius: 20,
              border: '1px solid color-mix(in srgb, var(--accent) 20%, var(--line))',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
              textAlign: 'center',
            }}
          >
              <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--text-muted)', margin: 0 }}>
                Archive
              </p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--text)', lineHeight: '34px', fontStyle: 'italic', margin: 0 }}>
                Your dossier is waiting.
              </h2>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: '22px', margin: 0 }}>
                Take the read, then keep your scent identity, saved artifacts, and wearing rhythm together.
              </p>
            <div style={{ display: 'grid', gap: 8, textAlign: 'left', fontSize: 13, color: 'var(--text-muted)' }}>
              <div>• Save your scent identity</div>
              <div>• See your evolving taste profile</div>
              <div>• Keep your wishlist and rituals together</div>
            </div>
            <div style={{ display: 'grid', gap: 10, marginTop: 8 }}>
              <Link href="/onboarding" style={{ width: '100%' }}>
                <Button fullWidth>Begin your Read</Button>
              </Link>
              <Link href="/login?next=/archive" style={{ width: '100%' }}>
                <Button fullWidth variant="secondary">Sign in to continue</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  // Three parallel fetches — RLS enforces user isolation on all three
  const [
    { data: savesRaw, error: savesError },
    { data: wearRaw },
    { count: ownedCount },
  ] = await Promise.all([
    supabase
      .from('layering_combinations')
      .select(`
        id,
        name,
        occasion,
        created_at,
        base_sprays,
        top_sprays,
        base_frag:fragrances!base_fragrance_id(brand, name),
        top_frag:fragrances!top_fragrance_id(brand, name)
      `)
      .eq('is_saved', true)
      .order('created_at', { ascending: false }),
    supabase
      .from('wear_logs')
      .select('col:collections!wear_logs_collection_id_fkey(fragrance_id, frag:fragrances!collections_fragrance_id_fkey(brand, name))')
      .gte('logged_at', sevenDaysAgo),
    supabase
      .from('collections')
      .select('id', { count: 'exact', head: true }),
  ])

  // Supabase returns multi-FK joins as arrays; unwrap to single object or null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const saves: SavedCombination[] = (savesRaw ?? [] as any[]).map((row: any) => ({
    id: row.id,
    name: row.name,
    occasion: row.occasion,
    created_at: row.created_at,
    base_sprays: row.base_sprays,
    top_sprays: row.top_sprays,
    base_frag: Array.isArray(row.base_frag)
      ? (row.base_frag[0] ?? null)
      : (row.base_frag ?? null),
    top_frag: Array.isArray(row.top_frag)
      ? (row.top_frag[0] ?? null)
      : (row.top_frag ?? null),
  }))

  // Group wear_logs by fragrance_id, counting occurrences in the last 7 days
  const wearMap = new Map<string, WeekWearEntry>()
  for (const raw of (wearRaw ?? []) as unknown as RawWearLogRow[]) {
    const col = Array.isArray(raw.col) ? raw.col[0] : raw.col
    if (!col?.fragrance_id) continue
    const frag = Array.isArray(col.frag) ? col.frag[0] : col.frag
    if (!frag?.brand || !frag?.name) continue
    const entry = wearMap.get(col.fragrance_id)
    if (entry) {
      entry.count++
    } else {
      wearMap.set(col.fragrance_id, {
        fragrance_id: col.fragrance_id,
        brand: frag.brand,
        name: frag.name,
        count: 1,
      })
    }
  }
  const weekWear: WeekWearEntry[] = [...wearMap.values()].sort((a, b) => b.count - a.count)

  return (
    <YouClient
      state="signed-in"
      email={session.user.email ?? ''}
      saves={saves}
      fetchError={savesError?.message ?? null}
      weekWear={weekWear}
      ownedCount={ownedCount ?? 0}
    />
  )
}

export default async function YouPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const resolvedSearchParams = await searchParams
  permanentRedirect(`/archive${mapSearchParamsToString(resolvedSearchParams)}`)
}
