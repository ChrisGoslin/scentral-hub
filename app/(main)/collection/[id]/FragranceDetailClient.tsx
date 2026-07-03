'use client'

import { useState, useCallback, useEffect } from 'react'
import Button from '@/components/ui/Button'
import WearLogModal, { type WearLogModalProps } from '../WearLogModal'
import { createClient } from '@/utils/supabase/client'

interface NotesPyramidProps {
  pyramid: {
    top?: string[]
    heart?: string[]
    base?: string[]
  } | null
}

export function NotesPyramid({ pyramid }: NotesPyramidProps) {
  if (!pyramid || (!pyramid.top && !pyramid.heart && !pyramid.base)) {
    return null
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)' }}>
        Fragrance Notes
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {pyramid.top && pyramid.top.length > 0 && (
          <div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 4 }}>
              Top Notes
            </p>
            <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: '18px' }}>
              {pyramid.top.join(', ')}
            </p>
          </div>
        )}

        {pyramid.heart && pyramid.heart.length > 0 && (
          <div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 4 }}>
              Heart Notes
            </p>
            <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: '18px' }}>
              {pyramid.heart.join(', ')}
            </p>
          </div>
        )}

        {pyramid.base && pyramid.base.length > 0 && (
          <div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 4 }}>
              Base Notes
            </p>
            <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: '18px' }}>
              {pyramid.base.join(', ')}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

interface WearLogButtonProps {
  fragranceId: string
  fragranceName: string
  brandName: string
  collectionId?: string
}

export function WearLogButton({ fragranceId, fragranceName, brandName, collectionId }: WearLogButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const displayName = `${brandName} ${fragranceName}`

  return (
    <>
      <Button onClick={() => setIsOpen(true)} variant="secondary">
        Log a Wear
      </Button>
      {collectionId && (
        <WearLogModal
          fragranceId={fragranceId}
          fragranceName={displayName}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  )
}

interface ScentJournalProps {
  fragranceId: string
}

const MAX_CHARS = 500

export function ScentJournal({ fragranceId }: ScentJournalProps) {
  const storageKey = `scentral_journal_${fragranceId}`
  const [notes, setNotes] = useState('')
  const [saved, setSaved] = useState(false)
  const charCount = notes.length

  useEffect(() => {
    setNotes(localStorage.getItem(storageKey) ?? '')
  }, [storageKey])

  const handleSave = useCallback(() => {
    localStorage.setItem(storageKey, notes)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }, [notes, storageKey])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= MAX_CHARS) {
      setNotes(e.target.value)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)' }}>
        My Notes
      </p>
      <textarea
        value={notes}
        onChange={handleChange}
        placeholder="What does this smell like to you? A memory, a place, a person..."
        maxLength={MAX_CHARS}
        style={{
          fontFamily: 'var(--font-cormorant)',
          fontStyle: 'italic',
          fontSize: 15,
          color: 'var(--text)',
          background: 'transparent',
          border: 'none',
          outline: 'none',
          resize: 'none',
          minHeight: 80,
          padding: 0,
          margin: 0,
          lineHeight: '22px',
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          {charCount} / {MAX_CHARS}
        </span>
        <button
          onClick={handleSave}
          disabled={saved}
          style={{
            background: 'transparent',
            border: '1px solid var(--line)',
            borderRadius: 4,
            padding: '6px 12px',
            fontSize: 12,
            fontWeight: 600,
            color: saved ? 'var(--positive)' : 'var(--text-muted)',
            cursor: saved ? 'default' : 'pointer',
            transition: 'all 200ms',
          }}
          onMouseEnter={(e) => {
            if (!saved) {
              (e.target as HTMLButtonElement).style.borderColor = 'var(--accent)'
              ;(e.target as HTMLButtonElement).style.color = 'var(--accent)'
            }
          }}
          onMouseLeave={(e) => {
            if (!saved) {
              (e.target as HTMLButtonElement).style.borderColor = 'var(--line)'
              ;(e.target as HTMLButtonElement).style.color = 'var(--text-muted)'
            }
          }}
        >
          {saved ? 'Saved ✓' : 'Save'}
        </button>
      </div>
    </div>
  )
}
