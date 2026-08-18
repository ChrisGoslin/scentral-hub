'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { pairScentWithAcousticPlaylist, synthesizeMemoryDreamPrompt, AcousticScentPairing, MemoryDreamscapePrompt } from '@/lib/olfactory-synesthesia'

export default function SynesthesiaMemoryWidget() {
  const [memoryInput, setMemoryInput] = useState('Burning marshmallows on a wooden boat in the Caspian Sea')
  const [dreamPrompt, setDreamPrompt] = useState<MemoryDreamscapePrompt | null>(null)
  const [playlist, setPlaylist] = useState<AcousticScentPairing>(
    pairScentWithAcousticPlaylist('Santal 33', 'Le Labo', 'Woody')
  )

  const handleGenerateDream = () => {
    const dream = synthesizeMemoryDreamPrompt(memoryInput, 'Santal 33', 'Woody')
    setDreamPrompt(dream)
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 24,
        width: '100%',
      }}
    >
      {/* 1. Acoustic Song Pairing ("If This Scent Was A Song") */}
      <div
        style={{
          background: '#2B2926',
          borderRadius: 16,
          padding: 28,
          border: '1px solid rgba(247,244,238,0.1)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <span style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#A0622A' }}>
            Acoustic Scent Pairing · If This Scent Was A Song
          </span>
          <h3 style={{ fontFamily: 'var(--font-display, "Instrument Serif", Georgia, serif)', fontStyle: 'italic', fontSize: 28, color: '#F7F4EE', margin: '8px 0 16px 0' }}>
            {playlist.brand} — {playlist.fragranceName}
          </h3>
          <p style={{ color: '#B8AC9C', fontSize: 13, margin: '0 0 20px 0' }}>
            {playlist.overallVibe}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {playlist.playlistTracks.map((tr, i) => (
              <div
                key={tr.trackTitle}
                style={{
                  background: 'rgba(247,244,238,0.04)',
                  padding: '10px 14px',
                  borderRadius: 8,
                  borderLeft: `2px solid ${i === 0 ? '#A0622A' : i === 1 ? '#6B7250' : '#B8AC9C'}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8a8175' }}>
                  <span>{tr.stage}</span>
                  <span>{tr.bpm} BPM</span>
                </div>
                <div style={{ color: '#F7F4EE', fontSize: 14, fontWeight: 500, marginTop: 2 }}>
                  {tr.trackTitle} — {tr.artist}
                </div>
              </div>
            ))}
          </div>
        </div>

        <a
          href={playlist.spotifySearchQuery}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            marginTop: 24,
            display: 'inline-block',
            textAlign: 'center',
            background: 'rgba(247,244,238,0.1)',
            border: '1px solid rgba(247,244,238,0.2)',
            borderRadius: 999,
            padding: '10px 20px',
            color: '#F7F4EE',
            textDecoration: 'none',
            fontSize: 13,
          }}
        >
          Open in Spotify &rarr;
        </a>
      </div>

      {/* 2. Generative Memory Dreamscape Canvas */}
      <div
        style={{
          background: '#E5E0D6',
          borderRadius: 16,
          padding: 28,
          border: '1px solid rgba(43,41,38,0.1)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <span style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#6B7250', fontWeight: 600 }}>
            Olfactory Memory Dreamscape
          </span>
          <h3 style={{ fontFamily: 'var(--font-display, "Instrument Serif", Georgia, serif)', fontStyle: 'italic', fontSize: 28, color: '#2B2926', margin: '8px 0 16px 0' }}>
            What memory does this evoke?
          </h3>

          <textarea
            value={memoryInput}
            onChange={(e) => setMemoryInput(e.target.value)}
            rows={3}
            style={{
              width: '100%',
              background: '#F7F4EE',
              border: '1px solid rgba(43,41,38,0.15)',
              borderRadius: 8,
              padding: 12,
              fontFamily: 'var(--font-ui, sans-serif)',
              fontSize: 14,
              color: '#2B2926',
              resize: 'none',
              marginBottom: 14,
            }}
          />

          <button
            type="button"
            onClick={handleGenerateDream}
            style={{
              background: '#2B2926',
              border: 'none',
              borderRadius: 999,
              padding: '10px 24px',
              color: '#F7F4EE',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Synthesize Dreamscape Prompt
          </button>

          {dreamPrompt && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                marginTop: 18,
                background: '#F7F4EE',
                borderRadius: 8,
                padding: 14,
                border: '1px dashed #A0622A',
              }}
            >
              <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#A0622A', marginBottom: 4 }}>
                Generated Visual Prompt:
              </div>
              <p style={{ fontSize: 12.5, color: '#4a463f', lineHeight: 1.4, margin: 0, fontStyle: 'italic' }}>
                &ldquo;{dreamPrompt.recommendedImagePrompt}&rdquo;
              </p>
            </motion.div>
          )}
        </div>

        <div style={{ marginTop: 20, fontSize: 11, color: '#8a8175' }}>
          Pinned to your personal atelier wear-log.
        </div>
      </div>
    </div>
  )
}
