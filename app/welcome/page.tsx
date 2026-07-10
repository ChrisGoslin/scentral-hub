import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import WelcomeClient from './WelcomeClient'

export const metadata = {
  title: 'nota. — Welcome',
}

export default async function WelcomePage() {
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/welcome')

  const { data: existing } = await supabase
    .from('noseprints')
    .select('id')
    .eq('user_id', user.id)
    .eq('status', 'current')
    .maybeSingle()

  if (existing) redirect('/noseprint')

  return <WelcomeClient />
}
