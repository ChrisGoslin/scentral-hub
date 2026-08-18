'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { GamificationEngine, UserExpertiseLevel, GamificationProfile } from '@/lib/gamification-engine'
import { getAdaptiveTerm } from '@/lib/language-dictionary'
import { sensory } from '@/lib/sensory-engine'

interface GamificationContextType {
  profile: GamificationProfile
  addXp: (amount: number, reason: string) => void
  getTerm: (key: Parameters<typeof getAdaptiveTerm>[0]) => string
}

const GamificationContext = createContext<GamificationContextType | null>(null)

export function GamificationProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<GamificationProfile>({
    scentsXp: 0,
    level: UserExpertiseLevel.Novice,
  })

  useEffect(() => {
    // Initialize sensory engine (haptics and audio context)
    sensory.init()
  }, [])

  const addXp = (amount: number, reason: string) => {
    setProfile(prev => {
      const newXp = prev.scentsXp + amount
      const newLevel = GamificationEngine.calculateLevel(newXp)

      // Trigger level-up feedback
      if (newLevel > prev.level) {
        sensory.playInteraction('success_chime')
        sensory.triggerHaptic('heavy')
        // In a full implementation, we'd trigger a global Metamorphosis UI transition here
        console.log(`Level Up! You are now tier ${newLevel}. Reason: ${reason}`)
      }

      return { scentsXp: newXp, level: newLevel }
    })
  }

  const getTerm = (key: Parameters<typeof getAdaptiveTerm>[0]) => {
    return getAdaptiveTerm(key, profile.level)
  }

  return (
    <GamificationContext.Provider value={{ profile, addXp, getTerm }}>
      {children}
    </GamificationContext.Provider>
  )
}

export function useGamification() {
  const ctx = useContext(GamificationContext)
  if (!ctx) {
    throw new Error('useGamification must be used within a GamificationProvider')
  }
  return ctx
}
