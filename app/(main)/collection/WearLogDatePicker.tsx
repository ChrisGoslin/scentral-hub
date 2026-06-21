'use client'

import React from 'react'
import { sliderToVector, vectorToEmoji } from './hooks/useTemporalCurve'

const ALIGNMENT_EMOJIS = ['😶', '😐', '🙂', '😊', '🤩'] as const

interface AlignmentSliderProps {
  value: number
  onChange: (v: number) => void
  label: string
}

export function AlignmentSlider({ value, onChange, label }: AlignmentSliderProps) {
  const vector = sliderToVector(value)
  const activeEmoji = vectorToEmoji(vector)
  const dotIndex = Math.round(vector * 4)

  return (
    <div style={{ width: '100%' }}>
      {/* Emoji dot track */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 12,
          padding: '0 4px',
        }}
        aria-label={`${label}: ${activeEmoji}`}
      >
        {ALIGNMENT_EMOJIS.map((emoji, i) => (
          <span
            key={emoji}
            style={{
              fontSize: i === dotIndex ? 32 : 22,
              opacity: i === dotIndex ? 1 : 0.35,
              transition: 'font-size 0.15s ease, opacity 0.15s ease',
              lineHeight: 1,
              display: 'block',
            }}
          >
            {emoji}
          </span>
        ))}
      </div>

      {/* Native range input — styled via CSS */}
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        style={{
          width: '100%',
          WebkitAppearance: 'none',
          appearance: 'none',
          height: 6,
          borderRadius: 999,
          background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-gold) ${value}%, var(--color-border) ${value}%, var(--color-border) 100%)`,
          outline: 'none',
          cursor: 'pointer',
        }}
      />

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 6,
          color: 'var(--color-text-muted)',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}
      >
        <span>Off</span>
        <span>Perfect</span>
      </div>
    </div>
  )
}

interface StageDots {
  current: 1 | 2 | 3 | 'final'
}

export function StageDots({ current }: StageDots) {
  const numeric = current === 'final' ? 4 : current
  return (
    <div
      style={{
        display: 'flex',
        gap: 8,
        justifyContent: 'center',
        marginBottom: 24,
      }}
      role="progressbar"
      aria-valuenow={numeric}
      aria-valuemin={1}
      aria-valuemax={4}
      aria-label={`Step ${numeric} of 4`}
    >
      {[1, 2, 3, 4].map((n) => (
        <div
          key={n}
          style={{
            width: n === numeric ? 20 : 8,
            height: 8,
            borderRadius: 999,
            background:
              n === numeric
                ? 'var(--color-gold)'
                : n < numeric
                ? 'var(--color-primary)'
                : 'var(--color-border)',
            transition: 'width 0.25s ease, background 0.2s ease',
          }}
        />
      ))}
    </div>
  )
}

interface ChipGroupProps<T extends string> {
  label: string
  options: readonly T[]
  selected: T | ''
  onToggle: (v: T) => void
}

export function ChipGroup<T extends string>({
  label,
  options,
  selected,
  onToggle,
}: ChipGroupProps<T>) {
  return (
    <div style={{ marginBottom: 16 }}>
      <p
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--color-text-muted)',
          marginBottom: 8,
        }}
      >
        {label}
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {options.map((opt) => {
          const active = selected === opt
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onToggle(opt)}
              style={{
                padding: '8px 14px',
                borderRadius: 999,
                border: `1.5px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`,
                background: active ? 'var(--color-primary)' : 'var(--color-surface)',
                color: active ? '#fffaf5' : 'var(--color-text)',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.15s ease, border-color 0.15s ease, color 0.15s ease',
              }}
              aria-pressed={active}
            >
              {opt}
            </button>
          )
        })}
      </div>
    </div>
  )
}
