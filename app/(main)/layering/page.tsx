import { Metadata } from 'next'
import { createClient } from '@/utils/supabase/server'
import LayeringClient, { type LayeringFragrance } from './LayeringClient'
import EmptyState from '@/components/ui/EmptyState'
import { cookies } from 'next/headers'

export const metadata: Metadata = {
  title: 'Layering Lab | Scentral',
  description: 'The Layering Lab. Experiment with fragrance combinations, find scents that work together, and create your own unique scent trails.',
}

export const dynamic = 'force-dynamic'

export default async function LayeringPage() {
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)
  
  const { data, error } = await supabase
    .from('fragrances')
    .select('id, brand, name, phase, phase_label, family, projection, application_zone, application_method, anosmia_risk, lean, rating, image_url')
    .order('brand', { ascending: true })

  if (error) {
    return (
      <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <EmptyState
          headline="Couldn't load fragrances"
          caption={error.message}
        />
      </div>
    )
  }

  if ((data ?? []).length === 0) {
    return (
      <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <EmptyState
          headline="Your lab is empty"
          caption="Once you've added a few bottles, we'll show you how to layer them."
        />
      </div>
    )
  }

  return <LayeringClient fragrances={(data ?? []) as LayeringFragrance[]} />
}
