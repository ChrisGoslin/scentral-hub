'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Persona } from '@/lib/personas'

interface PersonaRevealOverlayProps {
  persona: Persona
  onComplete: () => void
}

export default function PersonaRevealOverlay({ persona, onComplete }: PersonaRevealOverlayProps) {
  const [phase, setPhase] = useState(1) // 1=black, 2=name, 3=hold, 4=tagline, 5=notes, 6=cta
  const nameWords = persona.name.split(' ')
  const taglineChars = persona.narrative.tagline.split('')
  const baseNotes = persona.scent_spectrum.base.slice(0, 3)

  useEffect(() => {
    const timings = [
      { phase: 1, delay: 0, duration: 400 },
      { phase: 2, delay: 400, duration: nameWords.length * 120 + 240 },
      { phase: 3, delay: 400 + nameWords.length * 120 + 240, duration: 1000 },
      { phase: 4, delay: 400 + nameWords.length * 120 + 240 + 1000, duration: taglineChars.length * 28 + 200 },
      { phase: 5, delay: 400 + nameWords.length * 120 + 240 + 1000 + taglineChars.length * 28 + 200, duration: 600 + baseNotes.length * 200 },
      { phase: 6, delay: 400 + nameWords.length * 120 + 240 + 1000 + taglineChars.length * 28 + 200 + 600 + baseNotes.length * 200, duration: 400 },
    ]

    const timeouts = timings.map(t =>
      setTimeout(() => {
        if (phase <= 6) setPhase(t.phase)
      }, t.delay)
    )

    const completeTimeout = setTimeout(() => {
      onComplete()
    }, timings[timings.length - 1].delay + timings[timings.length - 1].duration + 200)

    return () => {
      timeouts.forEach(t => clearTimeout(t))
      clearTimeout(completeTimeout)
    }
  }, [])

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          inset: 0,
          background: '#1A1208',
          zIndex: 999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }}
      >
        {/* Phase 1: Black screen */}
        {phase >= 1 && (
          <motion.div
            key="overlay"
            initial={{ opacity: 1 }}
            animate={{ opacity: phase === 1 ? 1 : 0 }}
            transition={{ duration: 0.4, delay: phase === 1 ? 0 : 0.3 }}
            style={{ position: 'absolute', inset: 0, background: '#1A1208', zIndex: -1 }}
          />
        )}

        {/* Phase 2-3: Persona name (word by word) */}
        {phase >= 2 && (
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.4em' }}>
              {nameWords.map((word, i) => (
                <motion.span
                  key={`word-${i}`}
                  initial={{ opacity: 0, translateY: 10 }}
                  animate={phase >= 2 ? { opacity: 1, translateY: 0 } : { opacity: 0, translateY: 10 }}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.12 }}
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontStyle: 'italic',
                    fontSize: 'clamp(3rem, 8vw, 5rem)',
                    color: '#fff',
                    lineHeight: 1.1,
                  }}
                >
                  {word}
                </motion.span>
              ))}
            </div>
          </div>
        )}

        {/* Phase 4: Tagline (typewriter) */}
        {phase >= 4 && (
          <div style={{ textAlign: 'center', maxWidth: 320, marginBottom: 40 }}>
            <div style={{ minHeight: '2em', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {taglineChars.map((char, i) => (
                <motion.span
                  key={`char-${i}`}
                  initial={{ opacity: 0 }}
                  animate={phase >= 4 ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: 0.05, delay: 0.2 + i * 0.028 }}
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 16,
                    color: 'var(--accent)',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {char}
                </motion.span>
              ))}
            </div>
          </div>
        )}

        {/* Phase 5: Base notes drift up */}
        {phase >= 5 && (
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 40, minHeight: 60 }}>
            {baseNotes.map((note, i) => (
              <motion.div
                key={`note-${i}`}
                initial={{ opacity: 0, y: 40 }}
                animate={phase >= 5 ? { opacity: 1, y: -20 } : { opacity: 0, y: 40 }}
                transition={{ duration: 0.6, delay: 0.1 + i * 0.2 }}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 12,
                  color: '#9B8B76',
                  textAlign: 'center',
                }}
              >
                {note}
              </motion.div>
            ))}
          </div>
        )}

        {/* Phase 6: CTA fade in */}
        {phase >= 6 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={phase >= 6 ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 14,
              color: 'var(--accent)',
              fontWeight: 600,
              textAlign: 'center',
              margin: 0,
            }}
          >
            This is your base note. →
          </motion.p>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
