"use client"
import React, { useEffect, useRef, useState } from 'react'

export default function AudioChord() {
  const ctxRef = useRef<AudioContext | null>(null)
  const lastPlay = useRef(0)
  const [enabled, setEnabled] = useState<boolean>(() => {
    try { return localStorage.getItem('scent-audio-enabled') === '1' } catch { return false }
  })

  useEffect(() => {
    try { localStorage.setItem('scent-audio-enabled', enabled ? '1' : '0') } catch {}
  }, [enabled])

  useEffect(() => {
    function handleMove() {
      if (!enabled) return
      const now = Date.now()
      if (now - lastPlay.current < 300) return
      lastPlay.current = now
      playChord()
    }

    window.addEventListener('scent:move', handleMove as EventListener)
    return () => window.removeEventListener('scent:move', handleMove as EventListener)
  }, [enabled])

  function ensureContext() {
    if (ctxRef.current) return ctxRef.current
    const Ctx = window.AudioContext || (window as any).webkitAudioContext
    if (!Ctx) return null
    const ctx = new Ctx()
    ctxRef.current = ctx
    return ctx
  }

  function playChord() {
    const ctx = ensureContext()
    if (!ctx) return

    const now = ctx.currentTime
    // Soft pad: three sine oscillators detuned
    const freqs = [220, 330, 440]
    const master = ctx.createGain()
    master.gain.setValueAtTime(0.0001, now)
    master.gain.exponentialRampToValueAtTime(0.12, now + 0.02)
    master.gain.exponentialRampToValueAtTime(0.001, now + 0.8)
    master.connect(ctx.destination)

    freqs.forEach((f, i) => {
      const o = ctx.createOscillator()
      o.type = 'sine'
      o.frequency.value = f * (1 + (i - 1) * 0.012)
      const g = ctx.createGain()
      g.gain.setValueAtTime(0.0001, now)
      g.gain.exponentialRampToValueAtTime(0.06 / (i + 1), now + 0.02)
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.9)
      o.connect(g)
      g.connect(master)
      o.start(now)
      o.stop(now + 1.1)
    })
  }

  function handleToggle() {
    // user gesture to enable audio context
    if (!ctxRef.current) {
      try {
        const ctx = ensureContext()
        ctx?.resume?.()
      } catch {}
    }
    setEnabled((v) => !v)
  }

  return (
    <button
      aria-pressed={enabled}
      aria-label={enabled ? 'Disable audio' : 'Enable audio'}
      className={`audio-toggle fixed right-6 top-6 z-50 flex items-center gap-2 rounded-full px-3 py-2 text-sm transition-shadow ${enabled ? 'bg-amber-400/95 text-slate-900 shadow' : 'bg-slate-800/60 text-slate-200'}`}
      onClick={handleToggle}
      title="Toggle scent audio"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden className="opacity-90">
        <path d="M3 10v4h4l5 4V6L7 10H3z" fill="currentColor" />
        <path d="M14.5 8.5a4 4 0 010 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="sr-only">Audio</span>
      <span className="hidden sm:inline">{enabled ? 'Audio on' : 'Audio off'}</span>
    </button>
  )
}
