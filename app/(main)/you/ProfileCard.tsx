'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { getPersonaById } from '@/lib/personas'
import ThemeToggle from '@/components/ThemeToggle'
import Button from '@/components/ui/Button'
import Chip from '@/components/ui/Chip'
import Link from 'next/link'

type Persona = {
  name: string
  narrative: { tagline: string }
  ui_theme: { cardBg: string; accentColor: string }
}

export type ProfileCardProps = {
  email: string
  onSignOut: () => void
  signingOut: boolean
  onReset: () => void
}

function PersonaCardComponent({ persona }: { persona: Persona }) {
  const router = useRouter()
  return (
    <div
      className="relative rounded-[16px] p-5 mb-2 overflow-hidden shadow-sm border"
      style={{
        background: persona.ui_theme.cardBg,
        borderColor: `${persona.ui_theme.accentColor}30`,
        borderLeft: `4px solid ${persona.ui_theme.accentColor}`,
        '--persona-accent': persona.ui_theme.accentColor,
      } as React.CSSProperties}
    >
      <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700 }}>
        Your Scent Identity
      </p>
      <p style={{ fontSize: 22, fontFamily: 'var(--font-display)', color: 'var(--text)', marginTop: 4 }}>
        {persona.name}
      </p>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, lineHeight: '18px' }}>
        {persona.narrative.tagline}
      </p>
      <button
        onClick={() => router.push('/onboarding')}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          fontSize: 11,
          color: 'var(--text-muted)',
          marginTop: 12,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}
        className="hover:opacity-70 transition-opacity"
      >
        Retake profiler <span style={{ color: 'var(--persona-accent)' }}>→</span>
      </button>
    </div>
  )
}

function VibeSelector({ vibe, onVibeChange, onReset }: { vibe: string | null; onVibeChange: (v: string) => void; onReset: () => void }) {
  return (
    <section>
      <p style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>
        MY VIBE
      </p>
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'warm', label: 'Warm & Rich' },
          { key: 'fresh', label: 'Fresh & Clean' },
          { key: 'bold', label: 'Bold & Lasting' },
          { key: 'soft', label: 'Light & Subtle' },
        ].map((opt) => (
          <Chip
            key={opt.key}
            selected={vibe === opt.key}
            onClick={() => {
              localStorage.setItem('scentral_vibe', opt.key)
              onVibeChange(opt.key)
            }}
          >
            {opt.label}
          </Chip>
        ))}
      </div>
      <button
        onClick={onReset}
        style={{ fontSize: 12, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', marginTop: 8, padding: 0 }}
      >
        Reset onboarding
      </button>
    </section>
  )
}

function SettingsSection({ email, onSignOut, signingOut, onReset }: ProfileCardProps) {
  return (
    <div className="flex flex-col gap-1" style={{ borderTop: '1px solid var(--line)', paddingTop: 20 }}>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
        Settings
      </p>

      {/* Account email */}
      <div className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid var(--line)' }}>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Account</p>
        <p style={{ fontSize: 13, color: 'var(--text)', maxWidth: '55%', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {email}
        </p>
      </div>

      {/* Push Notifications toggle */}
      <div className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid var(--line)' }}>
        <div>
          <p style={{ fontSize: 14, color: 'var(--text)' }}>Push notifications</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Maceration alerts & streak protection</p>
        </div>
        <button
          onClick={async () => {
            try {
              const { subscribeToPush } = await import('@/lib/push')
              const subscription = await subscribeToPush()
              if (subscription) {
                alert('Push notifications enabled!')
              } else {
                alert('Permission denied or not supported')
              }
            } catch (e: any) {
              alert('Failed to enable push: ' + e.message)
            }
          }}
          style={{ padding: '6px 12px', fontSize: 12, borderRadius: 999, background: 'var(--surface-2)', border: '1px solid var(--line)', color: 'var(--text)' }}
        >
          Enable
        </button>
      </div>

      {/* Affiliate disclosure toggle — non-functional placeholder */}
      <div className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid var(--line)', opacity: 0.45 }}>
        <div>
          <p style={{ fontSize: 14, color: 'var(--text)' }}>Affiliate disclosure</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Show when content is sponsored</p>
        </div>
        <div
          aria-hidden="true"
          style={{ width: 40, height: 22, borderRadius: 999, background: 'var(--surface-2)', border: '1px solid var(--line)', position: 'relative', flexShrink: 0 }}
        >
          <div style={{ position: 'absolute', left: 3, top: 3, width: 14, height: 14, borderRadius: '50%', background: 'var(--text-muted)' }} />
        </div>
      </div>

      {/* Dark mode toggle */}
      <div style={{ borderBottom: '1px solid var(--line)', paddingTop: 8, paddingBottom: 8 }}>
        <ThemeToggle />
      </div>

      {/* Reset preferences */}
      <button
        onClick={onReset}
        className="text-left py-3 w-full transition-colors"
        style={{ fontSize: 14, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', borderBottom: '1px solid var(--line)' }}
      >
        Reset my preferences
      </button>

      {/* BaseNote Pro */}
      <div className="flex flex-col">
        <Link href="/pro" className="text-left py-3 w-full border-b border-[var(--line)]" style={{ fontSize: 14, color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
          ✦ Unlock BaseNote Pro
        </Link>
      </div>

      {/* Legal Links */}
      <div className="flex flex-col">
        <Link href="/privacy" className="text-left py-3 w-full border-b border-[var(--line)]" style={{ fontSize: 14, color: 'var(--text-muted)', textDecoration: 'none' }}>
          Privacy Policy
        </Link>
        <Link href="/terms" className="text-left py-3 w-full border-b border-[var(--line)]" style={{ fontSize: 14, color: 'var(--text-muted)', textDecoration: 'none' }}>
          Terms of Service
        </Link>
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

export default function ProfileCard(props: ProfileCardProps & { vibe: string | null; onVibeChange: (v: string) => void }) {
  const [persona, setPersona] = useState<Persona | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const storedPersona = localStorage.getItem('scentral_persona')
    if (storedPersona) {
      const p = getPersonaById(storedPersona)
      if (p) {
        setPersona(p)
      }
    }
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <>
      {persona && <PersonaCardComponent persona={persona} />}
      <VibeSelector vibe={props.vibe} onVibeChange={props.onVibeChange} onReset={props.onReset} />
      <SettingsSection {...props} />
    </>
  )
}
