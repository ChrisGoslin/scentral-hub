'use client'

import { useRef, useEffect, useState } from 'react'
import Sheet from '@/components/ui/Sheet'
import { getPersonaById } from '@/lib/personas'

type Props = {
  isOpen: boolean
  onClose: () => void
  monthYear: string // e.g. "JUNE 2026"
  wornsThisMonth: number
  mostWornName: string
  mostWornBrand: string
  dominantPersonaId: string
  longestStreak: number
  unwornName: string | null
}

export default function NoseReportSheet({ isOpen, onClose, monthYear, wornsThisMonth, mostWornName, mostWornBrand, dominantPersonaId, longestStreak, unwornName }: Props) {
  const cardRef = useRef<HTMLDivElement>(null)
  const persona = dominantPersonaId ? getPersonaById(dominantPersonaId) : null
  const [downloading, setDownloading] = useState(false)

  async function handleDownload() {
    if (!cardRef.current) return
    setDownloading(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(cardRef.current, { backgroundColor: '#1A1208', scale: 2 })
      const link = document.createElement('a')
      link.download = `nose-report-${monthYear.toLowerCase().replace(' ', '-')}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (e) {
      console.error(e)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <Sheet open={isOpen} onClose={onClose}>
      <div
        ref={cardRef}
        style={{
          width: '100%',
          maxWidth: 375,
          margin: '0 auto',
          background: '#1A1208',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          padding: '0 24px',
          overflow: 'hidden',
          minHeight: 480
        }}
      >
        <div style={{ height: 2, width: '100%', background: 'var(--accent)' }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingTop: 32 }}>
          <p style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--accent)', margin: 0, fontWeight: 700 }}>
            YOUR NOSE, {monthYear}
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 40 }}>
            <div>
              <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 24, color: '#fff', margin: 0 }}>
                {wornsThisMonth} fragrances worn this month.
              </p>
            </div>
            
            <div>
              <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 24, color: '#fff', margin: 0 }}>
                Your most-worn: {mostWornName}.
              </p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 }}>
                {mostWornBrand}
              </p>
            </div>

            {persona && (
              <div>
                <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 24, color: '#fff', margin: 0 }}>
                  Your identity this month: {persona.name.replace('The ', '')}.
                </p>
              </div>
            )}

            <div>
              <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 24, color: '#fff', margin: 0 }}>
                Your longest streak: {longestStreak} days.
              </p>
            </div>

            {unwornName && (
              <div>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                  A fragrance you haven't worn yet:
                </p>
                <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 24, color: '#fff', margin: 0 }}>
                  {unwornName}.
                </p>
              </div>
            )}
          </div>
          
          <div style={{ flex: 1 }} />
          <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textAlign: 'right', paddingBottom: 16 }}>
            BaseNote
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 24 }}>
        <button
          onClick={handleDownload}
          disabled={downloading}
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--bg)',
            background: 'var(--accent)',
            border: 'none',
            borderRadius: 'var(--r-card)',
            padding: '14px',
            textAlign: 'center',
            cursor: downloading ? 'not-allowed' : 'pointer',
            opacity: downloading ? 0.7 : 1
          }}
        >
          {downloading ? 'Saving...' : 'Save as image →'}
        </button>
        <button
          onClick={onClose}
          style={{
            fontSize: 14,
            color: 'var(--text-muted)',
            background: 'transparent',
            border: 'none',
            padding: '14px',
            textAlign: 'center',
            cursor: 'pointer',
          }}
        >
          Dismiss
        </button>
      </div>
    </Sheet>
  )
}
