import type { Metadata } from 'next'
import { cookies, headers } from 'next/headers'
import TracesClient from './TracesClient'
import type { Trace } from '@/components/traces/TraceCard'

const PAGE_SIZE = 20

export const metadata: Metadata = {
  title: 'Traces | nota.',
  description: 'Browse and write scent traces in nota. Capture what a fragrance actually smells like in plain language.',
}

async function getInitialTraces(): Promise<{ traces: Trace[]; hasMore: boolean }> {
  const headerList = await headers()
  const host = headerList.get('x-forwarded-host') ?? headerList.get('host')
  const protocol = headerList.get('x-forwarded-proto') ?? 'https'
  const base = host ? `${protocol}://${host}` : ''

  try {
    const res = await fetch(`${base}/api/traces?limit=${PAGE_SIZE}&offset=0`, { cache: 'no-store' })
    if (!res.ok) return { traces: [], hasMore: false }
    const json = await res.json()
    return { traces: json.traces ?? [], hasMore: Boolean(json.hasMore) }
  } catch {
    return { traces: [], hasMore: false }
  }
}

export default async function TracesPage() {
  // Reading cookieStore keeps this page dynamic (not statically cached) since
  // the feed content changes as traces are posted.
  await cookies()
  const { traces, hasMore } = await getInitialTraces()

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', color: 'var(--text)' }}>
      <div className="px-4 pt-6 pb-2">
        <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 28, color: 'var(--text)' }}>
          Traces
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6, lineHeight: '20px' }}>
          What does this smell like? Don&apos;t explain it. Describe it.
        </p>
      </div>

      <div className="px-4">
        <TracesClient initialTraces={traces} initialHasMore={hasMore} pageSize={PAGE_SIZE} />
      </div>
    </div>
  )
}
