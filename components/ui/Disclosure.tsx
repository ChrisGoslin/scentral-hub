import React from 'react'
import { Info } from 'lucide-react'

interface DisclosureProps {
  text: string
}

export default function Disclosure({ text }: DisclosureProps) {
  return (
    <div className="flex items-center gap-1.5">
      <Info size={12} strokeWidth={1.75} style={{ color: 'var(--text-muted)', flexShrink: 0 }} aria-hidden="true" />
      <p style={{ fontSize: 13, lineHeight: '18px', color: 'var(--text-muted)' }}>{text}</p>
    </div>
  )
}
