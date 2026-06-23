import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import IntelligenceClient from './IntelligenceClient'
import EmptyState from '@/components/ui/EmptyState'
import ProGate from '@/components/ui/ProGate'
import { getIsPro } from '@/lib/subscription'

export const dynamic = 'force-dynamic'

export default async function IntelligencePage() {
  if (!getIsPro()) {
    return (
      <ProGate
        featureName="Deep Dive"
        description="See patterns across your whole collection — which scents dominate, what you're over-rotating, and what the data says about your taste."
        preview={
          <div className="px-6 pt-12 pb-8 space-y-8 pointer-events-none">
            <h1 className="text-4xl font-serif italic">Deep Dive</h1>
            <div className="grid grid-cols-2 gap-8">
              <div className="h-48 bg-[var(--surface)] border border-[var(--line)] rounded" />
              <div className="h-48 bg-[var(--surface)] border border-[var(--line)] rounded" />
            </div>
            <div className="h-64 bg-[var(--surface)] border border-[var(--line)] rounded" />
          </div>
        }
      />
    )
  }

  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)

  // Fetch fragrances with rating IS NOT NULL (user's collection)
  // We need metadata for radar, distribution, and planner.
  // We also need embedding for the top 5 query anchors in Section 3.
  const { data, error } = await supabase
    .from('fragrances')
    .select('id, brand, name, phase, family, projection, anosmia_risk, optimal_season, heart_notes, rating, embedding')
    .not('rating', 'is', null)
    .order('rating', { ascending: false })

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-6">
        <EmptyState headline="Intelligence Layer Unavailable" caption={error.message} />
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-6 text-center">
        <div className="max-w-xs space-y-4">
          <p className="text-[var(--text-muted)] text-sm font-light">
            Your intelligence dashboard requires at least one rated fragrance in your wardrobe to generate insights.
          </p>
        </div>
      </div>
    )
  }

  // Map to include has_embedding boolean and clean up nulls
  const fragrances = data.map(f => ({
    ...f,
    has_embedding: !!f.embedding,
    heart_notes: f.heart_notes || [],
  }))

  return <IntelligenceClient fragrances={fragrances} />
}
