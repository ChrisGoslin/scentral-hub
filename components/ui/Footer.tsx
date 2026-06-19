import React from 'react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer
      style={{
        width: '100%',
        padding: '24px',
        textAlign: 'center',
        boxSizing: 'border-box',
        marginTop: 'auto',
      }}
    >
      <p
        style={{
          fontSize: 11,
          color: 'var(--text-muted)',
        }}
      >
        <Link href="/privacy" style={{ textDecoration: 'none', color: 'inherit' }}>Privacy</Link>
        {' · '}
        <Link href="/terms" style={{ textDecoration: 'none', color: 'inherit' }}>Terms</Link>
      </p>
    </footer>
  )
}
