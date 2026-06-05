'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function SupabaseAuth() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    async function fetchUser() {
      try {
        // @ts-ignore
        const { data } = await supabase.auth.getUser()
        // @ts-ignore
        if (mounted) setUserEmail(data?.user?.email ?? null)
      } catch (e) {
        // ignore
      }
    }
    fetchUser()
    return () => { mounted = false }
  }, [])

  async function signIn(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)
    try {
      const { error } = await supabase.auth.signInWithOtp({ email })
      if (error) setMsg(String(error.message))
      else setMsg('Magic link sent — check your email')
    } catch (err: any) {
      setMsg(String(err.message || err))
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUserEmail(null)
    setMsg('Signed out')
  }

  if (userEmail) {
    return (
      <div className="bg-slate-900 border border-slate-700 rounded p-3 text-sm">
        <div className="text-slate-300">Signed in as</div>
        <div className="text-white font-medium">{userEmail}</div>
        <button onClick={signOut} className="mt-2 rounded border px-3 py-1 text-sm">Sign out</button>
        {msg && <div className="text-slate-400 text-xs mt-2">{msg}</div>}
      </div>
    )
  }

  return (
    <form onSubmit={signIn} className="bg-slate-900 border border-slate-700 rounded p-3 text-sm">
      <div className="text-slate-300 text-xs">Sign in (magic link)</div>
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@domain.com" className="mt-1 w-48 bg-transparent border-b border-slate-700 text-white text-sm py-1 focus:outline-none" />
      <div className="mt-2 flex gap-2">
        <button type="submit" className="rounded bg-amber-500 px-3 py-1 text-black text-sm">Send</button>
      </div>
      {msg && <div className="text-slate-400 text-xs mt-2">{msg}</div>}
    </form>
  )
}
