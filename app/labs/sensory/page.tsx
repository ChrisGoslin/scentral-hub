'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { motion, useAnimation } from 'framer-motion'
import { sensory } from '@/lib/sensory-engine'

export default function SensoryPlayground() {
  const [bottleState, setBottleState] = useState<'full' | 'empty'>('full')
  const [shakeCount, setShakeCount] = useState(0)
  const [smudges, setSmudges] = useState<{ id: number, x: number, y: number }[]>([])
  
  // New Toggles
  const [isAmoled, setIsAmoled] = useState(false)
  const [isQuiet, setIsQuiet] = useState(false)
  const [isThermal, setIsThermal] = useState(false)
  
  const hour = new Date().getHours()
  const isMidnight = hour >= 2 && hour <= 4

  const controls = useAnimation()

  // Feature 179: Quiet Mode Sync
  useEffect(() => {
    sensory.setMuted(isQuiet)
  }, [isQuiet])

  // Feature 113: Shake-to-Randomize (DeviceMotionEvent)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.DeviceMotionEvent) return

    let lastX = 0, lastY = 0, lastZ = 0
    const threshold = 15 // Shake sensitivity

    const handleMotion = (e: DeviceMotionEvent) => {
      const { x, y, z } = e.accelerationIncludingGravity || {}
      if (x == null || y == null || z == null) return

      const deltaX = Math.abs(x - lastX)
      const deltaY = Math.abs(y - lastY)
      const deltaZ = Math.abs(z - lastZ)

      if (deltaX + deltaY + deltaZ > threshold) {
        // Trigger a shake event
        setShakeCount(prev => prev + 1)
        sensory.triggerHaptic('heavy')
        sensory.playInteraction('glass_clink')
        controls.start({
          x: [0, -10, 10, -10, 10, 0],
          transition: { duration: 0.4 }
        })
      }

      lastX = x
      lastY = y
      lastZ = z
    }

    window.addEventListener('devicemotion', handleMotion)
    return () => window.removeEventListener('devicemotion', handleMotion)
  }, [controls])

  // Feature 117 & 119: The "Empty Spray" Haptic Sputter & Fingerprint Smudges
  const handleSpray = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    setSmudges(prev => [...prev.slice(-4), { id: Date.now(), x, y }]) 

    if (bottleState === 'empty') {
      if (typeof navigator !== 'undefined' && navigator.vibrate && !isQuiet) {
        navigator.vibrate([10, 50, 10, 50, 10]) 
      }
      sensory.playInteraction('heavy_thud') 
      
      controls.start({
        y: [0, 2, 0, 1, 0],
        transition: { duration: 0.2 }
      })
    } else {
      sensory.playInteraction('glass_clink')
      sensory.triggerHaptic('medium')
      controls.start({
        scale: [1, 0.95, 1],
        transition: { duration: 0.1 }
      })
    }
  }, [bottleState, controls, isQuiet])

  // Dynamic Background (AMOLED vs Midnight vs Standard)
  const getBackground = () => {
    if (isAmoled) return '#000000'
    if (isMidnight) return 'radial-gradient(circle at top, #3a0d13 0%, #0a0002 100%)' // Sultry Crimson
    return 'var(--charcoal)'
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden transition-colors duration-700" 
         style={{ background: getBackground(), color: isMidnight ? '#ffb3ba' : 'var(--ivory)' }}>
      
      {/* Feature 176: Toggles Bar */}
      <div style={{ position: 'absolute', top: '24px', left: '24px', display: 'flex', gap: '8px', flexWrap: 'wrap', zIndex: 20 }}>
        <button onClick={() => setIsAmoled(!isAmoled)} style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', fontSize: '10px', textTransform: 'uppercase', background: isAmoled ? 'white' : 'transparent', color: isAmoled ? 'black' : 'white' }}>
          AMOLED Black
        </button>
        <button onClick={() => setIsQuiet(!isQuiet)} style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', fontSize: '10px', textTransform: 'uppercase', background: isQuiet ? 'white' : 'transparent', color: isQuiet ? 'black' : 'white' }}>
          Quiet Mode
        </button>
        <button onClick={() => setIsThermal(!isThermal)} style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', fontSize: '10px', textTransform: 'uppercase', background: isThermal ? 'white' : 'transparent', color: isThermal ? 'black' : 'white' }}>
          Thermal UI
        </button>
      </div>

      <div className="max-w-md text-center z-10" style={{ filter: isThermal ? 'hue-rotate(90deg) saturate(2)' : 'none', transition: 'filter 0.5s' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '3rem', marginBottom: '1rem' }}>
          Sensory Playground
        </h1>
        <p style={{ opacity: 0.7, marginBottom: '4rem', fontSize: '14px' }}>
          Shake your device to rattle the glass. Tap the bottle to spray. 
        </p>

        <motion.div 
          animate={controls}
          onClick={handleSpray}
          style={{
            width: '160px',
            height: '240px',
            margin: '0 auto',
            borderRadius: '24px',
            background: bottleState === 'full' 
              ? 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 100%)'
              : 'linear-gradient(135deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.1) 100%)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Feature 119: Render Smudges */}
          {smudges.map(smudge => (
            <div key={smudge.id} style={{
              position: 'absolute',
              left: smudge.x - 30,
              top: smudge.y - 30,
              width: 60,
              height: 60,
              background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 60%)',
              borderRadius: '50%',
              pointerEvents: 'none',
              zIndex: 1,
              mixBlendMode: 'overlay'
            }} />
          ))}

          {/* Liquid Level */}
          {bottleState === 'full' && (
            <div style={{
              position: 'absolute',
              bottom: '10px',
              left: '10px',
              right: '10px',
              height: '60%',
              background: isThermal ? 'rgba(255, 0, 0, 0.4)' : 'rgba(160, 98, 42, 0.4)', // Amber or Heat Red
              borderRadius: '16px',
              filter: 'blur(4px)',
              pointerEvents: 'none',
              transition: 'background 0.5s'
            }} />
          )}

          <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '24px', zIndex: 2 }}>
            {bottleState === 'full' ? 'Nº 1' : 'Empty'}
          </span>
        </motion.div>

        <div style={{ marginTop: '4rem', display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button 
            onClick={() => { setBottleState('full'); setSmudges([]); }}
            style={{ padding: '12px 24px', borderRadius: '99px', border: '1px solid rgba(255,255,255,0.2)', fontSize: '12px', textTransform: 'uppercase' }}
          >
            Refill (Wipe Glass)
          </button>
          <button 
            onClick={() => setBottleState('empty')}
            style={{ padding: '12px 24px', borderRadius: '99px', border: '1px solid rgba(255,255,255,0.2)', fontSize: '12px', textTransform: 'uppercase', opacity: 0.5 }}
          >
            Drain
          </button>
        </div>

        {shakeCount > 0 && (
          <p style={{ marginTop: '2rem', fontSize: '12px', color: 'var(--amber)' }}>
            Glass Rattled: {shakeCount} times
          </p>
        )}
      </div>

      {/* Feature 92: Midnight Mode indicator */}
      <div style={{ position: 'absolute', bottom: '24px', fontSize: '10px', opacity: 0.3, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        {isMidnight ? 'Midnight Mode Active' : 'Standard Aura'}
      </div>

      {/* iOS 13+ DeviceMotion Permission Request */}
      {typeof (DeviceMotionEvent as any) !== 'undefined' && typeof (DeviceMotionEvent as any).requestPermission === 'function' && (
        <button 
          onClick={async () => {
            try {
              const permissionState = await (DeviceMotionEvent as any).requestPermission()
              if (permissionState === 'granted') {
                alert('Sensors unlocked. Shake your phone.')
              }
            } catch (err) {
              console.error('Error requesting device motion permission', err)
            }
          }}
          style={{ position: 'absolute', top: '24px', right: '24px', padding: '8px 16px', borderRadius: '99px', border: '1px solid rgba(255,255,255,0.2)', fontSize: '10px', textTransform: 'uppercase', background: 'transparent', color: 'var(--ivory)' }}
        >
          Unlock Sensors (iOS)
        </button>
      )}
    </div>
  )
}
