import { createClient } from '@/utils/supabase/server'
import ChallengeCard from './ChallengeCard'

export default async function ActiveChallengeSection() {
  const supabase = await createClient()

  const { data: challenge, error } = await supabase
    .from('weekly_challenges')
    .select('id, title, description, category, participant_count')
    .eq('is_active', true)
    .single()

  if (error || !challenge) {
    return null
  }

  return (
    <div style={{ paddingLeft: '16px', paddingRight: '16px', paddingBottom: '8px' }}>
      <ChallengeCard challenge={challenge} />
    </div>
  )
}
