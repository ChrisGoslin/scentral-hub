'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getPersonaById, type Persona } from '@/lib/personas'
import { getFitNarrative } from '@/lib/fitNarrative'

type Props = {
  family: string | null
  fragranceName: string
  inspiredBy: string | null
}

export default function FitNarrativeCard({ family, fragranceName, inspiredBy }: Props) {
  const [persona, setPersona] = useState<Persona | null>(null)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    const personaId = localStorage.getItem('scentral_persona')
    setPersona(personaId ? getPersonaById(personaId) ?? null : null)
    setChecked(true)
  }, [])

  if (!checked) return null

  if (!persona) {
    return (
      <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '16px 0' }}>
        <Link href="/onboarding" style={{ color: 'var(--accent)' }}>Find your identity</Link> to see how this fits your nose.
      </p>
    )
  }

  const fit = getFitNarrative(family, fragranceName, persona)

  return (
    <div style={{ padding: '14px 16px', background: 'var(--surface)', borderLeft: '2px solid var(--accent)', borderRadius: 'var(--r-card)', marginTop: 16 }}>
      <p style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>{fit.chip}</p>
      <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 15, color: 'var(--text)', lineHeight: 1.4 }}>{fit.narrative}</p>
      {fit.inspired_by_cue && inspiredBy && (
        <p style={{ fontSize: 11, color: 'var(--accent)', marginTop: 8 }}>
          There&apos;s an Inspired By alternative → {inspiredBy}
        </p>
      )}
    </div>
  )
}
