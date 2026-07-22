'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import Button from '@/components/ui/Button'
import SupabaseAuth from '@/app/components/SupabaseAuth'
import { useSymphonicSensory } from '@/app/hooks/useSymphonicSensory'

const MAX_CHARS = 500
const BUCKET_NAME = 'fragrance-images'

export interface TraceComposerProps {
  fragranceId?: string
  onPosted?: () => void
}

export default function TraceComposer({ fragranceId, onPosted }: TraceComposerProps) {
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null)
  const [body, setBody] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [posted, setPosted] = useState(false)
  const [sealRipple, setSealRipple] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { haptic } = useSymphonicSensory()
  const inkFadeRatio = Math.min(Math.max((body.length - 400) / (MAX_CHARS - 400), 0), 1)
  const inkWeight = Math.round((1 - inkFadeRatio) * 100)
  const inkColor = inkFadeRatio === 0
    ? 'var(--charcoal)'
    : `color-mix(in srgb, var(--charcoal) ${inkWeight}%, var(--secondary-ink))`

  useEffect(() => {
    let active = true

    async function checkAuth() {
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()
      if (active) setIsSignedIn(Boolean(data?.user))
    }

    void checkAuth()

    return () => {
      active = false
    }
  }, [])

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
      setError('Leave the memory first.')
      return
    }
    if (body.length > MAX_CHARS) {
      setError('The paper is full.')
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
          trace_type: fragranceId ? 'fragrance' : 'moment',
          body,
          image_url,
        }),
      })

      const json = await res.json()

      if (!res.ok) {
        if (res.status === 401) {
          setIsSignedIn(false)
          setError('Sign in to leave a trace.')
        } else {
          setError(json.error || 'Could not leave your trace.')
        }
        return
      }

      haptic('trace-left')
      setSealRipple(true)
      window.setTimeout(() => setSealRipple(false), 700)
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

  return (
    <section
      aria-label="Trace composer"
      style={{
        position: 'relative',
        minHeight: 'calc(100dvh - 112px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        padding: 'clamp(20px, 5vw, 56px)',
        overflow: 'hidden',
        background:
          'linear-gradient(180deg, color-mix(in srgb, var(--ivory) 92%, var(--amber-glow) 8%) 0%, color-mix(in srgb, var(--ivory) 84%, var(--charcoal) 16%) 100%)',
        color: 'var(--charcoal)',
        borderRadius: 0,
        isolation: 'isolate',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27140%27 height=%27140%27 viewBox=%270 0 140 140%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.8%27 numOctaves=%272%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27140%27 height=%27140%27 filter=%27url(%23n)%27 opacity=%270.42%27/%3E%3C/svg%3E")',
          mixBlendMode: 'multiply',
          opacity: 0.15,
          zIndex: -2,
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          right: 'clamp(24px, 9vw, 132px)',
          top: 'clamp(28px, 8vw, 96px)',
          width: 46,
          height: 46,
          borderRadius: '50%',
          background: posted ? 'var(--olive)' : 'color-mix(in srgb, var(--olive) 78%, transparent)',
          boxShadow: posted
            ? '0 0 42px color-mix(in srgb, var(--olive) 46%, transparent)'
            : '0 0 24px color-mix(in srgb, var(--olive) 24%, transparent)',
          transform: sealRipple ? 'scale(1.16)' : 'scale(1)',
          transition: 'transform 200ms ease, background 200ms ease, box-shadow 200ms ease',
        }}
      />
      {sealRipple && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            right: 'calc(clamp(24px, 9vw, 132px) - 17px)',
            top: 'calc(clamp(28px, 8vw, 96px) - 17px)',
            width: 80,
            height: 80,
            borderRadius: '50%',
            border: '1px solid color-mix(in srgb, var(--amber-glow) 72%, transparent)',
            animation: 'traceSealRipple 700ms ease-out both',
          }}
        />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 760 }}>
        <p
          style={{
            margin: 0,
            fontFamily: 'var(--font-ui)',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'color-mix(in srgb, var(--charcoal) 62%, transparent)',
          }}
        >
          Trace canvas
        </p>
        <label
          htmlFor="trace-composer-body"
          style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            letterSpacing: '-0.01em',
            fontSize: 'clamp(34px, 8vw, 96px)',
            color: 'var(--charcoal)',
            lineHeight: 0.9,
          }}
        >
          What stayed on the skin?
        </label>
      </div>

      <textarea
        id="trace-composer-body"
        value={body}
        onChange={e => {
          if (e.target.value.length <= MAX_CHARS) setBody(e.target.value)
        }}
        placeholder="Write the memory, not the review."
        maxLength={MAX_CHARS}
        style={{
          flex: 1,
          minHeight: 220,
          width: '100%',
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          letterSpacing: '-0.01em',
          fontSize: 'clamp(30px, 6vw, 72px)',
          color: inkColor,
          background: 'transparent',
          border: 'none',
          outline: 'none',
          resize: 'none',
          padding: 0,
          margin: 0,
          lineHeight: 1,
          transition: 'color var(--motion-responsive)',
        }}
      />

      {imagePreview && (
        <div
          style={{
            position: 'relative',
            width: 116,
            height: 116,
            overflow: 'hidden',
            borderRadius: 0,
            transform: 'rotate(-1.5deg)',
            mixBlendMode: 'multiply',
            boxShadow: '0 18px 40px color-mix(in srgb, var(--charcoal) 22%, transparent)',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imagePreview} alt="Trace attachment preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <button
            type="button"
            onClick={clearImage}
            aria-label="Remove image"
            style={{
              position: 'absolute',
              top: 6,
              right: 6,
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'color-mix(in srgb, var(--ivory) 84%, transparent)',
              color: 'var(--charcoal)',
              fontSize: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ×
          </button>
        </div>
      )}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
          borderTop: '1px solid color-mix(in srgb, var(--charcoal) 18%, transparent)',
          paddingTop: 18,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
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
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'color-mix(in srgb, var(--charcoal) 72%, transparent)',
              cursor: 'pointer',
              borderBottom: '1px solid currentColor',
              paddingBottom: 4,
            }}
          >
            {imageFile ? 'Change image' : 'Add image'}
          </label>
        </div>

        {isSignedIn === false ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 240 }}>
            <p style={{ margin: 0, fontSize: 12, color: 'color-mix(in srgb, var(--charcoal) 64%, transparent)' }}>
              Sign in to seal this trace.
            </p>
            <SupabaseAuth />
          </div>
        ) : (
          <Button onClick={handleSubmit} disabled={isSubmitting || body.trim().length === 0}>
            {isSubmitting ? 'Sealing…' : posted ? 'Trace left' : 'Leave trace'}
          </Button>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          padding: '14px 0 0',
          fontFamily: 'var(--font-ui)',
          borderTop: '1px solid color-mix(in srgb, var(--charcoal) 10%, transparent)',
        }}
      >
        <p style={{ margin: 0, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          People like you also said...
        </p>
        <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontStyle: 'italic', letterSpacing: '-0.01em', fontSize: 18, color: 'color-mix(in srgb, var(--charcoal) 66%, transparent)' }}>
          rain on wool, a dry orange peel, the lift door at dusk
        </p>
      </div>

      {error && (
        <p style={{ margin: 0, fontSize: 12, color: 'var(--color-error)' }}>{error}</p>
      )}

      <style jsx global>{`
        @keyframes traceSealRipple {
          0% {
            opacity: 0.9;
            transform: scale(0.78);
          }
          100% {
            opacity: 0;
            transform: scale(1.75);
          }
        }
      `}</style>
    </section>
  )
}
