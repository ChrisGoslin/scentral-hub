'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import AuraCompanion from '@/components/labs/AuraCompanion'
import TarotDivinationCard from '@/components/labs/TarotDivinationCard'
import LivingShelfGrid from '@/components/labs/LivingShelfGrid'
import SynesthesiaMemoryWidget from '@/components/labs/SynesthesiaMemoryWidget'
import { AuraEmotionalState } from '@/lib/aura-companion'
import { TarotCard } from '@/lib/personas-tarot'
import { ExtendedShelfBottle } from '@/lib/shelf-multi-lens'

export default function LabsExperiencePage() {
  const [auraState, setAuraState] = useState<AuraEmotionalState>('idle_breathing')
  const [selectedBottle, setSelectedBottle] = useState<ExtendedShelfBottle | null>(null)
  const [activeReading, setActiveReading] = useState<TarotCard | null>(null)

  const handleBottleSelect = (b: ExtendedShelfBottle) => {
    setSelectedBottle(b)
    setAuraState('curious_inspecting')
  }

  const handleReadingDone = (card: TarotCard) => {
    setActiveReading(card)
    setAuraState('alignment_ecstasy')
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#1A1208',
        color: '#F7F4EE',
        fontFamily: 'var(--font-ui, -apple-system, sans-serif)',
        position: 'relative',
        overflowX: 'hidden',
        padding: '48px 24px 120px 24px',
      }}
    >
      {/* Living Aura Companion */}
      <AuraCompanion
        state={auraState}
        onClick={() => setAuraState((prev) => (prev === 'idle_breathing' ? 'curious_inspecting' : 'idle_breathing'))}
      />

      <div style={{ maxWidth: 1120, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 64 }}>
        {/* Atelier Header & Wordmark */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(247,244,238,0.1)', paddingBottom: 28 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display, "Instrument Serif", Georgia, serif)', fontSize: 56, margin: 0, letterSpacing: '-0.01em', lineHeight: 1 }}>
              nota<span style={{ color: '#A0622A' }}>.</span>Labs
            </h1>
            <p style={{ color: '#B8AC9C', fontSize: 13, letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: 10 }}>
              The Living Experiential Scent Atelier · Sensory Sanctuary
            </p>
          </div>
          <Link
            href="/shelf"
            style={{
              background: 'rgba(247,244,238,0.06)',
              border: '1px solid rgba(247,244,238,0.2)',
              borderRadius: 999,
              padding: '10px 22px',
              color: '#F7F4EE',
              textDecoration: 'none',
              fontSize: 13,
            }}
          >
            Enter Master Shelf &rarr;
          </Link>
        </header>

        {/* 1. Tarot of Scent Divination Experience */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#A0622A' }}>
              Experiential Ritual I
            </span>
            <h2 style={{ fontFamily: 'var(--font-display, "Instrument Serif", Georgia, serif)', fontStyle: 'italic', fontSize: 38, color: '#F7F4EE', margin: '4px 0 0 0' }}>
              The Tarot of Scent Reading
            </h2>
          </div>
          <TarotDivinationCard onReadingComplete={handleReadingDone} />
        </section>

        {/* 2. Living Multi-Lens Virtual Shelf */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <span style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#6B7250' }}>
              Experiential Ritual II
            </span>
            <h2 style={{ fontFamily: 'var(--font-display, "Instrument Serif", Georgia, serif)', fontStyle: 'italic', fontSize: 38, color: '#F7F4EE', margin: '4px 0 0 0' }}>
              Living Atelier Shelf & Category Lenses
            </h2>
          </div>
          <LivingShelfGrid onBottleSelect={handleBottleSelect} />
        </section>

        {/* 3. Synesthesia Memory Dreamscapes & Song Pairings */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <span style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#A0622A' }}>
              Experiential Ritual III
            </span>
            <h2 style={{ fontFamily: 'var(--font-display, "Instrument Serif", Georgia, serif)', fontStyle: 'italic', fontSize: 38, color: '#F7F4EE', margin: '4px 0 0 0' }}>
              Acoustic Volatility Pairings & Memory Dreams
            </h2>
          </div>
          <SynesthesiaMemoryWidget />
        </section>
      </div>
    </main>
  )
}
