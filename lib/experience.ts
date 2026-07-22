import { getBrandedRouteInfo } from '@/lib/rebrand'

export type IntentLevel = 'novice' | 'curator' | 'expert'

export type IntentProfile = {
  level: IntentLevel
  prefersDepth: boolean
  valuesNovelty: boolean
  socialSuppression: boolean
  source: 'heuristic' | 'prefetched'
}

export type PresenceMode = 'morning-ritual' | 'evening-desk'

export type SurfacePatinaState = 'fresh' | 'rested' | 'aged' | 'archived'

export type SensoryEvent = 'reveal' | 'alignment' | 'drag' | 'destroy' | 'clink' | 'trace-left'

export type AcousticCue = 'clink'

export type LiveActivityWearState = {
  stage: 'top' | 'heart' | 'base'
  intensity: number
  progress: number
}

export type ArtifactCapture = {
  artifactId: string
  sourceContributorId?: string
  targetContributorId?: string
  interaction: 'save' | 'stamp' | 'rip'
  createdAt: string
}

export type RouteExperienceMeta = {
  label: string
  canonicalPath?: string
  aliases?: string[]
  rebrandStatus?: 'canonical' | 'legacy'
  dominantAction: string
  shellVisible: boolean
  ambientEligible: boolean
  socialSuppression: boolean
}

export type ReadRevealPayload = {
  opening: string
  noseprintName: string
  descriptor: string
  signals: string[]
  stretchNote: string
}

export type ReadPrefetchPayload = {
  reveal: ReadRevealPayload
  matchIds: string[]
  matchData: Array<{ id: string; name: string; brand: string; family: string }>
  intentProfile: IntentProfile
  prefetchedAt: number
}

export const READ_RITUAL_TIMING = {
  preRevealMs: 2400,
  frozenHoldMs: 1200,
  revealLockMs: 1200,
} as const

export const EXPERIENCE_ROUTE_META: Record<string, RouteExperienceMeta> = {
  '/welcome': {
    label: 'Welcome',
    dominantAction: 'Begin the read',
    shellVisible: false,
    ambientEligible: true,
    socialSuppression: true,
  },
  '/read': {
    label: 'The Read',
    dominantAction: 'Reflect',
    shellVisible: false,
    ambientEligible: true,
    socialSuppression: true,
  },
  '/discover': {
    label: 'The Study',
    canonicalPath: '/study',
    aliases: ['/discover'],
    rebrandStatus: 'legacy',
    dominantAction: 'Describe a scent',
    shellVisible: true,
    ambientEligible: true,
    socialSuppression: false,
  },
  '/study': {
    label: 'The Study',
    canonicalPath: '/study',
    aliases: ['/discover'],
    rebrandStatus: 'canonical',
    dominantAction: 'Describe a scent',
    shellVisible: true,
    ambientEligible: true,
    socialSuppression: false,
  },
  '/collection': {
    label: 'The Cabinet',
    canonicalPath: '/cabinet',
    aliases: ['/collection'],
    rebrandStatus: 'legacy',
    dominantAction: 'Rearrange your cabinet',
    shellVisible: true,
    ambientEligible: true,
    socialSuppression: false,
  },
  '/cabinet': {
    label: 'The Cabinet',
    canonicalPath: '/cabinet',
    aliases: ['/collection'],
    rebrandStatus: 'canonical',
    dominantAction: 'Rearrange your cabinet',
    shellVisible: true,
    ambientEligible: true,
    socialSuppression: false,
  },
  '/noseprint': {
    label: 'Identity',
    dominantAction: 'Revisit your dossier',
    shellVisible: true,
    ambientEligible: true,
    socialSuppression: false,
  },
  '/shelf': {
    label: 'Shelf',
    dominantAction: 'Arrange your bottles',
    shellVisible: true,
    ambientEligible: true,
    socialSuppression: false,
  },
  '/traces': {
    label: 'Traces',
    dominantAction: 'Capture a memory',
    shellVisible: true,
    ambientEligible: true,
    socialSuppression: true,
  },
  '/you': {
    label: 'The Archive',
    canonicalPath: '/archive',
    aliases: ['/you'],
    rebrandStatus: 'legacy',
    dominantAction: 'Review your dossier',
    shellVisible: true,
    ambientEligible: true,
    socialSuppression: true,
  },
  '/archive': {
    label: 'The Archive',
    canonicalPath: '/archive',
    aliases: ['/you'],
    rebrandStatus: 'canonical',
    dominantAction: 'Review your dossier',
    shellVisible: true,
    ambientEligible: true,
    socialSuppression: true,
  },
  '/layering': {
    label: 'nota.Lab',
    canonicalPath: '/lab',
    aliases: ['/layering'],
    rebrandStatus: 'legacy',
    dominantAction: 'Use the workbench',
    shellVisible: true,
    ambientEligible: true,
    socialSuppression: false,
  },
  '/lab': {
    label: 'nota.Lab',
    canonicalPath: '/lab',
    aliases: ['/layering'],
    rebrandStatus: 'canonical',
    dominantAction: 'Use the workbench',
    shellVisible: true,
    ambientEligible: true,
    socialSuppression: false,
  },
  '/spritz': {
    label: 'Ritual',
    canonicalPath: '/ritual',
    aliases: ['/spritz'],
    rebrandStatus: 'legacy',
    dominantAction: 'Choose today’s ritual',
    shellVisible: true,
    ambientEligible: true,
    socialSuppression: true,
  },
  '/ritual': {
    label: 'Ritual',
    canonicalPath: '/ritual',
    aliases: ['/spritz'],
    rebrandStatus: 'canonical',
    dominantAction: 'Choose today’s ritual',
    shellVisible: true,
    ambientEligible: true,
    socialSuppression: true,
  },
}

export function getRouteExperienceMeta(pathname: string | null | undefined): RouteExperienceMeta {
  if (!pathname) {
    return {
      label: 'nota.',
      rebrandStatus: 'canonical',
      dominantAction: 'Continue',
      shellVisible: true,
      ambientEligible: true,
      socialSuppression: false,
    }
  }

  const branded = getBrandedRouteInfo(pathname)
  const matched = Object.entries(EXPERIENCE_ROUTE_META).find(([route]) => pathname === route || pathname.startsWith(`${route}/`))
  return matched?.[1] ?? {
    label: 'nota.',
    canonicalPath: branded?.canonicalPath,
    aliases: branded?.legacyPaths,
    rebrandStatus: branded?.status ?? 'canonical',
    dominantAction: 'Continue',
    shellVisible: true,
    ambientEligible: true,
    socialSuppression: pathname.includes('/social') || pathname.includes('/wear-and-share'),
  }
}

export function inferPresenceMode(date = new Date()): PresenceMode {
  const hour = date.getHours()
  if (hour >= 6 && hour < 18) {
    return 'morning-ritual'
  }
  return 'evening-desk'
}

export function inferIntentProfile(signalCount: number, ownedCount: number): IntentProfile {
  const level: IntentLevel =
    ownedCount >= 18 || signalCount >= 8 ? 'expert' : ownedCount >= 6 || signalCount >= 4 ? 'curator' : 'novice'

  return {
    level,
    prefersDepth: level !== 'novice',
    valuesNovelty: ownedCount >= 10,
    socialSuppression: true,
    source: 'heuristic',
  }
}

export function getPatinaState(daysSinceTouched: number): SurfacePatinaState {
  if (daysSinceTouched >= 180) return 'archived'
  if (daysSinceTouched >= 60) return 'aged'
  if (daysSinceTouched >= 14) return 'rested'
  return 'fresh'
}
