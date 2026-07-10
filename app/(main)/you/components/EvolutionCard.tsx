'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'

interface EvolutionCardProps {
  oldIdentity?: string
  newIdentity?: string
  confidence?: number
  shiftType?: string
  onChoice?: (choice: 'stay' | 'evolve' | 'keep_both') => void
  isLoading?: boolean
}

export function EvolutionCard({
  oldIdentity,
  newIdentity,
  confidence,
  shiftType,
  onChoice,
  isLoading = false,
}: EvolutionCardProps) {
  const [selected, setSelected] = useState<'stay' | 'evolve' | 'keep_both' | null>(null)

  // Evolution detection isn't wired up yet — this card has no data source. Render nothing
  // rather than crash or fake a shift the wearer never had.
  if (!oldIdentity || !newIdentity || !onChoice) {
    return null
  }

  const handleChoice = async (choice: 'stay' | 'evolve' | 'keep_both') => {
    setSelected(choice)
    await onChoice(choice)
  }

  return (
    <div
      style={{
        background: 'var(--aura-surface)',
        border: '1px solid var(--aura-border)',
        borderRadius: 'var(--r-card)',
        padding: '16px',
        marginBottom: '16px',
        opacity: isLoading ? 0.6 : 1,
        transition: 'opacity var(--motion-responsive)',
      }}
    >
      <div style={{ marginBottom: '12px' }}>
        <p
          style={{
            fontSize: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: 'var(--text-muted)',
            margin: '0 0 8px 0',
          }}
        >
          Something&apos;s shifted
        </p>
        <p
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: 'var(--text)',
            margin: 0,
            lineHeight: 1.4,
          }}
        >
          You were <strong>{oldIdentity}</strong> → leaning toward <strong>{newIdentity}</strong>
        </p>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '8px 0 0 0' }}>
          {confidence}% confidence • {shiftType}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
        <Button
          onClick={() => handleChoice('evolve')}
          disabled={isLoading || selected !== null}
          style={{
            opacity: selected === 'evolve' ? 1 : 0.7,
          }}
        >
          Evolve with this
        </Button>
        <Button
          onClick={() => handleChoice('keep_both')}
          disabled={isLoading || selected !== null}
          style={{
            opacity: selected === 'keep_both' ? 1 : 0.7,
          }}
        >
          Keep both identities
        </Button>
        <Button
          onClick={() => handleChoice('stay')}
          disabled={isLoading || selected !== null}
          style={{
            opacity: selected === 'stay' ? 1 : 0.7,
          }}
        >
          Stay as is
        </Button>
      </div>
    </div>
  )
}
