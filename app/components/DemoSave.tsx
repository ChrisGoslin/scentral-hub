"use client"
import { useState } from 'react'
import { useToast } from './useToast'

export default function DemoSave() {
  const [busy, setBusy] = useState(false)
  const toast = useToast()

  async function handleSave() {
    setBusy(true)
    try {
      const res = await fetch('/api/demo/save', { method: 'POST' })
      if (res.ok) {
        toast?.push('Saved — demo success')
      } else {
        toast?.push('Save failed', 'error')
      }
    } catch (e) {
      toast?.push('Network error', 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      onClick={handleSave}
      disabled={busy}
      className="inline-flex items-center gap-2 bg-amber-400/95 text-slate-900 px-4 py-2 rounded-full shadow-sm transition hover:-translate-y-0.5 active:scale-95 disabled:opacity-60"
    >
      {busy ? 'Saving…' : 'Demo Save'}
    </button>
  )
}
