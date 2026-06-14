import { createClient } from '@/utils/supabase/server'
import DiscoverClient, { type DiscoverFragrance } from './DiscoverClient'
import { cookies } from 'next/headers'

export const metadata = {
  title: 'Discover',
  description: 'Discover and explore fragrances',
}

export default async function DiscoverPage() {
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)

  const { data, error } = await supabase
    .from('fragrances')
    .select('id, brand, name, image_url, primary_vector, plain_description, inspired_by, temperature, dominant_accords')
    .order('brand', { ascending: true })

  if (error) {
    console.error('Failed to fetch fragrances:', error)
    return (
      <div style={{ background: 'var(--bg)', minHeight: '100vh', padding: '40px 20px' }}>
        <p style={{ color: 'var(--text-muted)' }}>Failed to load fragrances. Please try again.</p>
      </div>
    )
  }

  const fragrances: DiscoverFragrance[] = (data || []).map(f => ({
    id: f.id,
    brand: f.brand,
    name: f.name,
    image_url: f.image_url,
    primary_vector: f.primary_vector,
    plain_description: f.plain_description,
    inspired_by: f.inspired_by,
    temperature: f.temperature,
    dominant_accords: f.dominant_accords,
  }))

  return <DiscoverClient fragrances={fragrances} />
}
