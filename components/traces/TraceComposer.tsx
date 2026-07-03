'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import Button from '@/components/ui/Button'
import SupabaseAuth from '@/app/components/SupabaseAuth'

const MAX_CHARS = 500
const BUCKET_NAME = 'fragrance-images'

type TraceType = 'fragrance' | 'moment' | 'emotional'

const TYPE_OPTIONS: { value: TraceType; label: string }[] = [
  { value: 'fragrance', label: 'Fragrance' },
  { value: 'moment', label: 'Moment' },
  { value: 'emotional', label: 'Emotional' },
]

export interface TraceComposerProps {
  fragranceId?: string
  onPosted?: () => void
}

export default function TraceComposer({ fragranceId, onPosted }: TraceComposerProps) {
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null)
  const [traceType, setTraceType] = useState<TraceType>(fragranceId ? 'fragrance' : 'moment')
  const [body, setBody] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [posted, setPosted] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const checkAuth = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase.auth.getUser()
    setIsSignedIn(Boolean(data?.user))
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const clearImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async () => {
    if (body.trim().length === 0) {
      setError('Say something first.')
      return
    }
    if (body.length > MAX_CHARS) {
      setError(`Keep it to ${MAX_CHARS} characters.`)
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      let image_url: string | null = null

      if (imageFile) {
        const supabase = createClient()
        const { data: userData } = await supabase.auth.getUser()
        const userId = userData?.user?.id ?? 'anon'
        const ext = imageFile.name.split('.').pop() || 'jpg'
        const fileName = `traces/${userId}-${Date.now()}.${ext}`

        const { error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(fileName, imageFile, { cacheControl: '3600', upsert: false })

        if (uploadError) {
          throw new Error(`Image upload failed: ${uploadError.message}`)
        }

        const { data: publicUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName)
        image_url = publicUrlData.publicUrl
      }

      const res = await fetch('/api/traces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fragrance_id: fragranceId ?? null,
          trace_type: traceType,
          body,
          image_url,
        }),
      })

      const json = await res.json()

      if (!res.ok) {
        if (res.status === 401) {
          setIsSignedIn(false)
          setError('Sign in to post a trace.')
        } else {
          setError(json.error || 'Could not post your trace.')
        }
        return
      }

      setBody('')
      clearImage()
      setPosted(true)
      setTimeout(() => setPosted(false), 2500)
      onPosted?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSignedIn === false) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          padding: 16,
          border: '1px solid var(--line)',
          borderRadius: 'var(--r-card)',
          background: 'var(--surface)',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: 16,
            color: 'var(--text)',
            lineHeight: '22px',
          }}
        >
          What does this smell like? Don&apos;t explain it. Describe it.
        </p>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Sign in to leave a trace.
        </p>
        <SupabaseAuth />
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        padding: 16,
        border: '1px solid var(--line)',
        borderRadius: 'var(--r-card)',
        background: 'var(--surface)',
      }}
    >
      <label
        htmlFor="trace-composer-body"
        style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontSize: 16,
          color: 'var(--text)',
          lineHeight: '22px',
        }}
      >
        What does this smell like? Don&apos;t explain it. Describe it.
      </label>

      {/* Type selector */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {TYPE_OPTIONS.map(opt => {
          const active = traceType === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTraceType(opt.value)}
              aria-pressed={active}
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                padding: '6px 12px',
                borderRadius: 999,
                border: `1px solid ${active ? 'var(--accent)' : 'var(--line)'}`,
                background: active ? 'color-mix(in srgb, var(--accent) 14%, transparent)' : 'transparent',
                color: active ? 'var(--accent)' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all var(--motion-responsive)',
              }}
            >
              {opt.label}
            </button>
          )
        })}
      </div>

      <textarea
        id="trace-composer-body"
        value={body}
        onChange={e => {
          if (e.target.value.length <= MAX_CHARS) setBody(e.target.value)
        }}
        placeholder="What does this smell like? Don't explain it. Describe it."
        maxLength={MAX_CHARS}
        style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontSize: 15,
          color: 'var(--text)',
          background: 'transparent',
          border: 'none',
          outline: 'none',
          resize: 'none',
          minHeight: 88,
          padding: 0,
          margin: 0,
          lineHeight: '22px',
        }}
      />

      {imagePreview && (
        <div style={{ position: 'relative', width: 96, height: 96, borderRadius: 'var(--r-card)', overflow: 'hidden' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imagePreview} alt="Trace attachment preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <button
            type="button"
            onClick={clearImage}
            aria-label="Remove image"
            style={{
              position: 'absolute',
              top: 4,
              right: 4,
              width: 22,
              height: 22,
              borderRadius: '50%',
              border: 'none',
              background: 'color-mix(in srgb, var(--bg) 80%, transparent)',
              color: 'var(--text)',
              fontSize: 12,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ×
          </button>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: 'none' }}
            id="trace-composer-image"
          />
          <label
            htmlFor="trace-composer-image"
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 12,
              color: 'var(--text-muted)',
              cursor: 'pointer',
              border: '1px solid var(--line)',
              borderRadius: 999,
              padding: '6px 12px',
            }}
          >
            {imageFile ? 'Change image' : 'Add image'}
          </label>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
            {body.length} / {MAX_CHARS}
          </span>
        </div>

        <Button onClick={handleSubmit} disabled={isSubmitting || body.trim().length === 0}>
          {isSubmitting ? 'Posting…' : posted ? 'Posted ✓' : 'Leave a trace'}
        </Button>
      </div>

      {error && (
        <p style={{ fontSize: 12, color: 'var(--danger)' }}>{error}</p>
      )}
    </div>
  )
}
