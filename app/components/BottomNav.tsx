'use client'

import { useSyncExternalStore } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NoseprintInkIcon, ReadInkIcon, ShelfInkIcon, TracesInkIcon, YouInkIcon } from '@/components/ui/InkIcons'

const NAV_ITEMS = [
  { label: 'Read',      href: '/read',      Icon: ReadInkIcon },
  { label: 'Noseprint', href: '/noseprint', Icon: NoseprintInkIcon },
  { label: 'My Shelf',  href: '/shelf',     Icon: ShelfInkIcon },
  { label: 'Traces',    href: '/traces',    Icon: TracesInkIcon },
  { label: 'You',       href: '/you',       Icon: YouInkIcon },
]

export default function BottomNav() {
  const pathname = usePathname()
  const isStandalone = useSyncExternalStore(
    (onStoreChange) => {
      const media = window.matchMedia('(display-mode: standalone)')
      media.addEventListener('change', onStoreChange)
      return () => media.removeEventListener('change', onStoreChange)
    },
    () => window.matchMedia('(display-mode: standalone)').matches,
    () => false
  )

  const currentNavItem = NAV_ITEMS.find(item => 
    pathname === item.href || pathname.startsWith(`${item.href}/`)
  )
  const pageTitle = currentNavItem ? currentNavItem.label : 'nota.'

  return (
    <>
      {!isStandalone && (
        <header
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center px-4 safe-top"
          style={{
            height: '44px',
            background: 'color-mix(in srgb, var(--surface) 88%, transparent)',
            borderBottom: '1px solid color-mix(in srgb, var(--line) 76%, transparent)',
            backdropFilter: 'blur(18px) saturate(1.4)',
            WebkitBackdropFilter: 'blur(18px) saturate(1.4)',
          }}
        >
          <h1 style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.28em',
            color: 'var(--text)'
          }}>
            {pageTitle}
          </h1>
        </header>
      )}

      <nav
        className="fixed bottom-0 left-0 right-0 z-50"
        style={{
          background: 'color-mix(in srgb, var(--surface) 88%, transparent)',
          borderTop: '1px solid color-mix(in srgb, var(--line) 76%, transparent)',
          backdropFilter: 'blur(20px) saturate(1.3)',
          WebkitBackdropFilter: 'blur(20px) saturate(1.3)',
          paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))',
          opacity: isStandalone ? 1 : 0.85,
        }}
      >
        <div
          className="mx-auto grid h-14 max-w-md items-center"
          style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}
        >
          {NAV_ITEMS.map(({ label, href, Icon }) => {
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
                  color={isActive ? 'var(--accent)' : 'var(--text-muted)'}
                  style={{
                    transform: isActive ? 'scale(1.08) rotate(-2deg)' : 'scale(1)',
                    transition: `color var(--motion-fast), transform var(--motion-fast), opacity var(--motion-fast)`,
                    opacity: isActive ? 1 : 0.85,
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
