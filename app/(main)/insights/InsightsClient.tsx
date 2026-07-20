'use client'

import React from 'react'
import Link from 'next/link'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

interface CachedInsights {
  your_impact?: {
    interactions_count?: number
    reactions_received?: number
    too_real_count?: number
    summary?: string
  }
  best_traces?: Array<{
    id: string
    reaction_count?: number
    content?: string
  }>
  scentiment_vision?: {
    resonance_score?: number
    warmth_factor?: string
    summary?: string
  }
  taste_evolution?: Array<{
    period?: string
    family_distribution?: Record<string, number>
  }>
  trajectory?: {
    start_families?: string[]
    current_families?: string[]
    morphing?: boolean
  }
}

interface InsightsClientProps {
  state: 'hydrated' | 'loading' | 'no-data' | 'unavailable'
  userId: string | null
  insights: CachedInsights | null
  computedAt: string | null
}

export default function InsightsClient({ state, insights, computedAt }: InsightsClientProps) {
  const notEmpty = insights && (
    (insights.your_impact?.interactions_count ?? 0) > 0 ||
    (insights.best_traces?.length ?? 0) > 0 ||
    (insights.taste_evolution?.length ?? 0) > 0 ||
    (insights.trajectory?.start_families?.length ?? 0) > 0 ||
    (insights.trajectory?.current_families?.length ?? 0) > 0
  )

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', color: 'var(--text)' }}>
      <div className="px-4 pt-6 pb-2">
        <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 28, color: 'var(--text)' }}>
          Archive Intelligence
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6, lineHeight: '20px' }}>
          How your scent identity unfolds over time.
        </p>
        {computedAt && (
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
            Last computed: {new Date(computedAt).toLocaleDateString()}
          </p>
        )}
      </div>

      <div className="px-4 pb-12">
        {(state === 'no-data' || (state === 'hydrated' && !notEmpty) || state === 'unavailable') && (
          <EmptyState variant={state === 'unavailable' ? 'unavailable' : 'empty'} />
        )}

        {(state === 'hydrated' || state === 'loading') && notEmpty ? (
          <>
            <Section title="Your Impact">
              <YourImpactSection impact={insights?.your_impact} />
            </Section>

            {insights?.best_traces && insights.best_traces.length > 0 && (
              <Section title="Best Traces">
                <BestTracesSection traces={insights.best_traces} />
              </Section>
            )}

            <Section title="Scentiment Vision">
              <ScentimentVisionSection vision={insights?.scentiment_vision} />
            </Section>

            {insights?.taste_evolution && insights.taste_evolution.length > 0 && (
              <Section title="Taste Evolution">
                <TasteEvolutionSection evolution={insights.taste_evolution} />
              </Section>
            )}

            <Section title="Your Trajectory">
              <TrajectorySection trajectory={insights?.trajectory} />
            </Section>
          </>
        ) : state === 'loading' ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Computing your insights...
          </div>
        ) : null}
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: 'var(--text)' }}>
        {title}
      </h2>
      {children}
    </div>
  )
}

function YourImpactSection({ impact }: { impact?: CachedInsights['your_impact'] }) {
  if (!impact) {
    return (
      <Card style={{ padding: 16, textAlign: 'center', color: 'var(--text-muted)' }}>
        No data yet.
      </Card>
    )
  }

  const summary = impact.summary ?? 'Start interacting to build your impact.'

  return (
    <Card style={{ padding: 20 }}>
      <p style={{ fontSize: 14, lineHeight: '1.6', marginBottom: 16, color: 'var(--text)' }}>
        {summary}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        <MetricBox label="Interactions" value={impact.interactions_count ?? 0} />
        <MetricBox label="Reactions Received" value={impact.reactions_received ?? 0} />
        <MetricBox label="Too Real" value={impact.too_real_count ?? 0} />
      </div>
    </Card>
  )
}

function BestTracesSection({ traces }: { traces: NonNullable<CachedInsights['best_traces']> }) {
  if (!traces || traces.length === 0) {
    return (
      <Card style={{ padding: 16, textAlign: 'center', color: 'var(--text-muted)' }}>
        No traces yet.
      </Card>
    )
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
      {traces.slice(0, 3).map((trace, idx) => (
        <Card key={idx} style={{ padding: 12 }}>
          <p style={{ fontSize: 12, lineHeight: '1.5', marginBottom: 8, color: 'var(--text)', minHeight: 40 }}>
            {trace.content?.slice(0, 60) || 'Untitled trace'}...
          </p>
          <p style={{ fontSize: 12, color: 'var(--xp-color)', fontWeight: 500 }}>
            {trace.reaction_count ?? 0} reaction{(trace.reaction_count ?? 0) !== 1 ? 's' : ''}
          </p>
        </Card>
      ))}
    </div>
  )
}

function ScentimentVisionSection({ vision }: { vision?: CachedInsights['scentiment_vision'] }) {
  if (!vision) {
    return (
      <Card style={{ padding: 16, textAlign: 'center', color: 'var(--text-muted)' }}>
        No resonance data yet.
      </Card>
    )
  }

  const summary = vision.summary ?? 'Your scent resonance is awakening.'

  return (
    <Card style={{ padding: 20 }}>
      <p style={{ fontSize: 14, lineHeight: '1.6', marginBottom: 16, color: 'var(--text)' }}>
        {summary}
      </p>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Resonance Score</p>
          <p style={{ fontSize: 20, fontWeight: 600, color: 'var(--xp-color)' }}>
            {vision.resonance_score ?? 0}%
          </p>
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Status</p>
          <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', textTransform: 'capitalize' }}>
            {vision.warmth_factor ?? 'awaiting'}
          </p>
        </div>
      </div>
    </Card>
  )
}

function TasteEvolutionSection({ evolution }: { evolution?: CachedInsights['taste_evolution'] }) {
  if (!evolution || evolution.length === 0) {
    return (
      <Card style={{ padding: 16, textAlign: 'center', color: 'var(--text-muted)' }}>
        No evolution data yet.
      </Card>
    )
  }

  const latestPeriod = evolution[evolution.length - 1]

  return (
    <Card style={{ padding: 20 }}>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
        Your scent families are shifting over time.
      </p>
      {latestPeriod?.family_distribution && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
          {Object.entries(latestPeriod.family_distribution)
            .sort((a, b) => (b[1] as number) - (a[1] as number))
            .slice(0, 4)
            .map(([family, count]) => {
              const n = count as number
              return (
                <div key={family} style={{ padding: 8, background: 'var(--surface)', borderRadius: 8 }}>
                  <p style={{ fontSize: 12, color: 'var(--text)', fontWeight: 500 }}>
                    {family}
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {n} scent{n !== 1 ? 's' : ''}
                  </p>
                </div>
              )
            })}
        </div>
      )}
    </Card>
  )
}

function TrajectorySection({ trajectory }: { trajectory?: CachedInsights['trajectory'] }) {
  if (!trajectory?.current_families || trajectory.current_families.length === 0) {
    return (
      <Card style={{ padding: 16, textAlign: 'center', color: 'var(--text-muted)' }}>
        Your trajectory is just beginning.
      </Card>
    )
  }

  const isMorphing = trajectory.morphing ?? false

  return (
    <Card style={{ padding: 20 }}>
      <p style={{ fontSize: 14, lineHeight: '1.6', marginBottom: 16, color: 'var(--text)' }}>
        {isMorphing
          ? 'Your scent identity is evolving — new families have joined your collection.'
          : 'Your tastes remain consistent across your collection.'}
      </p>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: 12,
          background: 'var(--surface)',
          borderRadius: 8,
        }}
      >
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Start</p>
          <p style={{ fontSize: 12, color: 'var(--text)' }}>
            {trajectory.start_families?.join(', ') || 'Building...'}
          </p>
        </div>
        <div style={{ fontSize: 20, color: 'var(--xp-color)' }}>→</div>
        <div style={{ flex: 1, textAlign: 'right' }}>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Now</p>
          <p style={{ fontSize: 12, color: 'var(--text)' }}>
            {trajectory.current_families?.join(', ') || 'Awaiting...'}
          </p>
        </div>
      </div>
    </Card>
  )
}

function MetricBox({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ textAlign: 'center', padding: 12, background: 'var(--surface)', borderRadius: 8 }}>
      <p style={{ fontSize: 18, fontWeight: 600, color: 'var(--xp-color)', marginBottom: 4 }}>
        {value}
      </p>
      <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</p>
    </div>
  )
}

function EmptyState({ variant = 'empty' }: { variant?: 'empty' | 'unavailable' }) {
  const isUnavailable = variant === 'unavailable'

  return (
    <Card
      style={{
        padding: 32,
        textAlign: 'center',
        background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-2) 100%)',
      }}
    >
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: 'var(--text)' }}>
        {isUnavailable ? 'Insights Temporarily Unavailable' : 'Start Building Your Insights'}
      </h3>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20, lineHeight: '1.6' }}>
        {isUnavailable
          ? 'We could not compute fresh insights right now. Try again in a moment.'
          : 'Interact with scents, describe traces, and build your collection to see your evolving scent identity.'}
      </p>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link href="/study">
          <Button>Enter The Study</Button>
        </Link>
        <Link href="/cabinet">
          <Button variant="secondary">Open The Cabinet</Button>
        </Link>
      </div>
    </Card>
  )
}
