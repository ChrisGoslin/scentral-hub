'use client'

import { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import type { AuraResultItem, LayeringFragrance } from './useLayeringWizard'

type Props = {
  open: boolean
  onClose: () => void
  base: LayeringFragrance | null
  top: AuraResultItem | null
  third?: { name: string } | null
}

function getNextFormulaNumber(): number {
  const n = parseInt(localStorage.getItem('scentral_formula_count') ?? '0', 10)
  const next = n + 1
  localStorage.setItem('scentral_formula_count', String(next))
  return next
}

export default function FormulaCard({ open, onClose, base, top, third }: Props) {
  const [formulaNumber, setFormulaNumber] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [editingName, setEditingName] = useState(false)
  const [deepLink, setDeepLink] = useState('')

  useEffect(() => {
    if (!open || !base || !top) return
    const key = `${base.id}_${top.id}`
    const stored = JSON.parse(localStorage.getItem('scentral_formula_names') ?? '{}')
    if (stored[key]) {
      setName(stored[key].name)
      setFormulaNumber(stored[key].number)
    } else {
      const num = getNextFormulaNumber()
      const defaultName = `Formula No. ${num}`
      setFormulaNumber(num)
      setName(defaultName)
      stored[key] = { name: defaultName, number: num }
      localStorage.setItem('scentral_formula_names', JSON.stringify(stored))
    }

    const params = new URLSearchParams()
    params.set('f1', base.id)
    params.set('f2', top.id)
    setDeepLink(`${window.location.origin}/layering?${params.toString()}`)
  }, [open, base, top])

  if (!open || !base || !top) return null

  function saveName(newName: string) {
    setName(newName)
    const key = `${base!.id}_${top!.id}`
    const stored = JSON.parse(localStorage.getItem('scentral_formula_names') ?? '{}')
    stored[key] = { name: newName, number: formulaNumber }
    localStorage.setItem('scentral_formula_names', JSON.stringify(stored))
  }

  async function handleShare() {
    const text = `${name}\n${base!.name} (base) + ${top!.name} (layer)${third ? ` + ${third.name} (finish)` : ''}\nnota. · Find your base note`
    if (navigator.share) {
      try {
        await navigator.share({ title: name, text, url: deepLink })
        return
      } catch { /* user cancelled */ }
    }
    try {
      await navigator.clipboard.writeText(`${text}\n${deepLink}`)
    } catch { /* ignore */ }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 'min(320px, 100%)',
          aspectRatio: '9/16',
          background: '#1A1208',
          borderRadius: 12,
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ height: 2, width: '100%', background: 'var(--accent)' }} />

        <p style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginTop: 16 }}>
          {editingName ? (
            <input
              autoFocus
              defaultValue={name}
              onBlur={e => { saveName(e.target.value || name); setEditingName(false) }}
              onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
              style={{ background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.7)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', outline: 'none', width: '100%' }}
            />
          ) : (
            <span onClick={() => setEditingName(true)} style={{ cursor: 'pointer' }}>{name.toUpperCase()}</span>
          )}
        </p>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16 }}>
          <div>
            <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 32, color: 'white', lineHeight: 1.1 }}>
              {base.name}
            </p>
            <p style={{ fontSize: 9, fontFamily: 'monospace', color: 'var(--accent)', marginTop: 4 }}>BASE</p>
          </div>

          <div style={{ height: 1, background: 'rgba(255,255,255,0.1)' }} />

          <div>
            <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 24, color: 'white', lineHeight: 1.1 }}>
              {top.name}
            </p>
            <p style={{ fontSize: 9, fontFamily: 'monospace', color: 'var(--accent)', marginTop: 4 }}>LAYER</p>
          </div>

          {third && (
            <div>
              <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 20, color: 'white', opacity: 0.7, lineHeight: 1.1 }}>
                {third.name}
              </p>
              <p style={{ fontSize: 9, fontFamily: 'monospace', color: 'var(--accent)', marginTop: 4 }}>FINISH</p>
            </div>
          )}
        </div>

        <div style={{ height: 1, width: '100%', background: 'var(--accent)' }} />

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 12 }}>
          <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)' }}>nota. · Find your base note</p>
          {deepLink && (
            <div style={{ background: 'white', padding: 4, borderRadius: 4 }}>
              <QRCodeSVG value={deepLink} size={48} />
            </div>
          )}
        </div>
      </div>

      <button
        onClick={onClose}
        style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'white', fontSize: 24, cursor: 'pointer' }}
        aria-label="Close"
      >
        ×
      </button>

      <button
        onClick={e => { e.stopPropagation(); handleShare() }}
        style={{
          position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--accent)', color: 'var(--bg)', border: 'none', borderRadius: 999,
          padding: '12px 28px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}
      >
        Share Formula →
      </button>
    </div>
  )
}
