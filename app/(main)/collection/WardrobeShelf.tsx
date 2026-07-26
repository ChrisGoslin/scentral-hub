'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import Link from 'next/link'
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
import { CollectionShelfModal } from '@/components/collection/CollectionShelfModal'
import { getBrandEmoji } from '@/lib/brandEmoji'
import { AFFINITY_TIER_DEFS, type TierKey, getAffinityTier } from '@/lib/affinity'
import EmptyState from '@/components/ui/EmptyState'
import Button from '@/components/ui/Button'
import { SafeFragranceImage } from '@/components/fragrance/SafeFragranceImage'
import PostItNote from '@/components/ui/PostItNote'
import SketchAnnotation from '@/components/ui/SketchAnnotation'
import { getPersonaById, type Persona } from '@/lib/personas'

// ─── Types ───────────────────────────────────────────────────────────────────

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

const SEASON_GROUPS: Array<{ label: string; values: Array<string | null> }> = [
  { label: 'Summer', values: ['High Heat'] },
  { label: 'Spring', values: ['Spring/Summer'] },
  { label: 'Autumn / Winter', values: ['Winter/Fall'] },
  { label: 'Year-Round', values: ['All-Year', null] },
]

const CABINET_ID = 'CAB-MAIN-001' as const

// ─── Helpers ─────────────────────────────────────────────────────────────────

function classifyToTier(f: CollectionFragrance): TierKey {
  return getAffinityTier(f.affinity_score).tier
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
    shelves: AFFINITY_TIER_DEFS.map((def, i) => ({
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

function GroupShelf({ label, items, isHighlighted = false, filterActive = false }: { label: string; items: CollectionFragrance[], isHighlighted?: boolean, filterActive?: boolean }) {
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
            {filterActive ? 'No fragrances match this lens' : 'None in collection'}
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
  return (
    <SafeFragranceImage
      imageUrl={f.image_url}
      brand={f.brand}
      name={f.name}
      family={f.family}
      sizes="64px"
      wrapperStyle={{ width: '100%', aspectRatio: '3/4' }}
      imageStyle={{ objectFit: 'contain', borderRadius: 4 }}
      fallback={
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
          <span style={{ fontSize: 24 }}>{getBrandEmoji(f.brand)}</span>
          <p style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center', lineHeight: '10px' }}>
            {f.brand.length > 10 ? f.brand.slice(0, 9) + '…' : f.brand}
          </p>
          <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.8)', fontFamily: 'var(--font-display)', textAlign: 'center', lineHeight: '11px' }}>
            {f.name.length > 14 ? f.name.slice(0, 12) + '…' : f.name}
          </p>
        </div>
      }
    />
  )
}

function ByHouseView({ items, filterActive = false }: { items: CollectionFragrance[], filterActive?: boolean }) {
  const [activePersona, setActivePersona] = useState<string | null>(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
        <GroupShelf key={brand} label={brand} items={byBrand[brand]} isHighlighted={shouldHighlight(brand)} filterActive={filterActive} />
      ))}
    </div>
  )
}

function BySeasonView({ items, filterActive = false }: { items: CollectionFragrance[], filterActive?: boolean }) {
  return (
    <div style={{ paddingTop: 4, paddingBottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))' }}>
      {SEASON_GROUPS.map(sg => (
        <GroupShelf
          key={sg.label}
          label={sg.label}
          items={items.filter(f => sg.values.includes(f.optimal_season ?? null))}
          filterActive={filterActive}
        />
      ))}
    </div>
  )
}

function WishlistView({ items, filterActive = false }: { items: CollectionFragrance[], filterActive?: boolean }) {
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
            {filterActive ? 'No fragrances match this lens' : 'All catalogued fragrances are in your collection'}
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
  filterActive?: boolean
}

export default function WardrobeShelf({ fragrances }: WardrobeShelfProps) {
  const owned = fragrances.filter(f => f.collection_added_at != null)
  const [wishlistIds, setWishlistIds] = useState<string[]>([])
  const [isMobile, setIsMobile] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [pendingBottle, setPendingBottle] = useState<CollectionFragrance | null>(null)
  const [clientPersona, setClientPersona] = useState<Persona | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true)
    try {
      const stored = localStorage.getItem('scentral_wishlist')
       
      if (stored) setWishlistIds(JSON.parse(stored))
    } catch { /* ignore */ }
    try {
      const personaId = localStorage.getItem('scentral_persona')
      if (personaId) {
        const p = getPersonaById(personaId)
         
        if (p) setClientPersona(p)
      }
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
  useEffect(() => {
    tiersRef.current = tiers
  }, [tiers])

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
    if (AFFINITY_TIER_DEFS.find(d => d.key === overContainer)?.locked) return

    // Check if dropping into tier0 (Top Signatures) and it already has 20 items
    if (overContainer === 'tier0' && current.tier0.length >= 20) {
      // Don't allow drop visually, but prepare modal
      const movedFragrance = current[activeContainer].find(f => f.id === activeItemId)
      if (movedFragrance) {
        setPendingBottle(movedFragrance)
        setIsModalOpen(true)
      }
      return
    }

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

  const onDemote = useCallback(async (bottleIdToDemote: string) => {
    if (!pendingBottle) return

    const current = tiersRef.current
    const newTiers: TierState = {
      tier0: current.tier0.filter(f => f.id !== bottleIdToDemote),
      tier1: [...current.tier1, current.tier0.find(f => f.id === bottleIdToDemote)!],
      tier2: current.tier2,
      tier3: current.tier3,
    }

    // Move pending bottle from its source tier to tier0
    const pendingSource = findContainer(current, pendingBottle.id)
    if (pendingSource && pendingSource !== 'tier0') {
      newTiers[pendingSource] = newTiers[pendingSource].filter(f => f.id !== pendingBottle.id)
      newTiers.tier0.push(pendingBottle)
    }

    setTiers(newTiers)
    tiersRef.current = newTiers

    // Persist to Supabase
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await Promise.all([
        supabase
          .from('collections')
          .update({ affinity_score: 11 }) // Move demoted bottle to tier1
          .eq('fragrance_id', bottleIdToDemote)
          .eq('user_id', user.id),
        supabase
          .from('collections')
          .update({ affinity_score: 18 }) // Move pending bottle to tier0
          .eq('fragrance_id', pendingBottle.id)
          .eq('user_id', user.id),
      ])
    }

    // Vision pipeline snapshot
    const snap: CabinetSnapshot = buildSnapshot(newTiers, new Date().toISOString())
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cabinetSnapshot', { detail: snap }))
    }
    if (process.env.NODE_ENV === 'development') {
      console.log('[Wardrobe Vision Pipeline]', JSON.stringify(snap, null, 2))
    }

    setIsModalOpen(false)
    setPendingBottle(null)
  }, [pendingBottle, supabase])

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
      const tierDef = AFFINITY_TIER_DEFS.find(d => d.key === overContainer)
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

    // Vision pipeline snapshot — fires in all environments; future CV pipeline listens via window event
    const snap: CabinetSnapshot = buildSnapshot(newTiers, new Date().toISOString())
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cabinetSnapshot', { detail: snap }))
    }
    if (process.env.NODE_ENV === 'development') {
      console.log('[Wardrobe Vision Pipeline]', JSON.stringify(snap, null, 2))
    }
  }, [supabase])

  if (owned.length === 0) {
    return (
      <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
        <EmptyState
          headline="Your cabinet is waiting"
          caption="Add your first bottle from The Study to begin arranging your archive."
          action={
            <Link href="/study" style={{ textDecoration: 'none' }}>
              <Button>Enter The Study</Button>
            </Link>
          }
        />
      </div>
    )
  }

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
              {AFFINITY_TIER_DEFS.map(def => (
                <ShelfTier
                  key={def.key}
                  tierId={def.key}
                  label={def.label}
                  sublabel={def.sublabel}
                  items={applyLensFilter(tiers[def.key])}
                  locked={def.locked}
                  activeId={activeId}
                  isMobile={isMobile}
                  filterActive={activeLens !== null}
                />
              ))}
            </div>
            <div style={{ height: 'calc(5rem + env(safe-area-inset-bottom, 0px))' }} />
          </DndContext>
        )}

        {viewMode === 'byHouse' && <ByHouseView items={applyLensFilter(owned)} filterActive={activeLens !== null} />}
        {viewMode === 'bySeason' && <BySeasonView items={applyLensFilter(owned)} filterActive={activeLens !== null} />}
        {viewMode === 'wishlist' && <WishlistView items={applyLensFilter(wishlist)} filterActive={activeLens !== null} />}

        {isMounted && (
          <div style={{
            marginTop: 40,
            paddingTop: 24,
            borderTop: '1px dashed rgba(255,255,255,0.15)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
            width: '100%',
            paddingBottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))'
          }}>
            {clientPersona ? (
              <>
                <SketchAnnotation color="gold" arrowDirection="down-right" arrowPlacement="before">
                  Persona Profile: {clientPersona.name}
                </SketchAnnotation>
                
                <PostItNote variant="brass" rotation="slight-left" style={{ maxWidth: 400, width: '100%' }}>
                  <h4 style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
                    {clientPersona.name}
                  </h4>
                  <p style={{ fontStyle: 'italic', fontSize: 13, marginBottom: 12 }}>
                    &ldquo;{clientPersona.narrative.tagline}&rdquo;
                  </p>
                  {clientPersona.recommendations.layering_tips.length > 0 && (
                    <div style={{ fontSize: 12 }}>
                      <strong style={{ display: 'block', marginBottom: 4 }}>Layering Suggestions:</strong>
                      <ul style={{ paddingLeft: 16, margin: 0, listStyleType: 'disc' }}>
                        {clientPersona.recommendations.layering_tips.map((tip, idx) => (
                          <li key={idx} style={{ marginBottom: 4 }}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </PostItNote>
              </>
            ) : (
              <>
                <SketchAnnotation color="clay" arrowDirection="down-right" arrowPlacement="before">
                  Continue the read
                </SketchAnnotation>
                
                <PostItNote variant="clay" rotation="slight-left" style={{ maxWidth: 400, width: '100%' }}>
                  <h4 style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
                    Your Scent Journey
                  </h4>
                  <p style={{ fontStyle: 'italic', fontSize: 13, marginBottom: 12 }}>
                    &ldquo;Find the scent identity that truly resonates with you.&rdquo;
                  </p>
                  <div style={{ fontSize: 12 }}>
                    <p style={{ margin: 0 }}>
                      Visit <strong>The Archive</strong> to take the read and unlock personalised notes for this cabinet.
                    </p>
                  </div>
                </PostItNote>
              </>
            )}
          </div>
        )}
      </div>

      {/* Collection Shelf Modal — triggers when trying to add 21st bottle to Top Shelf */}
      <CollectionShelfModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setPendingBottle(null)
        }}
        onDemote={onDemote}
        newBottle={
          pendingBottle
            ? { id: pendingBottle.id, full_name: `${pendingBottle.brand} ${pendingBottle.name}` }
            : { id: '', full_name: '' }
        }
        currentTopShelf={tiers.tier0.map(f => ({ id: f.id, full_name: `${f.brand} ${f.name}` }))}
      />
    </div>
  )
}
