'use client'

import React from 'react'
import { Info } from 'lucide-react'

/**
 * SensoryAnatomy — minimal body silhouette showing fragrance application zones.
 * Displays descriptive facts and percentage-based coordinates for hotspots.
 */

type SpritzZone = {
  id: string
  label: string
  fact: string
  coordinates: { x: number; y: number } // Percentage based
}

const ZONES: Record<string, SpritzZone> = {
  'neck': {
    id: 'neck',
    label: 'Neck',
    fact: 'Pulse points here provide high projection.',
    coordinates: { x: 50, y: 25 }
  },
  'wrists': {
    id: 'wrists',
    label: 'Wrists',
    fact: 'Classic spot, but avoid rubbing them together!',
    coordinates: { x: 30, y: 60 }
  },
  'chest': {
    id: 'chest',
    label: 'Chest',
    fact: 'Creates a scent cloud that rises to your nose.',
    coordinates: { x: 50, y: 40 }
  },
  'behind-ears': {
    id: 'behind-ears',
    label: 'Behind Ears',
    fact: 'Great for intimacy and "scent trails".',
    coordinates: { x: 55, y: 20 }
  },
  'inner-elbows': {
    id: 'inner-elbows',
    label: 'Inner Elbows',
    fact: 'Warm area that helps scent last longer.',
    coordinates: { x: 25, y: 50 }
  },
  'lower-torso': {
    id: 'lower-torso',
    label: 'Lower Torso',
    fact: 'Ideal for heavier molecules to rise slowly.',
    coordinates: { x: 50, y: 70 }
  }
}

interface SensoryAnatomyProps {
  zone?: string | null
  className?: string
}

export default function SensoryAnatomy({ zone, className }: SensoryAnatomyProps) {
  // Map incoming zone string to our coordinates system
  const normalizedZone = zone?.toLowerCase().replace(/\s+/g, '-') || ''
  
  // Find match or default to neck
  let activeZone = ZONES[normalizedZone]
  
  if (!activeZone) {
    if (normalizedZone.includes('neck')) activeZone = ZONES['neck']
    else if (normalizedZone.includes('wrist')) activeZone = ZONES['wrists']
    else if (normalizedZone.includes('chest')) activeZone = ZONES['chest']
    else if (normalizedZone.includes('ear')) activeZone = ZONES['behind-ears']
    else if (normalizedZone.includes('elbow')) activeZone = ZONES['inner-elbows']
    else if (normalizedZone.includes('torso')) activeZone = ZONES['lower-torso']
    else activeZone = ZONES['neck']
  }

  return (
    <div 
      className={`flex flex-col gap-4 p-4 rounded-[var(--r-card)] ${className || ''}`} 
      style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}
    >
      <div className="flex items-center gap-4">
        <div 
          className="relative w-20 h-28 bg-[var(--surface-2)] rounded-full overflow-hidden flex-shrink-0 border border-[var(--line)]"
        >
          {/* Simple abstract human silhouette representation */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[var(--text-muted)] opacity-20" />
          <div className="absolute top-9 left-1/2 -translate-x-1/2 w-12 h-18 rounded-t-full bg-[var(--text-muted)] opacity-20" />
          
          {/* Active zone indicator */}
          <div 
            className="absolute w-2.5 h-2.5 rounded-full bg-[var(--accent)] animate-pulse"
            style={{ 
              left: `${activeZone.coordinates.x}%`, 
              top: `${activeZone.coordinates.y}%`,
              boxShadow: '0 0 8px var(--accent)',
              transform: 'translate(-50%, -50%)'
            }}
          />
        </div>
        
        <div className="flex flex-col gap-1 min-w-0">
          <p className="text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-widest">
            Application Zone
          </p>
          <p className="text-sm text-[var(--text)] font-semibold truncate">
            {activeZone.label}
          </p>
          <div className="flex items-start gap-1.5 mt-1">
            <Info size={12} className="text-[var(--accent)] mt-0.5 flex-shrink-0" />
            <p className="text-[11px] text-[var(--text-muted)] leading-tight italic">
              {activeZone.fact}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
