import LoadingShimmer from '@/components/ui/LoadingShimmer'

export default function YouLoading() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div className="px-4 pt-8 pb-4" style={{ borderBottom: '1px solid var(--line)' }}>
        <div style={{ height: 34, width: 60, borderRadius: 6, background: 'var(--surface-2)' }} aria-hidden="true" />
      </div>
      <div className="px-4 py-6 flex flex-col gap-4">
        <LoadingShimmer variant="line" />
        <LoadingShimmer variant="card" count={3} />
      </div>
    </div>
  )
}
