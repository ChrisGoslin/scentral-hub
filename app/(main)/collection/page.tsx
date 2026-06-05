import { createClient } from '@/utils/supabase/server'
import CollectionClient, { type CollectionFragrance } from './CollectionClient'
import EmptyState from '@/components/ui/EmptyState'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export default async function CollectionPage() {
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)
  
  const { data, error } = await supabase
    .from('fragrances')
    .select('id, brand, name, phase, phase_label, family, projection, anosmia_risk, lean, rating, image_url')
    .order('brand', { ascending: true })

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <EmptyState
          headline="Couldn't load collection"
          caption={error.message}
        />
      </div>
    )
  }

  return <CollectionClient fragrances={(data ?? []) as CollectionFragrance[]} />
}
