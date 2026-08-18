'use client'

// Muffled glass clink using Web Audio API to avoid loading actual audio files.
// This matches the "heavy luxury glass" micro-interaction spec.
export const playClink = () => {
  if (typeof window === 'undefined') return

  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContext) return
    const ctx = new AudioContext()

    const osc = ctx.createOscillator()
    const gainNode = ctx.createGain()
    const filter = ctx.createBiquadFilter()

    osc.type = 'sine'
    // A high pitch, like a heavy crystal bottle touching a glass shelf
    osc.frequency.setValueAtTime(1800, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1)

    // Filter to muffle it (luxury dampening)
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(2000, ctx.currentTime)
    
    // Envelope for a sharp, quick click
    gainNode.gain.setValueAtTime(0, ctx.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1)

    osc.connect(filter)
    filter.connect(gainNode)
    gainNode.connect(ctx.destination)

    osc.start()
    osc.stop(ctx.currentTime + 0.1)
  } catch (e) {
    console.error('Sensory feedback failed', e)
  }
}
