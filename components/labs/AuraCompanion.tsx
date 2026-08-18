'use client'

import React, { useEffect, useState } from 'react'
import { AuraEmotionalState, AURA_STATE_MATRIX, AuraVisualToken } from '@/lib/aura-companion'
import styles from './AuraCompanion.module.css'

interface AuraCompanionProps {
  state?: AuraEmotionalState
  interactive?: boolean
  onClick?: () => void
}

export default function AuraCompanion({
  state = 'idle_breathing',
  interactive = true,
  onClick,
}: AuraCompanionProps) {
  const [token, setToken] = useState<AuraVisualToken>(AURA_STATE_MATRIX[state])

  useEffect(() => {
    setToken(AURA_STATE_MATRIX[state] || AURA_STATE_MATRIX.idle_breathing)
  }, [state])

  return (
    <div className={styles.wrapper}>
      {/* 
        Modern Web Guidance: Popover API with light-dismiss for tooltips
        The popover attribute promotes the element to the top layer.
      */}
      <div 
        id="aura-tooltip" 
        // @ts-ignore - TS types for popover might be missing depending on version
        popover="auto"
        className={styles.popover}
        role="status"
        aria-live="polite"
      >
        {token.companionDialogueSnippet}
      </div>

      {/* Living Aura Particle Body */}
      <button
        type="button"
        // @ts-ignore
        popovertarget="aura-tooltip"
        aria-label="Aura scent companion"
        onClick={onClick}
        className={styles.companionButton}
        style={{
          // Pass the dynamic states from the matrix into native CSS variables
          '--aura-primary': token.primaryColor,
          '--aura-glow': token.glowColor,
          '--aura-speed': `${token.oscillationSpeedSec}s`,
          cursor: interactive ? 'pointer' : 'default',
        } as React.CSSProperties}
      >
        {/* Core Pulsing Dot */}
        <span className={styles.coreDot} />
      </button>
    </div>
  )
}

