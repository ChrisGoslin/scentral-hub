'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Archive, FlaskConical, Calendar, User } from 'lucide-react'

const NAV_ITEMS = [
  { label: 'The Wardrobe', href: '/collection', Icon: Archive },
  { label: 'The Atelier', href: '/layering',   Icon: FlaskConical },
  { label: 'The Ritual',   href: '/schedule',   Icon: Calendar },
  { label: 'The You',      href: '/you',        Icon: User },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: 'var(--surface)',
        borderTop: '1px solid var(--line)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div
        className="mx-auto grid h-14 max-w-md items-center"
        style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}
      >
        {NAV_ITEMS.map(({ label, href, Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`)
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center gap-0.5 py-1 min-h-[44px]"
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                size={22}
                strokeWidth={1.75}
                fill={isActive ? 'var(--accent)' : 'none'}
                color={isActive ? 'var(--accent)' : 'var(--text-muted)'}
                style={{ transition: `color var(--motion-fast), fill var(--motion-fast)` }}
              />
              <span
                style={{
                  fontSize: 8,
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
  )
}
