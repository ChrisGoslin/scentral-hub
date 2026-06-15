'use client'

import React from 'react'

export type ViewMode = 'all' | 'byHouse' | 'bySeason' | 'wishlist'

const VIEWS: Array<{ key: ViewMode; label: string; icon: string }> = [
  { key: 'all', label: 'All', icon: '⬛' },
  { key: 'byHouse', label: 'By House', icon: '🏠' },
  { key: 'bySeason', label: 'By Season', icon: '🍂' },
  { key: 'wishlist', label: 'Wishlist', icon: '✦' },
]

interface WardrobeSidebarProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
}

export default function WardrobeSidebar({ viewMode, onViewModeChange }: WardrobeSidebarProps) {
  return (
    <>
      {/* Mobile: horizontal tab strip */}
      <div
        className="flex lg:hidden overflow-x-auto gap-1 px-4 py-2"
        style={{
          background: 'rgba(0,0,0,0.6)',
          borderBottom: '1px solid rgba(196,154,60,0.2)',
          flexShrink: 0,
        }}
      >
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
      </div>
    </>
  )
}
