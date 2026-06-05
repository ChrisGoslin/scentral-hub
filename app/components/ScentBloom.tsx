"use client"
import React, { useRef, useEffect } from 'react'

export default function ScentBloom({ children }: { children: React.ReactNode }) {
  const el = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const node = el.current
    if (!node) return

    function onMove(e: PointerEvent) {
      if (!node) return
      const rect = node.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      node.style.setProperty('--pointer-x', `${x}px`)
      node.style.setProperty('--pointer-y', `${y}px`)
      const tx = (x - rect.width / 2) / 24
      const ty = (y - rect.height / 2) / 24
      node.style.setProperty('--tilt-x', `${ty}px`)
      node.style.setProperty('--tilt-y', `${-tx}px`)
      // Emit a global event so other UX systems (audio) can react without tight coupling
      try {
        window.dispatchEvent(new CustomEvent('scent:move', { detail: { x, y } }))
      } catch (err) {
        // ignore in non-browser environments
      }
    }

    function onLeave() {
      if (!node) return
      node.style.setProperty('--pointer-x', `50%`)
      node.style.setProperty('--pointer-y', `50%`)
      node.style.setProperty('--tilt-x', `0px`)
      node.style.setProperty('--tilt-y', `0px`)
    }

    node.addEventListener('pointermove', onMove)
    node.addEventListener('pointerleave', onLeave)
    node.addEventListener('pointercancel', onLeave)

    return () => {
      node.removeEventListener('pointermove', onMove)
      node.removeEventListener('pointerleave', onLeave)
      node.removeEventListener('pointercancel', onLeave)
    }
  }, [])

  return (
    <div ref={el} className="scent-bloom relative overflow-hidden rounded-3xl">
      {children}
      <div aria-hidden className="pointer-events-none scent-bloom-overlay" />
    </div>
  )
}
