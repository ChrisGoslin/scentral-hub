'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { divineTarotPersona, TarotAnswers, TarotCard } from '@/lib/personas-tarot'

interface TarotDivinationCardProps {
  onReadingComplete?: (card: TarotCard) => void
}

export default function TarotDivinationCard({ onReadingComplete }: TarotDivinationCardProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [answers, setAnswers] = useState<TarotAnswers>({
    sanctuary: 'archive',
    projection: 'intimate_whisper',
    anchor: 'paper_cedar',
  })
  const [isFlipped, setIsFlipped] = useState(false)
  const [divinedCard, setDivinedCard] = useState<TarotCard | null>(null)

  const handleComplete = () => {
    const card = divineTarotPersona(answers)
    setDivinedCard(card)
    setIsFlipped(true)
    setStep(4)
    if (onReadingComplete) onReadingComplete(card)
  }

  return (
    <div
      style={{
        background: '#2B2926',
        borderRadius: 16,
        padding: '36px 32px',
        border: '1px solid rgba(212, 175, 55, 0.25)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.45)',
        maxWidth: 520,
        width: '100%',
        margin: '0 auto',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Gold Seal Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <span style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#A0622A', fontWeight: 500 }}>
          Tarot of Scent · Divination
        </span>
        <span style={{ fontFamily: 'var(--font-display, "Instrument Serif", Georgia, serif)', fontStyle: 'italic', fontSize: 15, color: '#B8AC9C' }}>
          Step {step} of 3
        </span>
      </div>

      {step === 1 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h3 style={{ fontFamily: 'var(--font-display, "Instrument Serif", Georgia, serif)', fontStyle: 'italic', fontSize: 26, color: '#F7F4EE', margin: '0 0 12px 0' }}>
            Where does your mind drift when seeking sanctuary?
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
            {[
              { key: 'archive', label: 'Ancient Library Archive · Cedar & Smoked Tea' },
              { key: 'greenhouse', label: 'Sunlit Greenhouse · Green Fig & White Petals' },
              { key: 'midnight_streets', label: 'Rainy Midnight Streets · Resins & Dark Oud' },
            ].map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => {
                  setAnswers({ ...answers, sanctuary: opt.key as TarotAnswers['sanctuary'] })
                  setStep(2)
                }}
                style={{
                  background: 'rgba(247, 244, 238, 0.05)',
                  border: '1px solid rgba(247, 244, 238, 0.15)',
                  borderRadius: 8,
                  padding: '14px 18px',
                  color: '#F7F4EE',
                  textAlign: 'left',
                  fontSize: 14,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {step === 2 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h3 style={{ fontFamily: 'var(--font-display, "Instrument Serif", Georgia, serif)', fontStyle: 'italic', fontSize: 26, color: '#F7F4EE', margin: '0 0 12px 0' }}>
            How do you wish to exist in a crowded room?
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
            {[
              { key: 'intimate_whisper', label: 'An intimate whisper · discovered only upon close embrace' },
              { key: 'confident_punctuation', label: 'Crisp punctuation · effortless, radiant cleanliness' },
              { key: 'intoxicating_mystery', label: 'Intoxicating presence · deep smoky trail that lingers' },
            ].map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => {
                  setAnswers({ ...answers, projection: opt.key as TarotAnswers['projection'] })
                  setStep(3)
                }}
                style={{
                  background: 'rgba(247, 244, 238, 0.05)',
                  border: '1px solid rgba(247, 244, 238, 0.15)',
                  borderRadius: 8,
                  padding: '14px 18px',
                  color: '#F7F4EE',
                  textAlign: 'left',
                  fontSize: 14,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {step === 3 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h3 style={{ fontFamily: 'var(--font-display, "Instrument Serif", Georgia, serif)', fontStyle: 'italic', fontSize: 26, color: '#F7F4EE', margin: '0 0 12px 0' }}>
            Which sensory note is non-negotiable?
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
            {[
              { key: 'paper_cedar', label: 'Damp Papyrus & Ancient Cedar' },
              { key: 'citrus_neroli', label: 'Sparkling Italian Neroli & Bergamot' },
              { key: 'amber_smoke', label: 'Bourbon Amber & Midnight Frankincense' },
            ].map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => {
                  setAnswers({ ...answers, anchor: opt.key as TarotAnswers['anchor'] })
                  handleComplete()
                }}
                style={{
                  background: 'rgba(247, 244, 238, 0.05)',
                  border: '1px solid rgba(247, 244, 238, 0.15)',
                  borderRadius: 8,
                  padding: '14px 18px',
                  color: '#F7F4EE',
                  textAlign: 'left',
                  fontSize: 14,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {step === 4 && divinedCard && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}
        >
          <div
            style={{
              width: 80,
              height: 120,
              borderRadius: 8,
              border: `2px solid ${divinedCard.palette.accent}`,
              background: '#1A120B',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 0 24px ${divinedCard.palette.glow}`,
            }}
          >
            <span style={{ fontSize: 18, color: divinedCard.palette.accent, fontWeight: 700 }}>
              {divinedCard.arcanaNumber}
            </span>
          </div>

          <div>
            <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: divinedCard.palette.accent }}>
              Arcana {divinedCard.arcanaNumber} · {divinedCard.title}
            </div>
            <h2 style={{ fontFamily: 'var(--font-display, "Instrument Serif", Georgia, serif)', fontStyle: 'italic', fontSize: 32, color: '#F7F4EE', margin: '6px 0 12px 0' }}>
              {divinedCard.subtitle}
            </h2>
            <p style={{ color: '#B8AC9C', fontSize: 14, lineHeight: 1.5, margin: 0, maxWidth: 440 }}>
              &ldquo;{divinedCard.tarotNarrative.reading}&rdquo;
            </p>
          </div>

          <div style={{ background: 'rgba(247,244,238,0.06)', borderRadius: 8, padding: '12px 18px', width: '100%', textAlign: 'left', marginTop: 10 }}>
            <span style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#A0622A' }}>
              Signature Accords:
            </span>
            <div style={{ color: '#F7F4EE', fontSize: 13, marginTop: 4 }}>
              {divinedCard.signatureAccords.top.join(' · ')} &rarr; {divinedCard.signatureAccords.heart.join(' · ')} &rarr; {divinedCard.signatureAccords.base.join(' · ')}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
