'use client'

import React, { useState } from 'react'
import Link from 'next/link'

export type ViewMode = 'all' | 'byHouse' | 'bySeason' | 'wishlist'

const VIEWS: Array<{ key: ViewMode; label: string; icon: string }> = [
  { key: 'all', label: 'All', icon: '⬛' },
  { key: 'byHouse', label: 'By House', icon: '🏠' },
  { key: 'bySeason', label: 'By Season', icon: '🍂' },
  { key: 'wishlist', label: 'Wishlist', icon: '✦' },
]

export type LensKey = 'agadir' | 'executive' | 'comfort'

export type LensFilters = {
  projections?: string[]
  seasons?: string[]
  useCases?: string[]
}

export const SENSORY_LENSES: Array<{ key: LensKey; icon: string; label: string; filters: LensFilters }> = [
  {
    key: 'agadir',
    icon: '🌙',
    label: 'Agadir Nights',
    filters: {
      projections: ['Beast Mode', 'Strong'],
      seasons: ['High Heat'],
    },
  },
  {
    key: 'executive',
    icon: '💼',
    label: 'Executive',
    filters: {
      projections: ['Moderate', 'Medium', 'Strong'],
      useCases: ['office', 'professional', 'formal', 'work'],
    },
  },
  {
    key: 'comfort',
    icon: '🧘',
    label: 'Comfort',
    filters: {
      projections: ['Weak', 'Medium'],
      useCases: ['casual', 'everyday', 'home', 'relaxed'],
    },
  },
]

interface WardrobeSidebarProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  activeLens?: LensKey | null
  onLensSelect?: (lens: LensKey | null, filters: LensFilters | null) => void
}

export default function WardrobeSidebar({ viewMode, onViewModeChange, activeLens, onLensSelect }: WardrobeSidebarProps) {
  // Internal fallback state if parent doesn't manage activeLens
  const [internalLens, setInternalLens] = useState<LensKey | null>(null)
  const currentLens = activeLens !== undefined ? activeLens : internalLens

  function handleLensClick(key: LensKey) {
    const nextLens = currentLens === key ? null : key
    const nextFilters = nextLens ? SENSORY_LENSES.find(l => l.key === nextLens)?.filters ?? null : null
    if (onLensSelect) {
      onLensSelect(nextLens, nextFilters)
    } else {
      setInternalLens(nextLens)
    }
  }
  return (
    <>
      {/* Mobile: horizontal tab strip + lens strip */}
      <div
        className="flex lg:hidden flex-col"
        style={{
          background: 'rgba(0,0,0,0.6)',
          borderBottom: '1px solid rgba(196,154,60,0.2)',
          flexShrink: 0,
        }}
      >
        {/* View mode row */}
        <div className="flex overflow-x-auto gap-1 px-4 py-2">
          {VIEWS.map(v => (
            <button
              key={v.key}
              onClick={() => onViewModeChange(v.key)}
              style={{
                padding: '6px 14px',
                borderRadius: 9999,
                border: viewMode === v.key ? '1px solid var(--accent)' : '1px solid rgba(255,255,255,0.12)',
                background: viewMode === v.key ? 'rgba(196,154,60,0.18)' : 'transparent',
                color: viewMode === v.key ? 'var(--accent)' : 'rgba(255,255,255,0.5)',
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase' as const,
                letterSpacing: '0.08em',
                cursor: 'pointer',
                whiteSpace: 'nowrap' as const,
                transition: 'all var(--motion-fast) var(--ease)',
                flexShrink: 0,
              }}
            >
              {v.label}
            </button>
          ))}
        </div>

        {/* Sensory Lenses row (mobile) */}
        <div className="flex overflow-x-auto gap-1 px-4 pb-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <span style={{
            fontSize: 8,
            fontWeight: 700,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.12em',
            color: 'var(--text-muted)',
            alignSelf: 'center',
            flexShrink: 0,
            paddingRight: 6,
          }}>
            Lenses
          </span>
          {SENSORY_LENSES.map(lens => {
            const isActive = currentLens === lens.key
            return (
              <button
                key={lens.key}
                onClick={() => handleLensClick(lens.key)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 9999,
                  border: isActive ? '1px solid rgba(196,154,60,0.7)' : '1px solid rgba(255,255,255,0.10)',
                  background: isActive ? 'rgba(196,154,60,0.16)' : 'transparent',
                  color: isActive ? 'rgba(220,180,80,0.95)' : 'rgba(255,255,255,0.45)',
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap' as const,
                  transition: 'all var(--motion-fast) var(--ease)',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <span>{lens.icon}</span>
                <span style={{ textTransform: 'uppercase' as const }}>{lens.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Desktop: slim left panel */}
      <div
        className="hidden lg:flex flex-col"
        style={{
          width: 80,
          flexShrink: 0,
          background: 'rgba(0,0,0,0.5)',
          borderRight: '1px solid rgba(196,154,60,0.15)',
          padding: '20px 0',
          gap: 4,
          alignItems: 'center',
          overflowY: 'auto',
        }}
      >
        {VIEWS.map(v => (
          <button
            key={v.key}
            onClick={() => onViewModeChange(v.key)}
            title={v.label}
            style={{
              width: 56,
              padding: '10px 0',
              borderRadius: 8,
              border: viewMode === v.key ? '1px solid var(--accent)' : '1px solid transparent',
              background: viewMode === v.key ? 'rgba(196,154,60,0.18)' : 'transparent',
              color: viewMode === v.key ? 'var(--accent)' : 'rgba(255,255,255,0.4)',
              fontSize: 18,
              cursor: 'pointer',
              transition: 'all var(--motion-fast) var(--ease)',
              display: 'flex',
              flexDirection: 'column' as const,
              alignItems: 'center',
              gap: 3,
            }}
          >
            <span style={{ fontSize: 16 }}>{v.icon}</span>
            <span style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em', lineHeight: 1 }}>
              {v.label}
            </span>
          </button>
        ))}

        {/* Scan Barcode button */}
        <Link
          href="/scanner"
          style={{
            width: 56,
            padding: '10px 0',
            borderRadius: 8,
            border: '1px solid rgba(196,154,60,0.3)',
            background: 'rgba(196,154,60,0.1)',
            color: 'rgba(220,180,80,0.85)',
            fontSize: 18,
            cursor: 'pointer',
            transition: 'all var(--motion-fast) var(--ease)',
            display: 'flex',
            flexDirection: 'column' as const,
            alignItems: 'center',
            gap: 3,
            textDecoration: 'none',
            textAlign: 'center' as const,
          }}
          title="Scan Barcode"
        >
          <span style={{ fontSize: 16 }}>📱</span>
          <span style={{ fontSize: 7, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em', lineHeight: 1 }}>
            Scan
          </span>
        </Link>

        {/* Sensory Lenses divider + buttons (desktop) */}
        <div style={{ width: 40, height: 1, background: 'rgba(196,154,60,0.2)', margin: '8px 0 4px' }} />
        <span style={{
          fontSize: 7,
          fontWeight: 700,
          textTransform: 'uppercase' as const,
          letterSpacing: '0.12em',
          color: 'var(--text-muted)',
          textAlign: 'center',
          lineHeight: 1.2,
          padding: '0 4px',
        }}>
          Sensory<br />Lenses
        </span>

        {SENSORY_LENSES.map(lens => {
          const isActive = currentLens === lens.key
          return (
            <button
              key={lens.key}
              onClick={() => handleLensClick(lens.key)}
              title={lens.label}
              style={{
                width: 56,
                padding: '10px 0',
                borderRadius: 8,
                border: isActive ? '1px solid rgba(196,154,60,0.7)' : '1px solid transparent',
                background: isActive ? 'rgba(196,154,60,0.16)' : 'transparent',
                color: isActive ? 'rgba(220,180,80,0.95)' : 'rgba(255,255,255,0.35)',
                cursor: 'pointer',
                transition: 'all var(--motion-fast) var(--ease)',
                display: 'flex',
                flexDirection: 'column' as const,
                alignItems: 'center',
                gap: 3,
              }}
            >
              <span style={{ fontSize: 16 }}>{lens.icon}</span>
              <span style={{ fontSize: 7, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.04em', lineHeight: 1.2, textAlign: 'center' as const }}>
                {lens.label}
              </span>
            </button>
          )
        })}
      </div>
    </>
  )
}
