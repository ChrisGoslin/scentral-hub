'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type Props = {
  isOpen: boolean
  onClose: () => void
  wearLogId: string | null
  placeholder?: string
}

export default function WearNoteSheet({ isOpen, onClose, wearLogId, placeholder }: Props) {
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [progress, setProgress] = useState(100)
  const [interacted, setInteracted] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setNote('')
      setSaving(false)
      setProgress(100)
      setInteracted(false)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen || interacted) return
    const duration = 8000
    const start = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - start
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100)
      setProgress(remaining)
      if (remaining === 0) {
        clearInterval(interval)
        onClose()
      }
    }, 50)
    return () => clearInterval(interval)
  }, [isOpen, interacted, onClose])

  const handleSave = async () => {
    if (!note.trim() || !wearLogId) {
      onClose()
      return
    }
    setSaving(true)
    try {
      await fetch('/api/wear-log/note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wearLogId, note: note.trim() }),
      })
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: '40vh',
            minHeight: 250,
            background: 'var(--surface)',
            borderTop: '1px solid var(--line)',
            boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
            zIndex: 100,
            padding: '24px 16px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Progress bar */}
          {!interacted && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'var(--line)' }}>
              <div style={{ height: '100%', background: 'var(--accent)', width: `${progress}%`, transition: 'width 50ms linear' }} />
            </div>
          )}

          <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 16, color: 'var(--text)', margin: 0 }}>
            What does it remind you of?
          </h2>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, marginBottom: 16 }}>
            Optional. Just for you.
          </p>

          <textarea
            value={note}
            onChange={e => {
              setNote(e.target.value)
              setInteracted(true)
            }}
            onFocus={() => setInteracted(true)}
            placeholder={placeholder ?? "What does it remind you of?"}
            maxLength={120}
            style={{
              flex: 1,
              background: 'var(--surface-2)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--r-card)',
              padding: 12,
              fontSize: 14,
              color: 'var(--text)',
              resize: 'none',
              outline: 'none',
              marginBottom: 16,
            }}
          />

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => {
                setInteracted(true)
                onClose()
              }}
              style={{
                flex: 1,
                background: 'transparent',
                border: '1px solid var(--line)',
                color: 'var(--text-muted)',
                borderRadius: 999,
                padding: '12px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Skip
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                flex: 1,
                background: 'var(--accent)',
                border: 'none',
                color: 'var(--bg)',
                borderRadius: 999,
                padding: '12px',
                fontSize: 13,
                fontWeight: 600,
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? 'Saving...' : 'Save →'}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
