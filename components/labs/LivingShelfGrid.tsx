'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ExtendedShelfBottle, ShelfCategoryLens, CATEGORY_LENS_CONFIG, filterAndRankShelfBottles } from '@/lib/shelf-multi-lens'

interface LivingShelfGridProps {
  initialBottles?: ExtendedShelfBottle[]
  onBottleSelect?: (bottle: ExtendedShelfBottle) => void
}

const DEMO_BOTTLES: ExtendedShelfBottle[] = [
  {
    id: '1',
    name: 'Santal 33',
    brand: 'Le Labo',
    family: 'Woody',
    lifecycleStatus: 'owned',
    overallRank: 1,
    categoryRanks: { top_ouds: 1 },
    imageUrl: null,
  },
  {
    id: '2',
    name: 'Neroli Portofino',
    brand: 'Tom Ford',
    family: 'Fresh & Citrus',
    lifecycleStatus: 'on_the_way',
    overallRank: 2,
    categoryRanks: { top_freshies: 1 },
    inboundCarrierTracking: 'DHL-89214',
    estimatedDeliveryDate: '21 Aug',
    imageUrl: null,
  },
  {
    id: '3',
    name: 'Baccarat Rouge 540',
    brand: 'Maison Francis Kurkdjian',
    family: 'Amber & Oriental',
    lifecycleStatus: 'owned',
    overallRank: 3,
    categoryRanks: { top_date_night: 1 },
    imageUrl: null,
  },
  {
    id: '4',
    name: 'Carnal Flower',
    brand: 'Frederic Malle',
    family: 'Floral',
    lifecycleStatus: 'tested_sample',
    sampleFillPct: 65,
    overallRank: 4,
    categoryRanks: { top_florals: 1 },
    imageUrl: null,
  },
]

export default function LivingShelfGrid({
  initialBottles = DEMO_BOTTLES,
  onBottleSelect,
}: LivingShelfGridProps) {
  const [activeLens, setActiveLens] = useState<ShelfCategoryLens>('overall_top_20')
  const [activeLifecycle, setActiveLifecycle] = useState<'all' | 'owned' | 'on_the_way' | 'tested_sample'>('all')

  const displayedBottles = filterAndRankShelfBottles(initialBottles, activeLens, activeLifecycle)

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Category Lens Switcher */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6 }}>
        {(Object.keys(CATEGORY_LENS_CONFIG) as ShelfCategoryLens[]).map((lensKey) => {
          const cfg = CATEGORY_LENS_CONFIG[lensKey]
          const isSelected = activeLens === lensKey
          return (
            <button
              key={lensKey}
              type="button"
              onClick={() => setActiveLens(lensKey)}
              style={{
                background: isSelected ? '#2B2926' : 'rgba(247,244,238,0.06)',
                border: isSelected ? '1px solid #A0622A' : '1px solid rgba(247,244,238,0.15)',
                borderRadius: 999,
                padding: '8px 16px',
                color: isSelected ? '#F7F4EE' : '#B8AC9C',
                fontSize: 13,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
              }}
            >
              <span>{cfg.icon}</span>
              <span>{cfg.label}</span>
            </button>
          )
        })}
      </div>

      {/* Grid of Living Bottles */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 18,
        }}
      >
        {displayedBottles.map((bottle, idx) => (
          <motion.div
            key={bottle.id}
            whileHover={{ y: -4, rotate: (idx % 2 === 0 ? 0.7 : -0.7) }}
            onClick={() => onBottleSelect && onBottleSelect(bottle)}
            style={{
              background: '#E5E0D6',
              borderRadius: 12,
              padding: 20,
              boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: 260,
              position: 'relative',
              clipPath: 'polygon(0.6% 0.8%, 99.4% 0%, 100% 99.2%, 0.4% 100%)',
            }}
          >
            {/* Rank Badge & Lifecycle Indicator */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7250', fontWeight: 600 }}>
                #{idx + 1} · {bottle.family}
              </span>
              {bottle.lifecycleStatus === 'on_the_way' && (
                <span style={{ fontSize: 10, background: '#A0622A', color: '#F7F4EE', padding: '2px 8px', borderRadius: 999 }}>
                  In-Transit ({bottle.estimatedDeliveryDate})
                </span>
              )}
              {bottle.lifecycleStatus === 'tested_sample' && (
                <span style={{ fontSize: 10, background: '#2B2926', color: '#F7F4EE', padding: '2px 8px', borderRadius: 999 }}>
                  Sample {bottle.sampleFillPct}%
                </span>
              )}
            </div>

            {/* Bottle Center Artwork */}
            <div style={{ textAlign: 'center', margin: '24px 0' }}>
              <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8a8175' }}>
                {bottle.brand}
              </div>
              <h4 style={{ fontFamily: 'var(--font-display, "Instrument Serif", Georgia, serif)', fontStyle: 'italic', fontSize: 24, color: '#2B2926', margin: '4px 0 0 0' }}>
                {bottle.name}
              </h4>
            </div>

            {/* Bottom Marginalia */}
            <div style={{ borderTop: '1px solid rgba(43,41,38,0.1)', paddingTop: 10, display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#6c655b' }}>
              <span>Tap to inspect chords</span>
              <span>nota. atelier</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
