'use client'

import { useRef, useState } from 'react'
import Sheet from '@/components/ui/Sheet'

type Props = {
  fragranceId: string
  brand: string
  name: string
  family: string
  optimalSeason: string | null
  plainDescription: string | null
  inspiredBy: string | null
}

function truncate(text: string, max: number) {
  if (text.length <= max) return text
  return text.slice(0, max).trimEnd() + '…'
}

export default function GiftThis({ fragranceId, brand, name, family, optimalSeason, plainDescription, inspiredBy }: Props) {
  const [open, setOpen] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<string | null>(null)

  const url = typeof window !== 'undefined'
    ? `${window.location.origin}/collection/${fragranceId}?ref=gift`
    : `/collection/${fragranceId}?ref=gift`

  const giftMessage = [
    `Found something for you — ${name} by ${brand}.`,
    plainDescription ? truncate(plainDescription, 80) : null,
    inspiredBy ? `There's also an inspired-by version for less.` : null,
    url,
  ].filter(Boolean).join(' ')

  async function handleCopyLink() {
    await navigator.clipboard.writeText(url)
    setStatus('Link copied')
    setTimeout(() => setStatus(null), 2000)
  }

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: `${brand} ${name}`, text: giftMessage, url })
      } catch {
        // user cancelled — no-op
      }
    } else {
      await handleCopyLink()
    }
  }

  function handleWhatsApp() {
    window.open(`https://wa.me/?text=${encodeURIComponent(giftMessage)}`, '_blank', 'noopener,noreferrer')
  }

  async function handleDownload() {
    if (!cardRef.current) return
    const html2canvas = (await import('html2canvas')).default
    const canvas = await html2canvas(cardRef.current, { backgroundColor: '#1A1208', scale: 2 })
    const link = document.createElement('a')
    link.download = `${brand}-${name}-basenote.png`.replace(/\s+/g, '-').toLowerCase()
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: 'var(--accent)',
          background: 'transparent',
          border: '1px solid color-mix(in srgb, var(--accent) 40%, transparent)',
          borderRadius: 999,
          padding: '8px 16px',
          cursor: 'pointer',
        }}
      >
        ◇ Gift This
      </button>

      <Sheet open={open} onClose={() => setOpen(false)}>
        <div
          ref={cardRef}
          style={{
            width: '100%',
            maxWidth: 375,
            aspectRatio: '375 / 500',
            margin: '0 auto',
            background: '#1A1208',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            padding: '0 24px',
            overflow: 'hidden',
          }}
        >
          <div style={{ height: 2, width: '100%', background: 'var(--accent)' }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingTop: 20 }}>
            <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.45)', margin: 0 }}>
              {brand}
            </p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 28, color: '#fff', marginTop: 8 }}>
              {name}
            </h2>
            <p style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--color-vetiver)', marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {family}{optimalSeason ? ` · ${optimalSeason}` : ''}
            </p>
            {plainDescription && (
              <p style={{ fontSize: 13, fontStyle: 'italic', color: 'rgba(255,255,255,0.55)', marginTop: 14, lineHeight: '20px' }}>
                "{truncate(plainDescription, 100)}"
              </p>
            )}
            <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '20px 0' }} />
            {inspiredBy && (
              <div>
                <p style={{ fontSize: 10, color: 'var(--accent)', margin: 0 }}>◆ Inspired By alternative available</p>
                <p style={{ fontSize: 11, color: 'var(--accent)', marginTop: 4 }}>
                  From {inspiredBy} · a fraction of the price
                </p>
              </div>
            )}
            <div style={{ flex: 1 }} />
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textAlign: 'right', paddingBottom: 16 }}>
              BaseNote
            </p>
          </div>
          <div style={{ height: 2, width: '100%', background: 'var(--accent)' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
          <button onClick={handleCopyLink} style={shareOptionStyle}>Copy link</button>
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button onClick={handleShare} style={shareOptionStyle}>Share</button>
          )}
          <button onClick={handleWhatsApp} style={shareOptionStyle}>WhatsApp →</button>
          <button onClick={handleDownload} style={shareOptionStyle}>Download card</button>
          {status && (
            <p style={{ fontSize: 12, color: 'var(--accent)', textAlign: 'center', marginTop: 4 }}>{status}</p>
          )}
        </div>
      </Sheet>
    </>
  )
}

const shareOptionStyle: React.CSSProperties = {
  fontSize: 14,
  color: 'var(--text)',
  background: 'var(--surface-2)',
  border: '1px solid var(--line)',
  borderRadius: 'var(--r-card)',
  padding: '14px',
  textAlign: 'left',
  cursor: 'pointer',
}
