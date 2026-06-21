'use client'

import React from 'react'
import { AlignmentSlider } from './WearLogDatePicker'

export const STAGE_META: Record<1 | 2 | 3, { label: string; sublabel: string }> = {
  1: { label: 'First Spray', sublabel: 'How does it smell right now?' },
  2: { label: 'The Heart', sublabel: '2–3 hours in — how is it evolving?' },
  3: { label: 'Dry Down', sublabel: '6+ hours later — how did it settle?' },
}

interface Stage1Props {
  value: number
  onChange: (v: number) => void
}

export function Stage1({ value, onChange }: Stage1Props) {
  const meta = STAGE_META[1]
  return (
    <>
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 26,
          fontWeight: 400,
          color: 'var(--color-text)',
          textAlign: 'center',
          marginBottom: 4,
        }}
      >
        {meta.label}
      </h2>
      <p
        style={{
          color: 'var(--color-text-muted)',
          fontSize: 14,
          textAlign: 'center',
          marginBottom: 32,
          lineHeight: 1.4,
        }}
      >
        {meta.sublabel}
      </p>
      <AlignmentSlider value={value} onChange={onChange} label={`${meta.label} alignment`} />
    </>
  )
}

interface Stage2Props {
  value: number
  onChange: (v: number) => void
}

export function Stage2({ value, onChange }: Stage2Props) {
  const meta = STAGE_META[2]
  return (
    <>
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 26,
          fontWeight: 400,
          color: 'var(--color-text)',
          textAlign: 'center',
          marginBottom: 4,
        }}
      >
        {meta.label}
      </h2>
      <p
        style={{
          color: 'var(--color-text-muted)',
          fontSize: 14,
          textAlign: 'center',
          marginBottom: 32,
          lineHeight: 1.4,
        }}
      >
        {meta.sublabel}
      </p>
      <AlignmentSlider value={value} onChange={onChange} label={`${meta.label} alignment`} />
    </>
  )
}

interface Stage3Props {
  value: number
  onChange: (v: number) => void
}

export function Stage3({ value, onChange }: Stage3Props) {
  const meta = STAGE_META[3]
  return (
    <>
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 26,
          fontWeight: 400,
          color: 'var(--color-text)',
          textAlign: 'center',
          marginBottom: 4,
        }}
      >
        {meta.label}
      </h2>
      <p
        style={{
          color: 'var(--color-text-muted)',
          fontSize: 14,
          textAlign: 'center',
          marginBottom: 32,
          lineHeight: 1.4,
        }}
      >
        {meta.sublabel}
      </p>
      <AlignmentSlider value={value} onChange={onChange} label={`${meta.label} alignment`} />
    </>
  )
}
