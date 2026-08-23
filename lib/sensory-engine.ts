'use client'

export type SensoryInteractionType = 
  | 'glass_clink' 
  | 'heavy_thud' 
  | 'paper_tear' 
  | 'water_drop' 
  | 'success_chime'
  | 'shatter'

export type HapticIntensity = 'light' | 'medium' | 'heavy'

class SensoryEngine {
  private audioCtx: AudioContext | null = null
  private isMuted: boolean = false

  init() {
    if (typeof window === 'undefined') return
    // Respect system reduced motion/audio preferences if possible, 
    // but here we just initialize the Web Audio API context
    try {
      const AudioContext =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof window.AudioContext })
          .webkitAudioContext
      if (AudioContext && !this.audioCtx) {
        this.audioCtx = new AudioContext()
      }
    } catch (e) {
      console.warn('Web Audio API not supported', e)
    }
  }

  setMuted(muted: boolean) {
    this.isMuted = muted
  }

  playInteraction(type: SensoryInteractionType) {
    if (this.isMuted || !this.audioCtx) return

    // Resume context if suspended (browser autoplay policy)
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume()
    }

    const ctx = this.audioCtx
    const osc = ctx.createOscillator()
    const gainNode = ctx.createGain()
    const filter = ctx.createBiquadFilter()

    osc.connect(filter)
    filter.connect(gainNode)
    gainNode.connect(ctx.destination)

    const now = ctx.currentTime

    switch (type) {
      case 'glass_clink':
        osc.type = 'sine'
        osc.frequency.setValueAtTime(1800, now)
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.1)
        filter.type = 'lowpass'
        filter.frequency.setValueAtTime(2000, now)
        gainNode.gain.setValueAtTime(0, now)
        gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01)
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1)
        osc.start(now)
        osc.stop(now + 0.1)
        break
      case 'heavy_thud':
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(150, now)
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.2)
        filter.type = 'lowpass'
        filter.frequency.setValueAtTime(400, now)
        gainNode.gain.setValueAtTime(0, now)
        gainNode.gain.linearRampToValueAtTime(0.5, now + 0.02)
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2)
        osc.start(now)
        osc.stop(now + 0.2)
        break
      case 'water_drop':
        osc.type = 'sine'
        osc.frequency.setValueAtTime(300, now)
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1)
        filter.type = 'bandpass'
        filter.frequency.setValueAtTime(800, now)
        gainNode.gain.setValueAtTime(0, now)
        gainNode.gain.linearRampToValueAtTime(0.4, now + 0.01)
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1)
        osc.start(now)
        osc.stop(now + 0.1)
        break
      default:
        // Generic soft blip for unmapped interactions
        osc.type = 'sine'
        osc.frequency.setValueAtTime(440, now)
        gainNode.gain.setValueAtTime(0, now)
        gainNode.gain.linearRampToValueAtTime(0.1, now + 0.01)
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1)
        osc.start(now)
        osc.stop(now + 0.1)
        break
    }
  }

  triggerHaptic(intensity: HapticIntensity) {
    if (typeof navigator === 'undefined' || !navigator.vibrate || this.isMuted) return
    
    switch (intensity) {
      case 'light':
        navigator.vibrate(10)
        break
      case 'medium':
        navigator.vibrate(25)
        break
      case 'heavy':
        navigator.vibrate([40, 30, 40])
        break
    }
  }
}

export const sensory = new SensoryEngine()
