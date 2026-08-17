import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import NoseprintClient from './NoseprintClient'

export async function generateMetadata() {
  return {
    title: 'nota. — My Noseprint',
    description: 'Your personal olfactory profile and fragrance DNA signature on nota.',
    openGraph: {
      title: 'nota. — My Noseprint',
      description: 'Your personal olfactory profile and fragrance DNA signature on nota.',
      images: ['/api/og/noseprint'],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'nota. — My Noseprint',
      description: 'Your personal olfactory profile and fragrance DNA signature on nota.',
    },
  }
}

export default async function NoseprintPage() {
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/noseprint')

  const { data: noseprints } = await supabase
    .from('noseprints')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (!noseprints || noseprints.length === 0) redirect('/welcome')

  const current = noseprints.find(n => n.status === 'current') ?? noseprints[0]
  const history = noseprints.filter(n => n.id !== current.id)

  // Fetch fragrance matches for display
  let matches: { id: string; name: string; brand: string; family: string }[] = []
  if (current.matches?.length) {
    const { data } = await supabase
      .from('fragrances')
      .select('id, name, brand, family')
      .in('id', current.matches.slice(0, 3))
    matches = data || []
  }

  return (
    <NoseprintClient
      noseprint={current}
      history={history}
      matches={matches}
      userId={user.id}
    />
  )
}
