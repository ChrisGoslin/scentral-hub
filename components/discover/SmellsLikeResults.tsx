'use client'

import Link from 'next/link'
import { FragranceCardMedia } from '@/components/discover/FragranceCardMedia'
import EmptyState from '@/components/ui/EmptyState'

export type SmellsLikeFragrance = {
  id: string
  brand: string
  name: string
  family: string
  image_url: string | null
}

export type SmellsLikeResult = {
  fragrance: SmellsLikeFragrance
  matchType: 'exact' | 'inspired_by' | 'note_similarity'
  confidence: number
  explanation?: string
}

type Props = {
  results: SmellsLikeResult[]
  loading: boolean
}

const SECTIONS: { key: SmellsLikeResult['matchType']; title: string; showBadge: boolean }[] = [
  { key: 'exact', title: 'Exact Matches', showBadge: false },
  { key: 'inspired_by', title: 'Clones & DNA Matches', showBadge: true },
  { key: 'note_similarity', title: 'Similar Notes & Structure', showBadge: true },
]

function ResultGrid({ results, showBadge }: { results: SmellsLikeResult[]; showBadge: boolean }) {
  return (
    <div className="grid grid-cols-4 md:grid-cols-6 xl:grid-cols-10 gap-2 px-2">
      {results.map((result) => (
        <Link
          key={result.fragrance.id}
          href={`/cabinet/${result.fragrance.id}?from=study`}
          style={{ textDecoration: 'none', display: 'block', position: 'relative' }}
        >
          <FragranceCardMedia
            imageUrl={result.fragrance.image_url}
            brand={result.fragrance.brand}
            name={result.fragrance.name}
            family={result.fragrance.family}
            wall
          />
          {showBadge && (
            <span
              role="img"
              aria-label={`${Math.round(result.confidence)} percent match`}
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                padding: '2px 6px',
                fontSize: 9,
                fontWeight: 600,
                borderRadius: 999,
                background: 'color-mix(in srgb, var(--bg) 55%, transparent)',
                color: 'var(--accent)',
                border: '1px solid var(--accent)',
                zIndex: 2,
              }}
            >
              ~{Math.round(result.confidence)}% Match
            </span>
          )}
        </Link>
      ))}
    </div>
  )
}

export function SmellsLikeResults({ results, loading }: Props) {
  if (loading) {
    return (
      <p style={{ padding: '16px 16px 8px', fontSize: 12, color: 'var(--text-muted)' }}>Searching the scent universe…</p>
    )
  }

  if (results.length === 0) {
    return (
      <div style={{ padding: '48px 16px', textAlign: 'center' }}>
        <EmptyState
          headline="No matches found"
          caption="Try a different search or explore the full collection."
        />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 24 }}>
      {SECTIONS.map(({ key, title, showBadge }) => {
        const sectionResults = results.filter((r) => r.matchType === key)
        if (sectionResults.length === 0) return null
        return (
          <section key={key}>
            <p
              style={{
                fontSize: 12,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                padding: '0 16px',
                marginBottom: 10,
              }}
            >
              {title}
            </p>
            <ResultGrid results={sectionResults} showBadge={showBadge} />
          </section>
        )
      })}
    </div>
  )
}
