import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

export async function getArchiveSession() {
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)

  let session = null
  const authCookie = cookieStore.get('sb-lrkdwobnemczvhpixpky-auth-token')
  const testCookie = cookieStore.get('fake-session')
  const allowTestSession = process.env.E2E_AUTH_BYPASS === '1'

  if (allowTestSession && (testCookie?.value === 'true' || (authCookie && authCookie.value.includes('fake-access-token')))) {
    session = { user: { id: 'test-user-id', email: 'test@example.com' } }
  } else {
    const { data } = await supabase.auth.getSession()
    session = data.session
  }

  return { cookieStore, supabase, session }
}
