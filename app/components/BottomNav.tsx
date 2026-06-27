'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Archive, FlaskConical, Compass, Droplets, User } from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Discover', href: '/discover',   Icon: Compass },
  { label: 'Wardrobe', href: '/collection', Icon: Archive },
  { label: 'Lab',      href: '/layering',   Icon: FlaskConical },
  { label: 'Brief',    href: '/spritz',     Icon: Droplets },
  { label: 'Identity', href: '/you',        Icon: User },
]

export default function BottomNav() {
  const pathname = usePathname()
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches)
  }, [])

  const currentNavItem = NAV_ITEMS.find(item => 
    pathname === item.href || pathname.startsWith(`${item.href}/`)
  )
  const pageTitle = currentNavItem ? currentNavItem.label : 'BaseNote'

  return (
    <>
      {!isStandalone && (
        <header
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center px-4 safe-top"
          style={{
            height: '44px',
            background: 'var(--surface)',
            borderBottom: '1px solid var(--line)',
          }}
        >
          <h1 style={{
            fontSize: 11,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            color: 'var(--text)'
          }}>
            {pageTitle}
          </h1>
        </header>
      )}

      <nav
        className="fixed bottom-0 left-0 right-0 z-50"
        style={{
          background: 'var(--surface)',
          borderTop: '1px solid var(--line)',
          paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))',
          opacity: isStandalone ? 1 : 0.85,
        }}
      >
        <div
          className="mx-auto grid h-14 max-w-md items-center"
          style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}
        >
          {NAV_ITEMS.map(({ label, href, Icon }) => {
            // detail pages correctly keep My Bottles active
            const isActive = pathname === href || pathname.startsWith(`${href}/`)
            return (
              <Link
                key={label}
                href={href}
                className="flex flex-col items-center justify-center gap-0.5 py-1 min-h-[44px]"
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon
                  size={22}
                  strokeWidth={1.75}
                  fill={isActive ? 'var(--accent)' : 'none'}
                  color={isActive ? 'var(--accent)' : 'var(--text-muted)'}
                  style={{
                    transform: isActive ? 'scale(1.12)' : 'scale(1)',
                    transition: `color var(--motion-fast), fill var(--motion-fast), transform var(--motion-fast)`,
                  }}
                />
                <span
                  style={{
                    fontSize: 10,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    fontWeight: 700,
                    color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                    transition: `color var(--motion-fast)`,
                    textAlign: 'center',
                  }}
                >
                  {label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
