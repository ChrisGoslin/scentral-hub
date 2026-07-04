'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core'
import { SortableContext, useSortable, rectSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Button from '@/components/ui/Button'
import AuthSheet from '@/components/auth/AuthSheet'
import AuraShelfAdvisory from '@/components/aura/AuraShelfAdvisory'
import type { ShelfSlot, ShelfFragrance } from './types'

// Spec calls for a 300ms "drift/settle" drag animation. There is no 300ms token in
// lib/design/tokens.css (nearest neighbors are --motion-responsive at 200ms and
// --motion-ceremonial at 480ms), so this reuses --motion-organic's spring curve
// (cubic-bezier(0.34, 1.56, 0.64, 1)) scaled to 300ms per the task brief.
const DRIFT_SETTLE = '300ms cubic-bezier(0.34, 1.56, 0.64, 1)'

interface ShelfClientProps {
  slots: ShelfSlot[]
  isSignedIn: boolean
  topThree: Array<{ id: string; name: string; brand: string; family: string | null }>
}

type SearchResult = {
  fragrance: ShelfFragrance & Record<string, unknown>
}

async function postShelfMutation(payload: Record<string, unknown>) {
  const res = await fetch('/api/shelf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.error || 'Shelf request failed')
  }
  return res.json()
}

// ─── Bottle thumbnail ────────────────────────────────────────────────────────

function BottleThumb({ fragrance }: { fragrance: ShelfFragrance }) {
  const [failed, setFailed] = useState(false)
  if (!fragrance.image_url || failed) {
    return (
      <div
        style={{
          width: '100%',
          aspectRatio: '2/3',
          borderRadius: 8,
          background: 'var(--surface-2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 10,
          color: 'var(--text-muted)',
          textAlign: 'center',
          padding: 6,
        }}
      >
        {fragrance.brand}
      </div>
    )
  }
  return (
    <div style={{ width: '100%', aspectRatio: '2/3', position: 'relative', borderRadius: 8, overflow: 'hidden' }}>
      <Image
        src={fragrance.image_url}
        alt={`${fragrance.brand} ${fragrance.name}`}
        fill
        sizes="(max-width: 480px) 30vw, 160px"
        style={{ objectFit: 'contain', background: 'var(--surface-2)' }}
        onError={() => setFailed(true)}
      />
    </div>
  )
}

// ─── Empty slot ──────────────────────────────────────────────────────────────

function EmptySlot({ rank, onFill }: { rank: number; onFill: () => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: `empty-${rank}` })
  return (
    <button
      ref={setNodeRef}
      onClick={onFill}
      style={{
        width: '100%',
        aspectRatio: '2/3',
        borderRadius: 8,
        border: `1px dashed ${isOver ? 'var(--accent)' : 'var(--line)'}`,
        background: isOver ? 'rgba(196,154,60,0.08)' : 'transparent',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        cursor: 'pointer',
        transition: `border-color var(--motion-responsive), background var(--motion-responsive)`,
        padding: 8,
      }}
    >
      <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-ui)' }}>#{rank}</span>
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontSize: 13,
          color: 'var(--text-muted)',
          textAlign: 'center',
          lineHeight: '17px',
        }}
      >
        Room to be wrong.
      </span>
    </button>
  )
}

// ─── Filled slot (sortable) ──────────────────────────────────────────────────

function FilledSlot({
  slot,
  onRemove,
  onReplace,
}: {
  slot: ShelfSlot
  onRemove: () => void
  onReplace: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: slot.itemId!,
  })

  const style: React.CSSProperties = {
    width: '100%',
    transform: CSS.Transform.toString(transform),
    transition: transition ? `${transition}` : `transform ${DRIFT_SETTLE}`,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
    touchAction: 'none',
    position: 'relative',
  }

  const f = slot.fragrance!

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div
        style={{
          position: 'absolute',
          top: 6,
          left: 6,
          zIndex: 2,
          fontSize: 10,
          fontFamily: 'var(--font-ui)',
          color: 'var(--bg)',
          background: 'var(--accent)',
          borderRadius: 999,
          width: 20,
          height: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
        }}
      >
        {slot.rank}
      </div>
      {slot.source === 'noseprint_match' && (
        <div
          style={{
            position: 'absolute',
            top: 6,
            right: 6,
            zIndex: 2,
            fontSize: 8,
            fontFamily: 'var(--font-ui)',
            color: 'var(--accent)',
            background: 'var(--aura-surface, rgba(0,0,0,0.5))',
            border: '1px solid var(--aura-border, transparent)',
            borderRadius: 999,
            padding: '2px 6px',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          Noseprint
        </div>
      )}

      <BottleThumb fragrance={f} />

      <div style={{ marginTop: 6 }}>
        <p style={{ fontSize: 11, fontFamily: 'var(--font-ui)', color: 'var(--text)', lineHeight: '14px' }}>
          {f.brand}
        </p>
        <p style={{ fontSize: 12, fontFamily: 'var(--font-display)', color: 'var(--text)', lineHeight: '16px' }}>
          {f.name}
        </p>
      </div>

      <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
        <button
          onPointerDown={e => e.stopPropagation()}
          onClick={e => {
            e.stopPropagation()
            onReplace()
          }}
          style={{
            flex: 1,
            fontSize: 10,
            fontFamily: 'var(--font-ui)',
            color: 'var(--text-muted)',
            background: 'var(--surface-2)',
            border: 'none',
            borderRadius: 6,
            padding: '6px 4px',
            cursor: 'pointer',
          }}
        >
          Replace
        </button>
        <button
          onPointerDown={e => e.stopPropagation()}
          onClick={e => {
            e.stopPropagation()
            onRemove()
          }}
          style={{
            flex: 1,
            fontSize: 10,
            fontFamily: 'var(--font-ui)',
            color: 'var(--danger, #c0392b)',
            background: 'var(--surface-2)',
            border: 'none',
            borderRadius: 6,
            padding: '6px 4px',
            cursor: 'pointer',
          }}
        >
          Remove
        </button>
      </div>
    </div>
  )
}

// ─── Catalog search sheet ────────────────────────────────────────────────────

function SearchSheet({
  onClose,
  onSelect,
}: {
  onClose: () => void
  onSelect: (fragrance: ShelfFragrance) => void
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ShelfFragrance[]>([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const trimmedQuery = query.trim()

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (trimmedQuery.length < 2) {
      return
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}&mode=exact`)
        const data = await res.json()
        const fragrances: ShelfFragrance[] = (data.results ?? []).map((r: SearchResult) => ({
          id: r.fragrance.id as string,
          brand: r.fragrance.brand as string,
          name: r.fragrance.name as string,
          family: (r.fragrance.family as string) ?? null,
          image_url: (r.fragrance.image_url as string) ?? null,
        }))
        setResults(fragrances)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, trimmedQuery])

  const displayResults = trimmedQuery.length < 2 ? [] : results

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxHeight: '75vh',
          background: 'var(--surface)',
          borderRadius: '16px 16px 0 0',
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 18, color: 'var(--text)' }}>
          Find a replacement
        </p>
        <input
          autoFocus
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search brand or name…"
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 8,
            border: '1px solid var(--line)',
            background: 'var(--surface-2)',
            color: 'var(--text)',
            fontFamily: 'var(--font-ui)',
            fontSize: 14,
          }}
        />
        <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {loading && <p style={{ fontSize: 12, color: 'var(--text-muted)', padding: 8 }}>Searching…</p>}
          {!loading && trimmedQuery.length >= 2 && displayResults.length === 0 && (
            <p style={{ fontSize: 12, color: 'var(--text-muted)', padding: 8 }}>No matches.</p>
          )}
          {displayResults.map(f => (
            <button
              key={f.id}
              onClick={() => onSelect(f)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: 8,
                borderRadius: 8,
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ width: 36, height: 48, position: 'relative', flexShrink: 0, borderRadius: 4, overflow: 'hidden', background: 'var(--surface-2)' }}>
                {f.image_url && (
                  <Image src={f.image_url} alt={f.name} fill sizes="36px" style={{ objectFit: 'contain' }} />
                )}
              </div>
              <div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-ui)' }}>{f.brand}</p>
                <p style={{ fontSize: 13, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>{f.name}</p>
              </div>
            </button>
          ))}
        </div>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
      </div>
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function ShelfClient({ slots: initialSlots, isSignedIn, topThree }: ShelfClientProps) {
  const [slots, setSlots] = useState<ShelfSlot[]>(initialSlots)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [searchTargetRank, setSearchTargetRank] = useState<number | null>(null)
  const slotsRef = useRef(slots)
  useEffect(() => {
    slotsRef.current = slots
  }, [slots])

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  const filledSlots = slots.filter(s => s.itemId !== null)
  const sortableIds = filledSlots.map(s => s.itemId!)

  function onDragStart({ active }: DragStartEvent) {
    setActiveId(String(active.id))
  }

  const onDragEnd = useCallback(async ({ active, over }: DragEndEvent) => {
    setActiveId(null)
    if (!over) return
    const activeId = String(active.id)
    const overId = String(over.id)
    if (activeId === overId) return

    const current = slotsRef.current
    const filled = current.filter(s => s.itemId !== null)
    const oldIndex = filled.findIndex(s => s.itemId === activeId)
    const newIndex = filled.findIndex(s => s.itemId === overId)
    if (oldIndex === -1 || newIndex === -1) return

    const reordered = arrayMove(filled, oldIndex, newIndex)
    // Ranks are reassigned by position 1..N among filled slots; empty slots keep their ranks appended after.
    const emptyRanks = current.filter(s => s.itemId === null).map(s => s.rank).sort((a, b) => a - b)
    const usedRanks = [...reordered.map((_, i) => i + 1)]
    const newSlotsFilled = reordered.map((s, i) => ({ ...s, rank: i + 1 }))
    const newEmpty = emptyRanks
      .filter(r => !usedRanks.includes(r))
      .map(r => ({ itemId: null, rank: r, source: null, locked: false, fragrance: null } as ShelfSlot))

    // Merge back into rank order 1..10
    const merged = [...newSlotsFilled, ...newEmpty].sort((a, b) => a.rank - b.rank)
    setSlots(merged)
    slotsRef.current = merged

    try {
      await postShelfMutation({
        action: 'reorder',
        order: newSlotsFilled.map(s => ({ itemId: s.itemId, rank: s.rank })),
      })
    } catch {
      // Server reconcile failed — revert to pre-drag state
      setSlots(current)
      slotsRef.current = current
    }
  }, [])

  const handleRemove = useCallback(async (itemId: string) => {
    const current = slotsRef.current
    const next = current.map(s => (s.itemId === itemId ? { itemId: null, rank: s.rank, source: null, locked: false, fragrance: null } as ShelfSlot : s))
    setSlots(next)
    slotsRef.current = next

    try {
      await postShelfMutation({ action: 'remove', itemId })
    } catch {
      setSlots(current)
      slotsRef.current = current
    }
  }, [])

  const openReplace = useCallback((rank: number) => {
    setSearchTargetRank(rank)
  }, [])

  const handleSelectFragrance = useCallback(async (fragrance: ShelfFragrance) => {
    const rank = searchTargetRank
    setSearchTargetRank(null)
    if (rank === null) return

    const current = slotsRef.current
    const targetSlot = current.find(s => s.rank === rank)
    if (!targetSlot) return

    const optimisticSlot: ShelfSlot = {
      itemId: targetSlot.itemId ?? `pending-${rank}`,
      rank,
      source: 'manual',
      locked: false,
      fragrance,
    }
    const next = current.map(s => (s.rank === rank ? optimisticSlot : s))
    setSlots(next)
    slotsRef.current = next

    try {
      if (targetSlot.itemId) {
        await postShelfMutation({ action: 'replace', itemId: targetSlot.itemId, fragranceId: fragrance.id })
      } else {
        const result = await postShelfMutation({ action: 'add', fragranceId: fragrance.id, rank })
        const reconciled = slotsRef.current.map(s =>
          s.rank === rank ? { ...s, itemId: result.itemId } : s
        )
        setSlots(reconciled)
        slotsRef.current = reconciled
      }
    } catch {
      setSlots(current)
      slotsRef.current = current
    }
  }, [searchTargetRank])

  const [authSheetOpen, setAuthSheetOpen] = useState(false)

  if (!isSignedIn) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 320 }}>
          <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 22, color: 'var(--text)', marginBottom: 8 }}>
            Your shelf is waiting.
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
            Sign in to build your Top 10 — pre-filled from your Noseprint matches, freely editable.
          </p>
          <Button onClick={() => setAuthSheetOpen(true)}>Sign in</Button>
        </div>
        <AuthSheet
          open={authSheetOpen}
          onClose={() => setAuthSheetOpen(false)}
          redirectTo={typeof window !== 'undefined' ? `${window.location.origin}/auth/confirm?next=/shelf` : '/auth/confirm?next=/shelf'}
        />
      </div>
    )
  }

  return (
    <div style={{ padding: '20px 16px calc(5rem + env(safe-area-inset-bottom, 0px))' }}>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 26, color: 'var(--text)' }}>
          My Shelf
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
          Your top ten, ranked. Drag to reorder, remove what's wrong, replace what's missing.
        </p>
      </div>

      <AuraShelfAdvisory topThree={topThree} className="mb-4" />

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <SortableContext items={sortableIds} strategy={rectSortingStrategy}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
              gap: 12,
            }}
          >
            {slots.map(slot =>
              slot.itemId && slot.fragrance ? (
                <FilledSlot
                  key={slot.itemId}
                  slot={slot}
                  onRemove={() => handleRemove(slot.itemId!)}
                  onReplace={() => openReplace(slot.rank)}
                />
              ) : (
                <EmptySlot key={`empty-${slot.rank}`} rank={slot.rank} onFill={() => openReplace(slot.rank)} />
              )
            )}
          </div>
        </SortableContext>
      </DndContext>

      {searchTargetRank !== null && (
        <SearchSheet onClose={() => setSearchTargetRank(null)} onSelect={handleSelectFragrance} />
      )}
    </div>
  )
}
