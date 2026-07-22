'use client'

import { useEffect, useRef } from 'react'
import type { AcousticCue, SensoryEvent } from '@/lib/experience'

type SensoryMethod = {
  haptic: (event: SensoryEvent) => void
  acoustic: (cue: AcousticCue) => void
}

const HAPTIC_PATTERNS: Record<SensoryEvent, number | number[]> = {
  reveal: [60, 120, 180],
  alignment: [40, 80, 60],
  drag: 18,
  destroy: [120, 60, 120],
  clink: 12,
  'trace-left': 200,
}

export function useSymphonicSensory(): SensoryMethod {
  const audioRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    return () => {
      void audioRef.current?.close()
    }
  }, [])

  function ensureAudioContext() {
    if (typeof window === 'undefined') return null
    if (audioRef.current) return audioRef.current
    const AudioCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioCtor) return null
    audioRef.current = new AudioCtor()
    return audioRef.current
  }

  function haptic(event: SensoryEvent) {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(HAPTIC_PATTERNS[event])
    }
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.sensoryPulse = event
      window.setTimeout(() => {
        if (document.documentElement.dataset.sensoryPulse === event) {
          delete document.documentElement.dataset.sensoryPulse
        }
      }, 420)
    }
  }

  function acoustic(cue: AcousticCue) {
    if (cue !== 'clink') return
    const ctx = ensureAudioContext()
    if (!ctx) return
    const now = ctx.currentTime
    const master = ctx.createGain()
    master.gain.setValueAtTime(0.0001, now)
    master.gain.exponentialRampToValueAtTime(0.03, now + 0.02)
    master.gain.exponentialRampToValueAtTime(0.0001, now + 0.38)
    master.connect(ctx.destination)

    const frequencies = [320, 468]
    frequencies.forEach((frequency, index) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(frequency, now)
      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.exponentialRampToValueAtTime(0.018 - index * 0.004, now + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.26 + index * 0.04)
      osc.connect(gain)
      gain.connect(master)
      osc.start(now)
      osc.stop(now + 0.4)
    })
  }

  return { haptic, acoustic }
}
