import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import BlindRankingClient from './BlindRankingClient'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'nota. — Blind Scent Ranking',
  description: 'Blind taste-test and rank fragrances unbiased by brand names or hype.',
  openGraph: {
    title: 'nota. — Blind Scent Ranking',
    description: 'Blind taste-test and rank fragrances unbiased by brand names or hype.',
  },
}

export default async function BlindRankingPage() {
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  return <BlindRankingClient isSignedIn={Boolean(user)} />
}
