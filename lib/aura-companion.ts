/**
 * nota.Labs Living Companion Engine ("Aura" / Auwa-inspired Companion)
 * Manages real-time fluid morphing, state reactions, and synesthetic audio-visual responses.
 */

import { OlfactoryFamily } from './spikes/scan-to-shelf'

export type AuraEmotionalState =
  | 'idle_breathing'
  | 'curious_inspecting'
  | 'layering_harmonizing'
  | 'clash_dissonance'
  | 'alignment_ecstasy'
  | 'nocturnal_sleep'

export interface AuraVisualToken {
  primaryColor: string
  glowColor: string
  particleDensity: number
  fluidViscosity: number
  oscillationSpeedSec: number
  ambientSoundFrequencyHz: number
  companionDialogueSnippet: string
}

export const AURA_STATE_MATRIX: Record<AuraEmotionalState, AuraVisualToken> = {
  idle_breathing: {
    primaryColor: '#E5E0D6',
    glowColor: 'rgba(160, 98, 42, 0.25)', // Warm amber glow
    particleDensity: 24,
    fluidViscosity: 0.8,
    oscillationSpeedSec: 3.2,
    ambientSoundFrequencyHz: 432, // Healing calm drone
    companionDialogueSnippet: 'Quietly observing your scent space…',
  },
  curious_inspecting: {
    primaryColor: '#F7F4EE',
    glowColor: 'rgba(46, 196, 182, 0.4)', // Turquoise curiosity
    particleDensity: 48,
    fluidViscosity: 0.5,
    oscillationSpeedSec: 1.4,
    ambientSoundFrequencyHz: 528,
    companionDialogueSnippet: 'Inhaling top notes and volatile accords…',
  },
  layering_harmonizing: {
    primaryColor: '#A0622A',
    glowColor: 'rgba(157, 78, 221, 0.45)', // Velvet plum harmony
    particleDensity: 64,
    fluidViscosity: 0.3,
    oscillationSpeedSec: 0.9,
    ambientSoundFrequencyHz: 639,
    companionDialogueSnippet: 'Blended sillage creating an intoxicating third accord.',
  },
  clash_dissonance: {
    primaryColor: '#8A4A3B',
    glowColor: 'rgba(217, 119, 6, 0.5)',
    particleDensity: 32,
    fluidViscosity: 1.2,
    oscillationSpeedSec: 0.4,
    ambientSoundFrequencyHz: 216,
    companionDialogueSnippet: 'Warning: heavy gourmand notes are clashing with marine ozone.',
  },
  alignment_ecstasy: {
    primaryColor: '#D4AF37', // Gold-foil radiance
    glowColor: 'rgba(212, 175, 55, 0.7)',
    particleDensity: 96,
    fluidViscosity: 0.2,
    oscillationSpeedSec: 0.6,
    ambientSoundFrequencyHz: 741,
    companionDialogueSnippet: 'Masterful alignment. Your true noseprint signature.',
  },
  nocturnal_sleep: {
    primaryColor: '#1A1208',
    glowColor: 'rgba(43, 41, 38, 0.3)',
    particleDensity: 12,
    fluidViscosity: 1.5,
    oscillationSpeedSec: 4.8,
    ambientSoundFrequencyHz: 108,
    companionDialogueSnippet: 'Evening desk in low candlelight…',
  },
}

/**
 * Calculates dynamic Aura response based on user scent interaction
 */
export function calculateAuraResponse(
  family: OlfactoryFamily,
  interactionType: 'hover' | 'drag' | 'layer' | 'idle',
  harmonyScorePct = 85
): AuraVisualToken {
  if (interactionType === 'idle') return AURA_STATE_MATRIX.idle_breathing
  if (interactionType === 'hover') return AURA_STATE_MATRIX.curious_inspecting
  if (interactionType === 'layer') {
    return harmonyScorePct >= 70
      ? AURA_STATE_MATRIX.layering_harmonizing
      : AURA_STATE_MATRIX.clash_dissonance
  }
  return AURA_STATE_MATRIX.curious_inspecting
}
