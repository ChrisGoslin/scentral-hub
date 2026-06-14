// IntelligenceClient and data-fetching imports preserved for when billing ships.
// Activate by setting isPro = true in components/ui/ProGate.tsx.
// import { createClient } from '@/utils/supabase/server'
// import { cookies } from 'next/headers'
// import IntelligenceClient from './IntelligenceClient'
// import EmptyState from '@/components/ui/EmptyState'
import ProGate from '@/components/ui/ProGate'

export const dynamic = 'force-dynamic'

export default async function IntelligencePage() {
  // Pro gate — replace isPro = false in ProGate component when billing is ready
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
