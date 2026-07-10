import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import ReadClient from './ReadClient'

export const metadata = {
  title: 'nota. — The Read',
}

export default async function ReadPage() {
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/welcome')

  // If they already have a current noseprint, skip to /noseprint
  const { data: existing } = await supabase
    .from('noseprints')
    .select('id')
    .eq('user_id', user.id)
    .eq('status', 'current')
    .maybeSingle()

  if (existing) redirect('/noseprint')

  return <ReadClient userId={user.id} />
}
