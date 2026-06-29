'use client'

import { useState, useCallback } from 'react'
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
  collectionId: string
  initialNotes: string | null
}

export function ScentJournal({ fragranceId, collectionId, initialNotes }: ScentJournalProps) {
  const [notes, setNotes] = useState(initialNotes ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleBlur = useCallback(async () => {
    setSaving(true)
    try {
      const anonId = localStorage.getItem('scentral_anon_id')
      if (!anonId) throw new Error('No anon ID')

      const supabase = createClient()
      const { error } = await supabase
        .from('collections')
        .update({ scent_memory: notes || null })
        .eq('id', collectionId)
        .eq('anon_id', anonId)

      if (error) throw error

      setSaved(true)
      setTimeout(() => setSaved(false), 1500)
    } catch (err) {
      console.error('Failed to save notes:', err)
    } finally {
      setSaving(false)
    }
  }, [collectionId, notes])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--accent)' }}>
        My Notes
      </p>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        onBlur={handleBlur}
        placeholder="What does this smell like to you? A memory, a place, a person..."
        style={{
          fontFamily: 'var(--font-display)',
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
      {saved && (
        <p style={{ fontSize: 12, color: 'var(--positive)', fontWeight: 500, margin: 0 }}>
          ✓ Saved
        </p>
      )}
    </div>
  )
}
