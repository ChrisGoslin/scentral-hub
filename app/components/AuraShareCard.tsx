'use client'

import { useRef, useState } from 'react'
import { Share2, Download, Check } from 'lucide-react'

export type AuraShareData = {
  anchor: { brand: string; name: string; phase: number }
  top: { brand: string; name: string; phase: number }
  harmony_pct: number
  use_case: string
  weather?: { temp_c: number; condition: string; city?: string }
  aura_description: string
}

function drawCard(canvas: HTMLCanvasElement, data: AuraShareData) {
  const W = 1080
  const H = 1920
  canvas.width = W
  canvas.height = H

  const ctx = canvas.getContext('2d')!

  // Background
  ctx.fillStyle = '#06070a'
  ctx.fillRect(0, 0, W, H)

  // Subtle grain overlay via noise pattern
  ctx.globalAlpha = 0.03
  for (let i = 0; i < W * H * 0.1; i++) {
    const x = Math.random() * W
    const y = Math.random() * H
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(x, y, 1, 1)
  }
  ctx.globalAlpha = 1

  // Top accent line
  const grad = ctx.createLinearGradient(0, 0, W, 0)
  grad.addColorStop(0, 'transparent')
  grad.addColorStop(0.5, '#B8913A') /* Parfumeur's Gold — hardcoded: canvas context, CSS vars unavailable */
  grad.addColorStop(1, 'transparent')
  ctx.strokeStyle = grad
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(0, 180)
  ctx.lineTo(W, 180)
  ctx.stroke()

  // nota. wordmark
  ctx.fillStyle = '#B8913A' /* Parfumeur's Gold — hardcoded: canvas context, CSS vars unavailable */
  ctx.font = '600 48px serif'
  ctx.letterSpacing = '0.3em'
  ctx.textAlign = 'center'
  ctx.fillText('NOTA.', W / 2, 140)

  // AURA badge
  ctx.fillStyle = 'rgba(196,154,60,0.12)'
  const badgeW = 280
  const badgeH = 52
  const badgeX = (W - badgeW) / 2
  roundRect(ctx, badgeX, 220, badgeW, badgeH, 26)
  ctx.fill()
  ctx.strokeStyle = 'rgba(196,154,60,0.4)'
  ctx.lineWidth = 1
  ctx.stroke()
  ctx.fillStyle = '#c49a3c'
  ctx.font = '700 22px sans-serif'
  ctx.letterSpacing = '0.2em'
  ctx.textAlign = 'center'
  ctx.fillText('AURA SYNTHESIS', W / 2, 254)

  // Weather + context
  if (data.weather) {
    const weatherLine = [
      `${Math.round(data.weather.temp_c)}°C`,
      data.weather.condition,
      data.weather.city,
    ].filter(Boolean).join(' · ')
    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.font = '300 30px sans-serif'
    ctx.letterSpacing = '0.05em'
    ctx.textAlign = 'center'
    ctx.fillText(weatherLine.toUpperCase(), W / 2, 340)
  }

  ctx.fillStyle = 'rgba(255,255,255,0.25)'
  ctx.font = '300 28px sans-serif'
  ctx.letterSpacing = '0.08em'
  ctx.textAlign = 'center'
  ctx.fillText(data.use_case.toUpperCase(), W / 2, 390)

  // Harmony ring
  const ringCX = W / 2
  const ringCY = 680
  const ringR = 220

  // Outer ring
  ctx.strokeStyle = 'rgba(255,255,255,0.06)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(ringCX, ringCY, ringR, 0, Math.PI * 2)
  ctx.stroke()

  // Progress arc
  const pct = data.harmony_pct / 100
  const startAngle = -Math.PI / 2
  const endAngle = startAngle + pct * Math.PI * 2
  const arcGrad = ctx.createLinearGradient(ringCX - ringR, ringCY, ringCX + ringR, ringCY)
  arcGrad.addColorStop(0, '#c49a3c')
  arcGrad.addColorStop(1, '#f0c060')
  ctx.strokeStyle = arcGrad
  ctx.lineWidth = 6
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.arc(ringCX, ringCY, ringR, startAngle, endAngle)
  ctx.stroke()

  // Harmony number
  ctx.fillStyle = '#ffffff'
  ctx.font = `700 160px serif`
  ctx.textAlign = 'center'
  ctx.letterSpacing = '-0.02em'
  ctx.fillText(`${data.harmony_pct}`, ringCX, ringCY + 56)

  ctx.fillStyle = '#c49a3c'
  ctx.font = '600 32px sans-serif'
  ctx.letterSpacing = '0.2em'
  ctx.textAlign = 'center'
  ctx.fillText('HARMONY', ringCX, ringCY + 104)

  // Divider
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(120, 920)
  ctx.lineTo(W - 120, 920)
  ctx.stroke()

  // Fragrance cards
  const cardY = 960
  const cardH = 200
  const cardW = (W - 180) / 2
  const card1X = 60
  const card2X = W / 2 + 30

  // Anchor card
  drawFragCard(ctx, card1X, cardY, cardW, cardH, 'ANCHOR', data.anchor.brand, data.anchor.name)
  // Top card
  drawFragCard(ctx, card2X, cardY, cardW, cardH, 'TOP LAYER', data.top.brand, data.top.name)

  // AURA description
  ctx.fillStyle = 'rgba(255,255,255,0.45)'
  ctx.font = 'italic 300 30px serif'
  ctx.letterSpacing = '0.01em'
  ctx.textAlign = 'center'
  const desc = data.aura_description.length > 100
    ? data.aura_description.slice(0, 97) + '…'
    : data.aura_description
  wrapText(ctx, desc, W / 2, 1280, W - 180, 42)

  // Bottom line
  ctx.strokeStyle = grad
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(0, 1740)
  ctx.lineTo(W, 1740)
  ctx.stroke()

  // URL
  ctx.fillStyle = 'rgba(255,255,255,0.25)'
  ctx.font = '300 26px sans-serif'
  ctx.letterSpacing = '0.15em'
  ctx.textAlign = 'center'
  ctx.fillText('NOTA.APP', W / 2, 1800)
}

function drawFragCard(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  role: string, brand: string, name: string
) {
  ctx.fillStyle = 'rgba(255,255,255,0.04)'
  roundRect(ctx, x, y, w, h, 12)
  ctx.fill()
  ctx.strokeStyle = 'rgba(196,154,60,0.3)'
  ctx.lineWidth = 1
  ctx.stroke()

  ctx.fillStyle = '#c49a3c'
  ctx.font = '700 20px sans-serif'
  ctx.letterSpacing = '0.15em'
  ctx.textAlign = 'center'
  ctx.fillText(role, x + w / 2, y + 42)

  ctx.fillStyle = 'rgba(255,255,255,0.45)'
  ctx.font = '300 22px sans-serif'
  ctx.letterSpacing = '0.05em'
  ctx.textAlign = 'center'
  ctx.fillText(brand.toUpperCase(), x + w / 2, y + 80)

  ctx.fillStyle = '#ffffff'
  ctx.font = 'italic 500 30px serif'
  ctx.letterSpacing = '0.01em'
  ctx.textAlign = 'center'
  wrapText(ctx, name, x + w / 2, y + 118, w - 20, 36)
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string, x: number, y: number,
  maxW: number, lineH: number
) {
  const words = text.split(' ')
  let line = ''
  let currentY = y

  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, currentY)
      line = word
      currentY += lineH
    } else {
      line = test
    }
  }
  ctx.fillText(line, x, currentY)
}

export default function AuraShareCard({ data }: { data: AuraShareData }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [rendered, setRendered] = useState(false)
  const [copied, setCopied] = useState(false)

  function render() {
    if (!canvasRef.current) return
    drawCard(canvasRef.current, data)
    setRendered(true)
  }

  function download() {
    if (!canvasRef.current) return
    const link = document.createElement('a')
    link.download = `scentral-aura-${data.harmony_pct}pct.png`
    link.href = canvasRef.current.toDataURL('image/png')
    link.click()
  }

  async function share() {
    if (!canvasRef.current) return
    canvasRef.current.toBlob(async (blob) => {
      if (!blob) return
      const file = new File([blob], 'scentral-aura.png', { type: 'image/png' })
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `AURA · ${data.harmony_pct}% Harmony`,
          text: `${data.anchor.name} × ${data.top.name} — synthesised by AURA on nota.`,
        })
      } else {
        download()
      }
    }, 'image/png')
  }

  async function copyLink() {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Preview (hidden canvas, scaled display) */}
      <canvas
        ref={canvasRef}
        style={{
          display: rendered ? 'block' : 'none',
          width: '100%',
          borderRadius: 'var(--r-card)',
          border: '1px solid var(--line)',
        }}
      />

      {!rendered ? (
        <button
          onClick={render}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-[var(--r-btn)] transition-all"
          style={{ background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text)', fontSize: 13, fontWeight: 700 }}
        >
          <Share2 size={14} />
          Generate Share Card
        </button>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={share}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-[var(--r-btn)] transition-all"
            style={{ background: 'var(--accent)', color: 'white', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}
          >
            <Share2 size={13} />
            Share
          </button>
          <button
            onClick={download}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-[var(--r-btn)] transition-all"
            style={{ background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text-muted)' }}
          >
            <Download size={14} />
          </button>
          <button
            onClick={copyLink}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-[var(--r-btn)] transition-all"
            style={{ background: 'var(--surface)', border: '1px solid var(--line)', color: copied ? 'var(--positive)' : 'var(--text-muted)' }}
          >
            {copied ? <Check size={14} /> : <span style={{ fontSize: 11 }}>Link</span>}
          </button>
        </div>
      )}
    </div>
  )
}
