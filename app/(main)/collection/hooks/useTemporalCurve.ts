'use client'

import { useState, useCallback } from 'react'

export interface TemporalCurve {
  stage_1_first_spray: { alignment_vector: number }
  stage_2_the_heart: { alignment_vector: number }
  stage_3_dry_down: { alignment_vector: number }
}

export function sliderToVector(value: number): number {
  return Math.round((value / 100) * 1000) / 1000
}

export function vectorToEmoji(vector: number): string {
  const ALIGNMENT_EMOJIS = ['😶', '😐', '🙂', '😊', '🤩'] as const
  const idx = Math.round(vector * 4)
  return ALIGNMENT_EMOJIS[Math.min(idx, 4)]
}

export function useTemporalCurve(initialValue: number = 50) {
  const [s1, setS1] = useState(initialValue)
  const [s2, setS2] = useState(initialValue)
  const [s3, setS3] = useState(initialValue)

  const reset = useCallback(() => {
    setS1(initialValue)
    setS2(initialValue)
    setS3(initialValue)
  }, [initialValue])

  const toTemporalCurve = useCallback((): TemporalCurve => {
    return {
      stage_1_first_spray: { alignment_vector: sliderToVector(s1) },
      stage_2_the_heart: { alignment_vector: sliderToVector(s2) },
      stage_3_dry_down: { alignment_vector: sliderToVector(s3) },
    }
  }, [s1, s2, s3])

  const getAverageVector = useCallback((): number => {
    return (sliderToVector(s1) + sliderToVector(s2) + sliderToVector(s3)) / 3
  }, [s1, s2, s3])

  return {
    s1,
    setS1,
    s2,
    setS2,
    s3,
    setS3,
    reset,
    toTemporalCurve,
    getAverageVector,
  }
}
