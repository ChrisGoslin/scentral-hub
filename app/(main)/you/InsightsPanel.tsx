'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { formatDate } from '@/lib/engagement'
import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import LoadingShimmer from '@/components/ui/LoadingShimmer'
import ErrorInline from '@/components/ui/ErrorInline'
import Button from '@/components/ui/Button'
import WardrobeIntelligence from './WardrobeIntelligence'

export type WeekWearEntry = {
  fragrance_id: string
  brand: string
  name: string
  count: number
}

export type WishlistFragrance = {
  id: string
  brand: string
  name: string
  image_url: string | null
}

export type SavedCombination = {
  id: string
  name: string | null
  occasion: string | null
  created_at: string | null
  base_sprays: number | null
  top_sprays: number | null
  base_frag: { brand: string; name: string } | null
  top_frag: { brand: string; name: string } | null
}

function SavedItem({ combo }: { combo: SavedCombination }) {
  const baseName = combo.base_frag?.name ?? null
  const topName = combo.top_frag?.name ?? null
  const displayPair =
    baseName && topName
      ? `${baseName} → ${topName}`
      : combo.name ?? 'Formulation'

  const meta = [
    combo.occasion ? combo.occasion.charAt(0).toUpperCase() + combo.occasion.slice(1) : null,
    formatDate(combo.created_at),
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <Card>
      <p style={{ fontSize: 15, color: 'var(--text)', fontFamily: 'var(--font-display)', lineHeight: '20px' }}>
        {displayPair}
      </p>
      {meta && (
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{meta}</p>
      )}
    </Card>
  )
}

function EngagementPrompt({ isWornToday, isAtRisk, streak }: { isWornToday: boolean; isAtRisk: boolean; streak: number }) {
  if (isWornToday) {
    return (
      <div className="flex items-center gap-2 mb-4">
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-success)' }} />
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          Worn today · <span style={{ color: 'var(--text)' }}>{streak} day streak</span>
        </p>
      </div>
    )
  }

  if (isAtRisk) {
    return (
      <div
        className="p-4 rounded-xl border mb-6 animate-pulse"
        style={{ background: '#fffbeb', borderColor: '#fef3c7', borderLeft: '4px solid #d97706' }}
      >
        <p style={{ fontSize: 11, fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          At Risk
        </p>
        <p style={{ fontSize: 13, color: '#92400e', marginTop: 2 }}>
          Keep your {streak} day streak alive. Log a wear before midnight.
        </p>
      </div>
    )
  }

  return null
}

function StatTiles({ ownedCount, weekWear }: { ownedCount: number; weekWear: WeekWearEntry[] }) {
  const totalWears = weekWear.reduce((sum, e) => sum + e.count, 0)
  const topPick = weekWear[0]?.name ?? '—'
  const displayTopPick = topPick.length > 12 ? topPick.slice(0, 12) + '...' : topPick

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
      gap: 12
    }}>
      <div style={{ background: 'var(--surface)', borderRadius: 'var(--r-card)', padding: '16px 12px', textAlign: 'center' }}>
        <p style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>{ownedCount}</p>
        <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginTop: 4 }}>Bottles</p>
      </div>
      <div style={{ background: 'var(--surface)', borderRadius: 'var(--r-card)', padding: '16px 12px', textAlign: 'center' }}>
        <p style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>{totalWears}</p>
        <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginTop: 4 }}>This week</p>
      </div>
      <div style={{ background: 'var(--surface)', borderRadius: 'var(--r-card)', padding: '16px 12px', textAlign: 'center' }}>
        <p style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>{displayTopPick}</p>
        <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginTop: 4 }}>Top pick</p>
      </div>
    </div>
  )
}

function RotationIntelligence({ weekWear, ownedCount }: { weekWear: WeekWearEntry[]; ownedCount: number }) {
  if (weekWear.length === 0) return null

  const top = weekWear[0]
  const anosmiaCandidates = weekWear.filter(w => w.count >= 3)
  const neverWornCount = Math.max(0, ownedCount - weekWear.length)

  return (
    <div style={{ borderTop: '1px solid var(--line)', paddingTop: 20 }}>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
        Rotation Intelligence
      </p>

      <div className="flex items-center justify-between" style={{ padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
        <div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Most worn this week</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontFamily: 'var(--font-display)', marginTop: 2 }}>
            {top.brand} {top.name}
          </p>
        </div>
        <span style={{
          fontSize: 11, fontWeight: 600, color: 'var(--accent)',
          background: 'var(--surface-2)', border: '1px solid var(--line)',
          borderRadius: 999, padding: '3px 10px', flexShrink: 0,
        }}>
          {top.count}&times;
        </span>
      </div>

      {anosmiaCandidates.length > 0 && (
        <div style={{ padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
          <div className="flex items-start gap-2">
            <span style={{ fontSize: 14, lineHeight: '20px', color: '#d97706', flexShrink: 0 }}>⚠</span>
            <div>
              <p style={{ fontSize: 13, color: 'var(--text)' }}>Anosmia risk</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                {anosmiaCandidates.map(w => `${w.name} (${w.count}×)`).join(', ')} — worn too frequently this week
              </p>
            </div>
          </div>
        </div>
      )}

      {neverWornCount > 0 && (
        <div className="flex items-center justify-between" style={{ padding: '10px 0' }}>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Never worn</p>
          <span style={{ fontSize: 13, color: 'var(--text)' }}>
            {neverWornCount} {neverWornCount === 1 ? 'fragrance' : 'fragrances'}
          </span>
        </div>
      )}
    </div>
  )
}

export type InsightsPanelProps = {
  saves: SavedCombination[]
  fetchError: string | null
  weekWear: WeekWearEntry[]
  ownedCount: number
  isWornToday: boolean
  isAtRisk: boolean
  streak: number
}

export default function InsightsPanel({
  saves,
  fetchError,
  weekWear,
  ownedCount,
  isWornToday,
  isAtRisk,
  streak,
}: InsightsPanelProps) {
  const router = useRouter()
  const [wishlistItems, setWishlistItems] = useState<WishlistFragrance[]>([])
  const [loadingWishlist, setLoadingWishlist] = useState(false)

  useEffect(() => {
    const storedWishlist = localStorage.getItem('scentral_wishlist')
    if (storedWishlist) {
      try {
        const ids: string[] = JSON.parse(storedWishlist)
        if (ids.length > 0) {
          const fetchWishlist = async () => {
            setLoadingWishlist(true)
            const supabase = createClient()
            const { data } = await supabase
              .from('fragrances')
              .select('id, brand, name, image_url')
              .in('id', ids)
            if (data) setWishlistItems(data)
            setLoadingWishlist(false)
          }
          fetchWishlist()
        }
      } catch (e) {
        console.error('Error parsing wishlist', e)
      }
    }
  }, [])

  return (
    <>
      <EngagementPrompt isWornToday={isWornToday} isAtRisk={isAtRisk} streak={streak} />

      <StatTiles ownedCount={ownedCount} weekWear={weekWear} />

      {/* Weekly Stats Section */}
      <section>
        <div className="mb-6">
          <p style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>
            THIS WEEK
          </p>
          {weekWear.length > 0 ? (
            <div
              style={{
                display: 'flex',
                gap: 10,
                overflowX: 'auto',
                paddingBottom: 4,
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
            >
              {weekWear.slice(0, 3).map((item, idx) => (
                <div
                  key={item.fragrance_id}
                  style={{
                    minWidth: 140,
                    flexShrink: 0,
                    background: 'var(--surface)',
                    border: '1px solid var(--line)',
                    borderRadius: 'var(--r-card)',
                    padding: 12
                  }}
                >
                  <p style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 700 }}>
                    0{idx + 1}
                  </p>
                  <p style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 8 }}>
                    {item.brand}
                  </p>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 14, color: 'var(--text)', lineHeight: '18px', marginTop: 2, height: 36, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {item.name}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                    {item.count} {item.count === 1 ? 'wear' : 'wears'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              headline="Your scent trail starts here"
              caption="Log a wear on any bottle to begin tracking your rotation."
            />
          )}
        </div>

        {/* Wishlist Section */}
        <div className="mb-6">
          <p style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>
            MY WISHLIST
          </p>
          {loadingWishlist ? (
            <LoadingShimmer variant="line" />
          ) : wishlistItems.length === 0 ? (
            <EmptyState
              headline="Your wishlist is empty"
              caption="Heart a fragrance in the catalogue to save it for later."
              action={<Button variant="secondary" onClick={() => router.push('/discover')}>Explore Catalogue</Button>}
            />
          ) : (
            <div className="flex flex-col">
              {wishlistItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/collection/${item.id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 0',
                    borderBottom: '1px solid var(--line)',
                    textDecoration: 'none'
                  }}
                >
                  <Image
                    src={item.image_url ?? '/placeholder-bottle.png'}
                    alt={item.name}
                    width={48}
                    height={48}
                    style={{ objectFit: 'contain', borderRadius: 8 }}
                  />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {item.brand}
                    </p>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: 14, color: 'var(--text)', marginTop: 2 }}>
                      {item.name}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Saved list */}
      <div className="flex flex-col gap-3">
        <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Saved ({saves.length})
        </p>

        {fetchError ? (
          <ErrorInline message={fetchError} />
        ) : saves.length === 0 ? (
          <EmptyState
            headline="No saves yet."
            caption="Formulate a pairing in the Lab and save it here."
          />
        ) : (
          <div className="flex flex-col gap-3">
            {saves.map(combo => (
              <SavedItem key={combo.id} combo={combo} />
            ))}
          </div>
        )}
      </div>

      {/* Rotation Intelligence */}
      <RotationIntelligence weekWear={weekWear} ownedCount={ownedCount} />

      {/* Wardrobe Intelligence */}
      <WardrobeIntelligence />
    </>
  )
}
