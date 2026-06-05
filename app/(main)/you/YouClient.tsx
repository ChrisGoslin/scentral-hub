'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import ErrorInline from '@/components/ui/ErrorInline'
import LoadingShimmer from '@/components/ui/LoadingShimmer'
import AuthSheet from '@/components/auth/AuthSheet'

export type SavedCombination = {
  id: string
  name: string | null
  occasion: string | null
  created_at: string | null
  base_sprays: number | null
  top_sprays: number | null
  base_frag: { brand: string; name: string } | null
  top_frag: { brand: string; name: string } | null
}

export type YouClientProps =
  | { state: 'signed-out' }
  | { state: 'signed-in'; email: string; saves: SavedCombination[]; fetchError: string | null }

function formatDate(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000)
  if (diffDays === 0) return 'today'
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return d.toLocaleDateString('en-IE', { day: 'numeric', month: 'short' })
}

function SavedItem({ combo }: { combo: SavedCombination }) {
  const baseName = combo.base_frag?.name ?? null
  const topName = combo.top_frag?.name ?? null
  const displayPair =
    baseName && topName
      ? `${baseName} → ${topName}`
      : combo.name ?? 'Formulation'

  const meta = [
    combo.occasion ? combo.occasion.charAt(0).toUpperCase() + combo.occasion.slice(1) : null,
    formatDate(combo.created_at),
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <Card>
      <p style={{ fontSize: 15, color: 'var(--text)', fontFamily: 'var(--font-display)', lineHeight: '20px' }}>
        {displayPair}
      </p>
      {meta && (
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{meta}</p>
      )}
    </Card>
  )
}

function SettingsSection({ email, onSignOut, signingOut }: { email: string; onSignOut: () => void; signingOut: boolean }) {
  return (
    <div className="flex flex-col gap-1" style={{ borderTop: '1px solid var(--line)', paddingTop: 20 }}>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
        Settings
      </p>

      {/* Account email */}
      <div className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid var(--line)' }}>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Account</p>
        <p style={{ fontSize: 13, color: 'var(--text)', maxWidth: '60%', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {email}
        </p>
      </div>

      {/* Affiliate disclosure toggle — non-functional placeholder */}
      <div className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid var(--line)', opacity: 0.45 }}>
        <div>
          <p style={{ fontSize: 14, color: 'var(--text)' }}>Affiliate disclosure</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Show when content is sponsored</p>
        </div>
        {/* Toggle pill — non-functional, coming post-MVP */}
        <div
          aria-hidden="true"
          style={{ width: 40, height: 22, borderRadius: 999, background: 'var(--surface-2)', border: '1px solid var(--line)', position: 'relative', flexShrink: 0 }}
        >
          <div style={{ position: 'absolute', left: 3, top: 3, width: 14, height: 14, borderRadius: '50%', background: 'var(--text-muted)' }} />
        </div>
      </div>

      {/* Sign out */}
      <button
        onClick={onSignOut}
        disabled={signingOut}
        className="text-left py-3 transition-colors"
        style={{ fontSize: 14, color: signingOut ? 'var(--text-muted)' : 'var(--danger)', background: 'none', border: 'none', cursor: signingOut ? 'not-allowed' : 'pointer' }}
      >
        {signingOut ? 'Signing out…' : 'Sign out'}
      </button>
    </div>
  )
}

export default function YouClient(props: YouClientProps) {
  const router = useRouter()
  const [authSheetOpen, setAuthSheetOpen] = useState(false)
  const [signingOut, startSignOut] = useTransition()

  function handleSignOut() {
    startSignOut(async () => {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.refresh()
    })
  }

  if (props.state === 'signed-out') {
    return (
      <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
        <div className="px-4 pt-8 pb-4" style={{ borderBottom: '1px solid var(--line)' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--text)', lineHeight: '34px' }}>You</h1>
        </div>

        <div className="flex flex-col items-center justify-center px-6 py-20 gap-6">
          <EmptyState
            headline="Sign in to save your formulations."
            caption="Your saved pairings will appear here once you're signed in."
            action={
              <Button onClick={() => setAuthSheetOpen(true)}>Sign in</Button>
            }
          />
        </div>

        <AuthSheet
          open={authSheetOpen}
          onClose={() => setAuthSheetOpen(false)}
          redirectTo={typeof window !== 'undefined' ? `${window.location.origin}/auth/confirm?next=/you` : '/auth/confirm?next=/you'}
        />
      </div>
    )
  }

  const { email, saves, fetchError } = props

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>
      {/* Header */}
      <div className="px-4 pt-8 pb-4" style={{ borderBottom: '1px solid var(--line)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--text)', lineHeight: '34px' }}>You</h1>
      </div>

      <div className="px-4 py-6 flex flex-col gap-6">
        {/* Saved list */}
        <div className="flex flex-col gap-3">
          <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Saved ({saves.length})
          </p>

          {fetchError ? (
            <ErrorInline message={fetchError} />
          ) : saves.length === 0 ? (
            <EmptyState
              headline="No saves yet."
              caption="Formulate a pairing in the Lab and save it here."
            />
          ) : (
            <div className="flex flex-col gap-3">
              {saves.map(combo => (
                <SavedItem key={combo.id} combo={combo} />
              ))}
            </div>
          )}
        </div>

        {/* Settings */}
        <SettingsSection
          email={email}
          onSignOut={handleSignOut}
          signingOut={signingOut}
        />
      </div>
    </div>
  )
}
