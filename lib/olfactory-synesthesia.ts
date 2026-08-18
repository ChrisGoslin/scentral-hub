/**
 * Olfactory Synesthesia & Memory Dream Engine
 * - "If This Scent Was A Song" (Acoustic playlist pairing by accord volatility)
 * - Generative Memory Dreamscapes (Sensory prompt synthesis)
 * - Pinned Handwritten Notes & Sketch Attachments
 */

import { OlfactoryFamily } from './spikes/scan-to-shelf'

export interface ScentPlaylistTrack {
  stage: 'Top Note Burst' | 'Heart Evolution' | 'Base Resonant Trail'
  trackTitle: string
  artist: string
  genre: string
  mood: string
  bpm: number
  acousticTexture: string
}

export interface AcousticScentPairing {
  fragranceName: string
  brand: string
  overallVibe: string
  spotifySearchQuery: string
  playlistTracks: ScentPlaylistTrack[]
}

export interface MemoryDreamscapePrompt {
  userMemoryText: string
  evocativeKeywords: string[]
  recommendedImagePrompt: string
  synestheticColorPalette: string[]
}

export interface PinnedMemoryNote {
  id: string
  bottleId: string
  handwrittenNote: string
  sketchType?: 'pet' | 'botanical' | 'holiday_landscape' | 'abstract_aura'
  tapedAngleDeg: number // e.g. -2.5deg for organic feel
  createdDate: string
}

/**
 * "If This Scent Was A Song" (#35, #44)
 * Generates an acoustic tracklist matching the molecular volatility and notes of a fragrance.
 */
export function pairScentWithAcousticPlaylist(
  fragranceName: string,
  brand: string,
  family: OlfactoryFamily,
  topNote = 'Bergamot',
  heartNote = 'Iris',
  baseNote = 'Cedar'
): AcousticScentPairing {
  let tracks: ScentPlaylistTrack[] = []
  let vibe = ''

  if (family === 'Woody' || family === 'Amber & Oriental' || family === 'Leather & Smoke') {
    vibe = 'Warm candlelit studio, vinyl crackle, acoustic strings & cello'
    tracks = [
      {
        stage: 'Top Note Burst',
        trackTitle: 'Opening Fog & Strings',
        artist: 'Nils Frahm',
        genre: 'Modern Classical / Ambient',
        mood: `Crisp introduction carrying ${topNote}`,
        bpm: 78,
        acousticTexture: 'Soft felt piano with ambient room reverb',
      },
      {
        stage: 'Heart Evolution',
        trackTitle: 'Midnight Archive',
        artist: 'Max Richter',
        genre: 'Cinematic Neoclassical',
        mood: `Deepening velvety warmth of ${heartNote}`,
        bpm: 65,
        acousticTexture: 'Low cello drones with subtle tape delay',
      },
      {
        stage: 'Base Resonant Trail',
        trackTitle: 'Ember & Cedar',
        artist: 'Brian Eno',
        genre: 'Ambient Minimalist',
        mood: `Lingering, intimate dry-down of ${baseNote}`,
        bpm: 52,
        acousticTexture: 'Warm analog synthesizer waves and slow decay',
      },
    ]
  } else {
    vibe = 'Sunlit Mediterranean terrace, sparkling harp, breezy acoustic guitar'
    tracks = [
      {
        stage: 'Top Note Burst',
        trackTitle: 'Solar Citrus Breeze',
        artist: 'Bibio',
        genre: 'Folktronica / Chillwave',
        mood: `Effervescent sparkling splash of ${topNote}`,
        bpm: 110,
        acousticTexture: 'Brisk acoustic strumming with bright high frequencies',
      },
      {
        stage: 'Heart Evolution',
        trackTitle: 'Green Glass & Petals',
        artist: 'Tycho',
        genre: 'Downtempo Ambient',
        mood: `Uplifting clean radiance of ${heartNote}`,
        bpm: 95,
        acousticTexture: 'Shimmering analog synths with clean guitar plucks',
      },
      {
        stage: 'Base Resonant Trail',
        trackTitle: 'White Driftwood',
        artist: 'Bonobo',
        genre: 'Organic Electronic',
        mood: `Comforting clean skin-scent of ${baseNote}`,
        bpm: 80,
        acousticTexture: 'Deep sub-bass pulse with airy field recordings',
      },
    ]
  }

  return {
    fragranceName,
    brand,
    overallVibe: vibe,
    spotifySearchQuery: `https://open.spotify.com/search/${encodeURIComponent(`${brand} ${fragranceName} ambient mood`)}`,
    playlistTracks: tracks,
  }
}

/**
 * Generates an evocative AI image prompt from a raw user memory
 * (e.g. "burning marshmallows on a boat in the middle of the caspian sea")
 */
export function synthesizeMemoryDreamPrompt(
  rawMemory: string,
  fragranceName: string,
  family: OlfactoryFamily
): MemoryDreamscapePrompt {
  const cleanMemory = rawMemory.trim()
  const prompt = `A breathtaking, highly tactile editorial photograph: ${cleanMemory}. Atmospheric candlelight, deep volumetric shadows, warm amber and cobalt tones, fine film grain, natural textures of heavy unbleached paper and weathered wood. Aesthetic of a luxury sensory memory journal for nota. perfume.`

  return {
    userMemoryText: cleanMemory,
    evocativeKeywords: cleanMemory.split(' ').filter((w) => w.length > 4),
    recommendedImagePrompt: prompt,
    synestheticColorPalette:
      family === 'Woody'
        ? ['#2B2926', '#A0622A', '#E5E0D6', '#6B7250']
        : ['#F7F4EE', '#2EC4B6', '#B8AC9C', '#E5E0D6'],
  }
}

/**
 * Creates a pinned handwritten memory note with organic tilt
 */
export function createPinnedMemoryNote(
  bottleId: string,
  handwrittenNote: string,
  sketchType?: PinnedMemoryNote['sketchType']
): PinnedMemoryNote {
  const randomTilt = (Math.random() * 5 - 2.5).toFixed(1) // -2.5deg to +2.5deg
  return {
    id: `note_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    bottleId,
    handwrittenNote,
    sketchType: sketchType || 'pet',
    tapedAngleDeg: parseFloat(randomTilt),
    createdDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
  }
}
