export type RebrandStatus = 'canonical' | 'legacy'

export type BrandedRouteConfig = {
  canonicalPath: string
  legacyPaths: string[]
  visibleLabel: string
  metadataTitle: string
  analyticsAlias: string
}

export type SectionCopy = {
  title: string
  marginalia: string
  cue: string
}

export const BRANDED_ROUTE_CONFIG: Record<string, BrandedRouteConfig> = {
  study: {
    canonicalPath: '/study',
    legacyPaths: ['/discover'],
    visibleLabel: 'The Study',
    metadataTitle: 'The Study | nota.',
    analyticsAlias: 'study_viewed',
  },
  cabinet: {
    canonicalPath: '/cabinet',
    legacyPaths: ['/collection'],
    visibleLabel: 'The Cabinet',
    metadataTitle: 'The Cabinet | nota.',
    analyticsAlias: 'cabinet_viewed',
  },
  archive: {
    canonicalPath: '/archive',
    legacyPaths: ['/you'],
    visibleLabel: 'The Archive',
    metadataTitle: 'The Archive | nota.',
    analyticsAlias: 'archive_viewed',
  },
  lab: {
    canonicalPath: '/lab',
    legacyPaths: ['/layering'],
    visibleLabel: 'nota.Lab',
    metadataTitle: 'nota.Lab | nota.',
    analyticsAlias: 'lab_viewed',
  },
  ritual: {
    canonicalPath: '/ritual',
    legacyPaths: ['/spritz'],
    visibleLabel: 'Ritual',
    metadataTitle: 'Ritual | nota.',
    analyticsAlias: 'ritual_viewed',
  },
}

export const SECTION_COPY_REGISTRY: Record<'study' | 'cabinet' | 'archive' | 'lab' | 'ritual', SectionCopy> = {
  study: {
    title: 'The Study',
    marginalia: 'handwritten note: follow the bottle that lingers in your mind after you leave the room.',
    cue: 'Tip: narrow by mood first, then by occasion when the shelf starts answering back.',
  },
  cabinet: {
    title: 'The Cabinet',
    marginalia: 'shelf note: the cabinet should feel like memory, not inventory.',
    cue: 'Tip: keep the first row for the bottles that explain your taste at a glance.',
  },
  archive: {
    title: 'The Archive',
    marginalia: 'margin note: your dossier becomes more truthful each time you wear, save, and revisit.',
    cue: 'Tip: trace what you actually reach for, not just what you admire.',
  },
  lab: {
    title: 'nota.Lab',
    marginalia: 'bench note: start with weight, then let the lighter material do the talking.',
    cue: 'Tip: if two scents compete in the opening, the workbench is asking for a quieter anchor.',
  },
  ritual: {
    title: 'Ritual',
    marginalia: 'application note: choose for the hour ahead, not the fantasy version of the day.',
    cue: 'Tip: a good ritual aligns mood, pulse points, and how long you want the room to remember you.',
  },
}

export const SOCIAL_SUPPRESSION_COPY = {
  likes: 'saved into your journal',
  replies: 'quiet replies',
  circulation: 'quietly circulating through curator shelves',
  recent: 'recently pinned',
} as const

export function getBrandedRouteInfo(pathname: string | null | undefined) {
  if (!pathname) return null

  for (const config of Object.values(BRANDED_ROUTE_CONFIG)) {
    if (pathname === config.canonicalPath || pathname.startsWith(`${config.canonicalPath}/`)) {
      return {
        ...config,
        matchedPath: config.canonicalPath,
        status: 'canonical' as RebrandStatus,
      }
    }

    for (const legacyPath of config.legacyPaths) {
      if (pathname === legacyPath || pathname.startsWith(`${legacyPath}/`)) {
        return {
          ...config,
          matchedPath: legacyPath,
          status: 'legacy' as RebrandStatus,
        }
      }
    }
  }

  return null
}

export function resolveCanonicalPathname(pathname: string | null | undefined) {
  const info = getBrandedRouteInfo(pathname)
  if (!info) return pathname ?? ''
  return pathname?.replace(info.matchedPath, info.canonicalPath) ?? info.canonicalPath
}

export function mapSearchParamsToString(searchParams?: Record<string, string | string[] | undefined>) {
  const params = new URLSearchParams()
  if (!searchParams) return ''
  Object.entries(searchParams).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((entry) => params.append(key, entry))
      return
    }
    if (value !== undefined) {
      params.set(key, value)
    }
  })
  const query = params.toString()
  return query ? `?${query}` : ''
}
