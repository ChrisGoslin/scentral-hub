import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import TrailPlayer from './TrailPlayer'
import type { TrailStep } from './types'

export const dynamic = 'force-dynamic'

export default async function TrailDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)

  const { data: trail } = await supabase
    .from('trails')
    .select('id, title, hook, slug, published')
    .eq('slug', slug)
    .maybeSingle()

  if (!trail || !trail.published) notFound()

  const { data: steps } = await supabase
    .from('trail_steps')
    .select('id, trail_id, position, step_type, content')
    .eq('trail_id', trail.id)
    .order('position', { ascending: true })

  const { data: { user } } = await supabase.auth.getUser()

  let initialStep = 0
  if (user) {
    const { data: progress } = await supabase
      .from('trail_progress')
      .select('last_step, completed_at')
      .eq('user_id', user.id)
      .eq('trail_id', trail.id)
      .maybeSingle()

    if (progress && !progress.completed_at) {
      initialStep = progress.last_step
    }
  }

  return (
    <TrailPlayer
      trailId={trail.id}
      trailTitle={trail.title}
      steps={(steps ?? []) as TrailStep[]}
      isSignedIn={!!user}
      initialStep={initialStep}
    />
  )
}
