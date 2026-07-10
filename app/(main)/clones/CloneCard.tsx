'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FragranceCardMedia } from '@/components/discover/FragranceCardMedia'
import AffiliateButton from '@/components/ads/AffiliateButton'
import type { CloneFragrance } from './page'

type Props = {
  clone: CloneFragrance
}

type VerdictData = {
  score: number
  verdict: string
  buyRecommendation: 'yes' | 'maybe' | 'skip'
}

export default function CloneCard({ clone }: Props) {
  const [verdict, setVerdict] = useState<VerdictData | null>(null)
  const [loading, setLoading] = useState(false)
  const [showVerdict, setShowVerdict] = useState(false)

  // Load cached verdict on mount
  useEffect(() => {
    const cached = localStorage.getItem(`scentral_clone_verdict_${clone.name}`)
    if (cached) {
      try {
        setVerdict(JSON.parse(cached))
        setShowVerdict(true)
      } catch (e) {
        // Invalid cached data, ignore
      }
    }
  }, [clone.name])

  const handleGetVerdict = async () => {
    if (verdict) {
      setShowVerdict(!showVerdict)
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/clone-confidence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cloneName: clone.name,
          cloneBrand: clone.brand,
          inspirationName: clone.inspired_by.split(' ').slice(1).join(' ') || clone.inspired_by,
          inspirationBrand: clone.inspired_by.split(' ')[0] || clone.inspired_by,
          cloneId: clone.id,
        }),
      })

      if (!res.ok) throw new Error('Failed to get verdict')

      const data = await res.json()
      const verdictData: VerdictData = {
        score: data.score,
        verdict: data.verdict,
        buyRecommendation: data.buyRecommendation,
      }

      setVerdict(verdictData)
      setShowVerdict(true)
      localStorage.setItem(`scentral_clone_verdict_${clone.name}`, JSON.stringify(verdictData))
    } catch (error) {
      console.error('Error fetching verdict:', error)
    } finally {
      setLoading(false)
    }
  }

  const recommendationColor = verdict
    ? verdict.buyRecommendation === 'yes'
      ? 'var(--accent)'
      : verdict.buyRecommendation === 'maybe'
        ? 'oklch(0.77 0.17 65)'
        : 'var(--text-muted)'
    : 'var(--text-muted)'

  return (
    <div style={{ flexShrink: 0, width: 120 }}>
      <Link href={`/cabinet/${clone.id}?from=clones`} style={{ textDecoration: 'none' }}>
        <div
          style={{
            border: '1px solid var(--line)',
            borderRadius: 'var(--r-card)',
            overflow: 'hidden',
          }}
        >
          <FragranceCardMedia
            imageUrl={clone.image_url}
            brand={clone.brand}
            name={clone.name}
            family={clone.family}
            compact
          />
        </div>
        <div style={{ padding: '6px 2px 0' }}>
          <p style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {clone.brand}
          </p>
          <p
            style={{
              fontSize: 11,
              color: 'var(--text)',
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              lineHeight: 1.3,
            }}
          >
            {clone.name}
          </p>
        </div>
      </Link>

      {/* Verdict Button */}
      <div style={{ padding: '6px 0 4px' }}>
        <button
          onClick={handleGetVerdict}
          disabled={loading}
          style={{
            width: '100%',
            padding: '6px 0',
            background: 'var(--color-surface)',
            border: '1px solid var(--line)',
            borderRadius: 4,
            fontSize: 9,
            fontWeight: 500,
            color: 'var(--text-muted)',
            cursor: 'pointer',
            opacity: loading ? 0.6 : 1,
            transition: 'all var(--motion-responsive)',
          }}
        >
          {loading ? 'Loading…' : verdict && showVerdict ? 'Hide' : 'Verdict'}
        </button>
      </div>

      {/* Verdict Display */}
      {verdict && showVerdict && (
        <div
          style={{
            marginTop: 8,
            padding: 8,
            background: 'var(--color-surface)',
            borderRadius: 4,
            border: `1px solid ${recommendationColor}`,
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: recommendationColor,
              marginBottom: 4,
            }}
          >
            {verdict.score.toFixed(1)}/10
          </div>
          <p
            style={{
              fontSize: 8,
              color: 'var(--text-muted)',
              lineHeight: 1.3,
              marginBottom: 4,
            }}
          >
            {verdict.verdict}
          </p>
          <span
            style={{
              fontSize: 7,
              textTransform: 'uppercase',
              fontWeight: 700,
              letterSpacing: '0.06em',
              color: recommendationColor,
            }}
          >
            {verdict.buyRecommendation === 'yes'
              ? '✓ Buy'
              : verdict.buyRecommendation === 'maybe'
                ? '~ Maybe'
                : '✗ Skip'}
          </span>
        </div>
      )}

      {clone.buy_url && (
        <div style={{ padding: '4px 0 0' }}>
          <AffiliateButton
            buyUrl={clone.buy_url}
            buyLabel={clone.buy_label ?? undefined}
            fragranceName={clone.name}
            fragranceId={clone.id}
            compact
          />
        </div>
      )}
    </div>
  )
}
