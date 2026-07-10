'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NoseprintInkIcon, ReadInkIcon, ShelfInkIcon, TracesInkIcon, YouInkIcon } from '@/components/ui/InkIcons'
import { getRouteExperienceMeta } from '@/lib/experience'

type NavItem = {
  label: string
  href: string
  Icon: typeof ReadInkIcon
}

const NAV_ITEMS: NavItem[] = [
  { label: 'The Read', href: '/welcome', Icon: ReadInkIcon },
  { label: 'Identity', href: '/noseprint', Icon: NoseprintInkIcon },
  { label: 'Shelf', href: '/shelf', Icon: ShelfInkIcon },
  { label: 'Traces', href: '/traces', Icon: TracesInkIcon },
  { label: 'Archive', href: '/archive', Icon: YouInkIcon },
]

export default function BottomNav() {
  const pathname = usePathname()
  const [expanded, setExpanded] = useState(false)
  const routeMeta = useMemo(() => getRouteExperienceMeta(pathname), [pathname])

  useEffect(() => {
    setExpanded(false)
  }, [pathname])

  useEffect(() => {
    if (!expanded) return
    const timeout = window.setTimeout(() => setExpanded(false), 4200)
    return () => window.clearTimeout(timeout)
  }, [expanded])

  if (!routeMeta.shellVisible) return null

  const activeItem = NAV_ITEMS.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`)) ?? NAV_ITEMS[0]

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 pointer-events-none flex justify-center px-4"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}
    >
      <div
        className="pointer-events-auto surface-glass"
        style={{
          width: expanded ? 'min(92vw, 760px)' : 'min(92vw, 260px)',
          borderRadius: 999,
          padding: expanded ? '10px 12px' : '10px 14px',
          transition: 'width var(--motion-ceremonial), padding var(--motion-ceremonial), opacity var(--motion-responsive)',
          opacity: 0.98,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            aria-expanded={expanded}
            aria-label={expanded ? 'Collapse presence navigation' : 'Expand presence navigation'}
            style={{
              minWidth: expanded ? 170 : 0,
              flex: expanded ? '0 0 170px' : '1 1 auto',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 14px',
              borderRadius: 999,
              background: 'rgba(247, 244, 238, 0.08)',
              color: 'var(--text)',
              border: '1px solid rgba(229, 224, 214, 0.12)',
            }}
          >
            <activeItem.Icon size={20} />
            <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 0 }}>
              <span style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>nota.</span>
              <span style={{ fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{routeMeta.label}</span>
            </span>
          </button>

          <div
            aria-hidden={!expanded}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
              gap: expanded ? 8 : 0,
              flex: 1,
              overflow: 'hidden',
              maxWidth: expanded ? '100%' : 0,
              opacity: expanded ? 1 : 0,
              transition: 'max-width var(--motion-ceremonial), gap var(--motion-ceremonial), opacity var(--motion-responsive)',
            }}
          >
            {NAV_ITEMS.map(({ label, href, Icon }) => {
              const isActive = pathname === href || pathname.startsWith(`${href}/`)
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={isActive ? 'page' : undefined}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    justifyContent: 'center',
                    minHeight: 48,
                    borderRadius: 999,
                    padding: '10px 12px',
                    textDecoration: 'none',
                    background: isActive ? 'rgba(247, 244, 238, 0.12)' : 'transparent',
                    color: isActive ? 'var(--ivory)' : 'var(--text-muted)',
                    transition: 'background var(--motion-responsive), color var(--motion-responsive), transform var(--motion-responsive)',
                  }}
                >
                  <Icon size={18} />
                  <span style={{ fontSize: 12 }}>{label}</span>
                </Link>
              )
            })}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: expanded ? 8 : 6,
            opacity: expanded ? 1 : 0.78,
            transition: 'opacity var(--motion-responsive)',
          }}
        >
          <span style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            {routeMeta.dominantAction}
          </span>
          <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 14, color: 'var(--accent)' }}>
            {expanded ? 'presence open' : 'swipe the studio open'}
          </span>
        </div>
      </div>
    </div>
  )
}
