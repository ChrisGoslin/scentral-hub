'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import Image from 'next/image'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { createClient } from '@/utils/supabase/client'
import { type CollectionFragrance } from './CollectionClient'
import ShelfTier from './ShelfTier'
import WardrobeSidebar, { type ViewMode, type LensKey, type LensFilters } from './WardrobeSidebar'
import { getBrandEmoji } from '@/lib/brandEmoji'

// ─── Types ───────────────────────────────────────────────────────────────────

type TierKey = 'tier0' | 'tier1' | 'tier2' | 'tier3'
type TierState = Record<TierKey, CollectionFragrance[]>

type CabinetSnapshot = {
  cabinetId: 'CAB-MAIN-001'
  updatedAt: string
  shelves: Array<{
    shelfIndex: number
    shelfType: string
    items: Array<{ slotIndex: number; fragranceId: string; nomenclature: string }>
  }>
}

// ─── Constants ───────────────────────────────────────────────────────────────

const TIER_DEFS = [
  { key: 'tier0' as TierKey, type: 'TOP_SHELF_SIGNATURES', label: 'Signatures', sublabel: 'Active Top 20', minScore: 16, maxScore: 20, assignScore: 18, locked: false },
  { key: 'tier1' as TierKey, type: 'MIDDLE_SHELF', label: 'Occasion Modifiers', sublabel: 'Transitional', minScore: 8, maxScore: 15, assignScore: 11, locked: false },
  { key: 'tier2' as TierKey, type: 'LOWER_SHELF', label: 'Base Anchors', sublabel: 'Dense Ouds', minScore: 1, maxScore: 7, assignScore: 4, locked: false },
  { key: 'tier3' as TierKey, type: 'HOLDING_ZONE', label: 'Benching', sublabel: 'New / Unrated', minScore: 0, maxScore: 0, assignScore: 0, locked: true },
]

const SEASON_GROUPS: Array<{ label: string; values: Array<string | null> }> = [
  { label: 'Summer', values: ['High Heat'] },
  { label: 'Spring', values: ['Spring/Summer'] },
  { label: 'Autumn / Winter', values: ['Winter/Fall'] },
  { label: 'Year-Round', values: ['All-Year', null] },
]

const CABINET_ID = 'CAB-MAIN-001' as const

// ─── Helpers ─────────────────────────────────────────────────────────────────

function classifyToTier(f: CollectionFragrance): TierKey {
  const s = f.affinity_score
  if (s == null || s === 0) return 'tier3'
  if (s >= 16) return 'tier0'
  if (s >= 8) return 'tier1'
  return 'tier2'
}

function buildInitialTierState(owned: CollectionFragrance[]): TierState {
  const state: TierState = { tier0: [], tier1: [], tier2: [], tier3: [] }
  for (const f of owned) {
    state[classifyToTier(f)].push(f)
  }
  return state
}

function buildSnapshot(tiers: TierState, updatedAt: string): CabinetSnapshot {
  return {
    cabinetId: CABINET_ID,
    updatedAt,
    shelves: TIER_DEFS.map((def, i) => ({
      shelfIndex: i,
      shelfType: def.type,
      items: tiers[def.key].map((f, si) => ({
        slotIndex: si,
        fragranceId: f.id,
        nomenclature: `${f.brand} ${f.name}`,
      })),
    })),
  }
}

function findContainer(tiers: TierState, id: string): TierKey | undefined {
  // id might be a tier key itself (drop onto empty container)
  if (id in tiers) return id as TierKey
  for (const key of Object.keys(tiers) as TierKey[]) {
    if (tiers[key].some(f => f.id === id)) return key
  }
  return undefined
}

// ─── Sub-views ───────────────────────────────────────────────────────────────

function GroupShelf({ label, items, isHighlighted = false }: { label: string; items: CollectionFragrance[], isHighlighted?: boolean }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ marginBottom: 6, paddingLeft: 4, display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: 'rgba(248,247,245,0.9)' }}>
          {label}
        </span>
        <span style={{ fontSize: 10, color: 'rgba(196,154,60,0.6)', fontWeight: 600 }}>
          {items.length}
        </span>
      </div>
      <div style={{
        background: isHighlighted ? 'rgba(160, 98, 42, 0.15)' : 'rgba(0,0,0,0.25)',
        borderTop: '2px solid rgba(196,154,60,0.3)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.12), 0 1px 0 rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.6)',
        borderRadius: 2,
        padding: '10px 10px 14px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 8,
        minHeight: 80,
      }}>
        {items.length === 0 ? (
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.06em', alignSelf: 'center', width: '100%', textAlign: 'center' }}>
            None in collection
          </p>
        ) : items.map(f => (
          <div key={f.id} style={{
            width: 72,
            padding: 6,
            borderRadius: 8,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            <MiniBottle f={f} />
          </div>
        ))}
      </div>
    </div>
  )
}

function MiniBottle({ f }: { f: CollectionFragrance }) {
  const [failed, setFailed] = useState(false)
  if (!f.image_url || failed) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <span style={{ fontSize: 24 }}>{getBrandEmoji(f.brand)}</span>
        <p style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center', lineHeight: '10px' }}>
          {f.brand.length > 10 ? f.brand.slice(0, 9) + '…' : f.brand}
        </p>
        <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.8)', fontFamily: 'var(--font-display)', textAlign: 'center', lineHeight: '11px' }}>
          {f.name.length > 14 ? f.name.slice(0, 12) + '…' : f.name}
        </p>
      </div>
    )
  }
  return (
    <div style={{ width: '100%', aspectRatio: '3/4', position: 'relative' }}>
      <Image
        src={f.image_url || '/placeholder-bottle.png'}
        alt={`${f.brand} ${f.name}`}
        fill
        sizes="64px"
        style={{ objectFit: 'contain', borderRadius: 4 }}
        onError={() => setFailed(true)}
      />
    </div>
  )
}

function ByHouseView({ items }: { items: CollectionFragrance[] }) {
  const [activePersona, setActivePersona] = useState<string | null>(null)

  useEffect(() => {
    setActivePersona(localStorage.getItem('scentral_persona'))
  }, [])

  const byBrand = items.reduce<Record<string, CollectionFragrance[]>>((acc, f) => {
    if (!acc[f.brand]) acc[f.brand] = []
    acc[f.brand].push(f)
    return acc
  }, {})
  const brands = Object.keys(byBrand).sort()

  const shouldHighlight = (brand: string) => {
    if (activePersona === 'velvet_intellectual' || activePersona === 'dark_alchemist') {
      return ['Lattafa', 'Afnan', 'Khadlaj'].includes(brand)
    }
    return false
  }

  return (
    <div style={{ paddingTop: 4, paddingBottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))' }}>
      {brands.map(brand => (
        <GroupShelf key={brand} label={brand} items={byBrand[brand]} isHighlighted={shouldHighlight(brand)} />
      ))}
    </div>
  )
}

function BySeasonView({ items }: { items: CollectionFragrance[] }) {
  return (
    <div style={{ paddingTop: 4, paddingBottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))' }}>
      {SEASON_GROUPS.map(sg => (
        <GroupShelf
          key={sg.label}
          label={sg.label}
          items={items.filter(f => sg.values.includes(f.optimal_season ?? null))}
        />
      ))}
    </div>
  )
}

function WishlistView({ items }: { items: CollectionFragrance[] }) {
  return (
    <div style={{ paddingTop: 4, paddingBottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))' }}>
      <div style={{ marginBottom: 8, paddingLeft: 4, display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: 'rgba(248,247,245,0.9)' }}>
          Not Yet Owned
        </span>
        <span style={{ fontSize: 10, color: 'rgba(196,154,60,0.6)', fontWeight: 600 }}>
          {items.length}
        </span>
      </div>
      <div style={{
        background: 'rgba(248,247,245,0.04)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderTop: '2px solid rgba(255,255,255,0.15)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.12), 0 1px 0 rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.4)',
        borderRadius: 2,
        padding: '10px 10px 14px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 8,
        minHeight: 80,
      }}>
        {items.length === 0 ? (
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em', alignSelf: 'center', width: '100%', textAlign: 'center' }}>
            All catalogued fragrances are in your collection
          </p>
        ) : items.slice(0, 40).map(f => (
          <div key={f.id} style={{
            width: 72,
            padding: 6,
            borderRadius: 8,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            opacity: 0.7,
          }}>
            <MiniBottle f={f} />
          </div>
        ))}
        {items.length > 40 && (
          <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', alignSelf: 'center', padding: '0 8px' }}>
            +{items.length - 40} more
          </p>
        )}
      </div>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

interface WardrobeShelfProps {
  fragrances: CollectionFragrance[]
}

export default function WardrobeShelf({ fragrances }: WardrobeShelfProps) {
  const owned = fragrances.filter(f => f.collection_added_at != null)
  const [wishlistIds, setWishlistIds] = useState<string[]>([])
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('scentral_wishlist')
      if (stored) setWishlistIds(JSON.parse(stored))
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 480)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const wishlist = fragrances.filter(f => wishlistIds.includes(f.id))

  const [viewMode, setViewMode] = useState<ViewMode>('all')
  const [activeLens, setActiveLens] = useState<LensKey | null>(null)
  const [lensFilters, setLensFilters] = useState<LensFilters | null>(null)
  const [tiers, setTiers] = useState<TierState>(() => buildInitialTierState(owned))
  const [activeId, setActiveId] = useState<string | null>(null)

  function applyLensFilter(items: CollectionFragrance[]): CollectionFragrance[] {
    if (!lensFilters) return items
    return items.filter(f => {
      const matchProjection = !lensFilters.projections || lensFilters.projections.includes(f.projection)
      const matchSeason = !lensFilters.seasons || lensFilters.seasons.includes(f.optimal_season ?? '')
      const matchUseCase = !lensFilters.useCases || (
        f.use_case != null &&
        lensFilters.useCases.some(u => f.use_case!.toLowerCase().includes(u))
      )
      // Agadir: projection AND season; Executive/Comfort: projection OR useCase
      if (lensFilters.seasons && lensFilters.useCases) {
        return matchProjection && (matchSeason || matchUseCase)
      }
      if (lensFilters.seasons) {
        return matchProjection && matchSeason
      }
      return matchProjection || matchUseCase
    })
  }

  function handleLensSelect(lens: LensKey | null, filters: LensFilters | null) {
    setActiveLens(lens)
    setLensFilters(filters)
  }

  // Ref keeps DnD handlers from going stale between renders
  const tiersRef = useRef<TierState>(tiers)
  tiersRef.current = tiers

  const supabase = createClient()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  function onDragStart({ active }: DragStartEvent) {
    setActiveId(String(active.id))
  }

  function onDragOver({ active, over }: DragOverEvent) {
    if (!over) return
    const activeItemId = String(active.id)
    const overId = String(over.id)
    const current = tiersRef.current

    const activeContainer = findContainer(current, activeItemId)
    const overContainer = findContainer(current, overId)

    if (!activeContainer || !overContainer || activeContainer === overContainer) return
    if (TIER_DEFS.find(d => d.key === overContainer)?.locked) return

    setTiers(prev => {
      const sourceItems = [...prev[activeContainer]]
      const destItems = [...prev[overContainer]]
      const activeIndex = sourceItems.findIndex(f => f.id === activeItemId)
      if (activeIndex === -1) return prev

      const [moved] = sourceItems.splice(activeIndex, 1)
      const overIndex = destItems.findIndex(f => f.id === overId)
      if (overIndex === -1) {
        destItems.push(moved)
      } else {
        destItems.splice(overIndex, 0, moved)
      }

      return { ...prev, [activeContainer]: sourceItems, [overContainer]: destItems }
    })
  }

  const onDragEnd = useCallback(async ({ active, over }: DragEndEvent) => {
    setActiveId(null)
    if (!over) return

    const activeItemId = String(active.id)
    const overId = String(over.id)
    const current = tiersRef.current

    const activeContainer = findContainer(current, activeItemId)
    const overContainer = findContainer(current, overId)

    if (!activeContainer || !overContainer) return

    let newTiers = current

    if (activeContainer === overContainer) {
      // Within-tier reorder
      const items = current[activeContainer]
      const oldIndex = items.findIndex(f => f.id === activeItemId)
      const newIndex = items.findIndex(f => f.id === overId)
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        newTiers = { ...current, [activeContainer]: arrayMove(items, oldIndex, newIndex) }
        setTiers(newTiers)
        tiersRef.current = newTiers
      }
    } else {
      // Cross-tier drop: tiers already updated in onDragOver — persist to Supabase
      newTiers = tiersRef.current
      const tierDef = TIER_DEFS.find(d => d.key === overContainer)
      if (tierDef && !tierDef.locked) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await supabase
            .from('collections')
            .update({ affinity_score: tierDef.assignScore })
            .eq('fragrance_id', activeItemId)
            .eq('user_id', user.id)
        }
      }
    }

    // Vision pipeline snapshot
    if (process.env.NODE_ENV === 'development') {
      const snap: CabinetSnapshot = buildSnapshot(newTiers, new Date().toISOString())
      console.log('[Wardrobe Vision Pipeline]', JSON.stringify(snap, null, 2))
    }
  }, [supabase])

  return (
    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', minHeight: '80vh' }}>
      {/* Sidebar / tab strip */}
      <WardrobeSidebar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        activeLens={activeLens}
        onLensSelect={handleLensSelect}
      />

      {/* Cabinet frame */}
      <div
        style={{
          flex: 1,
          background: `
            repeating-linear-gradient(
              90deg,
              transparent 0px,
              transparent 3px,
              rgba(0,0,0,0.04) 3px,
              rgba(0,0,0,0.04) 6px
            ),
            repeating-linear-gradient(
              178deg,
              var(--cabinet-grain-a, rgb(88,48,18)) 0px,
              var(--cabinet-grain-b, rgb(58,26,10)) 8px,
              var(--cabinet-grain-c, rgb(110,62,24)) 18px,
              var(--cabinet-grain-b, rgb(58,26,10)) 28px,
              var(--cabinet-grain-d, rgb(80,42,14)) 40px
            )
          `,
          backgroundBlendMode: 'multiply',
          boxShadow: 'inset 0 20px 40px rgba(0,0,0,0.8)',
          padding: '20px 16px 24px',
          width: isMobile ? '100%' : 'calc(100% - 80px)',
          overflowY: 'auto',
          overscrollBehavior: 'contain',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {viewMode === 'all' && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {TIER_DEFS.map(def => (
                <ShelfTier
                  key={def.key}
                  tierId={def.key}
                  label={def.label}
                  sublabel={def.sublabel}
                  items={applyLensFilter(tiers[def.key])}
                  locked={def.locked}
                  activeId={activeId}
                  isMobile={isMobile}
                />
              ))}
            </div>
            <div style={{ height: 'calc(5rem + env(safe-area-inset-bottom, 0px))' }} />
          </DndContext>
        )}

        {viewMode === 'byHouse' && <ByHouseView items={applyLensFilter(owned)} />}
        {viewMode === 'bySeason' && <BySeasonView items={applyLensFilter(owned)} />}
        {viewMode === 'wishlist' && <WishlistView items={applyLensFilter(wishlist)} />}
      </div>
    </div>
  )
}
