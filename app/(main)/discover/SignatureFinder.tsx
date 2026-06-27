'use client'

import { useState } from 'react'
import Sheet from '@/components/ui/Sheet'

export type SignatureAnswer = {
  vibe: string[]
  occasion: string[]
  projections: string[]
}

type Step = {
  question: string
  options: { label: string; vibe?: string[]; occasion?: string[]; projections?: string[] }[]
}

const STEPS: Step[] = [
  {
    question: 'How do you want to feel?',
    options: [
      { label: 'Wrapped & Warm', vibe: ['Amber', 'Woody'] },
      { label: 'Fresh & Clean', vibe: ['Fresh', 'Citrus', 'Green'] },
      { label: 'Bold & Present', vibe: ['Oudy', 'Woody'] },
      { label: 'Mysterious & Deep', vibe: ['Oudy', 'Amber'] },
    ],
  },
  {
    question: 'When do you wear it most?',
    options: [
      { label: 'Every day', occasion: ['Casual'] },
      { label: 'Evenings & occasions', occasion: ['Evening', 'Special Occasion'] },
      { label: 'Mornings only', occasion: ['Office'] },
      { label: 'No pattern', occasion: [] },
    ],
  },
  {
    question: 'How much do you want people to notice?',
    options: [
      { label: 'Just me', projections: ['Weak', 'Medium'] },
      { label: 'My close circle', projections: ['Moderate'] },
      { label: 'Everyone in the room', projections: ['Strong', 'Beast Mode'] },
    ],
  },
]

type Props = {
  open: boolean
  onClose: () => void
  onComplete: (answer: SignatureAnswer) => void
}

export default function SignatureFinder({ open, onClose, onComplete }: Props) {
  const [step, setStep] = useState(0)
  const [answer, setAnswer] = useState<SignatureAnswer>({ vibe: [], occasion: [], projections: [] })

  function choose(option: Step['options'][number]) {
    const next: SignatureAnswer = {
      vibe: [...answer.vibe, ...(option.vibe ?? [])],
      occasion: [...answer.occasion, ...(option.occasion ?? [])],
      projections: [...answer.projections, ...(option.projections ?? [])],
    }
    if (step + 1 < STEPS.length) {
      setAnswer(next)
      setStep(step + 1)
    } else {
      setAnswer({ vibe: [], occasion: [], projections: [] })
      setStep(0)
      onComplete(next)
    }
  }

  function handleClose() {
    setAnswer({ vibe: [], occasion: [], projections: [] })
    setStep(0)
    onClose()
  }

  const current = STEPS[step]

  return (
    <Sheet open={open} onClose={handleClose}>
      <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: 4 }}>
        Step {step + 1} of {STEPS.length}
      </p>
      <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 22, color: 'var(--text)', marginBottom: 20 }}>
        {current.question}
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {current.options.map(opt => (
          <button
            key={opt.label}
            onClick={() => choose(opt)}
            style={{
              fontSize: 14,
              color: 'var(--text)',
              background: 'var(--surface-2)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--r-card)',
              padding: '14px',
              textAlign: 'left',
              cursor: 'pointer',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </Sheet>
  )
}
