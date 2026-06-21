'use client'

import { useEffect, useState } from 'react'
import { getTheme, toggleTheme as toggleThemeFn } from '@/lib/theme'

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const current = getTheme()
    setTheme(current)
  }, [])

  const toggleTheme = () => {
    const newTheme = toggleThemeFn()
    setTheme(newTheme)
  }

  if (!mounted) return null

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'space-between', padding: '12px 0' }}>
      <p style={{ fontSize: 14, color: 'var(--text)' }}>Dark mode</p>
      <button
        onClick={toggleTheme}
        style={{
          background: theme === 'dark' ? 'var(--accent)' : 'var(--surface)',
          border: '1px solid var(--line)',
          width: 44,
          height: 24,
          borderRadius: '9999px',
          position: 'relative',
          cursor: 'pointer',
          transition: 'background 150ms',
        }}
        aria-label="Toggle dark mode"
      >
        <div
          style={{
            position: 'absolute',
            top: 2,
            left: theme === 'dark' ? 22 : 2,
            width: 20,
            height: 20,
            background: theme === 'dark' ? 'var(--bg)' : 'var(--text)',
            borderRadius: '50%',
            transition: 'left 150ms',
          }}
        />
      </button>
    </div>
  )
}
