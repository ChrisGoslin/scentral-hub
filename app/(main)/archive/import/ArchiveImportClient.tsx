'use client'

import Link from 'next/link'
import { useMemo, useState, useTransition } from 'react'
import Button from '@/components/ui/Button'

type PreviewOutcome = 'exact' | 'likely' | 'ambiguous' | 'unmatched'

type PreviewCandidate = {
  id: string
  brand: string
  name: string
  score: number
  reason: string
}

type PreviewRow = {
  sourceRow: number
  brand: string
  name: string
  fullName: string
  source: {
    headers: string[]
    values: string[]
  }
  status: string
  rating: number | null
  notes: string
}

type PreviewResult = {
  row: PreviewRow
  outcome: PreviewOutcome
  selectedFragranceId: string | null
  candidates: PreviewCandidate[]
}

type PreviewResponse = {
  summary: Record<PreviewOutcome | 'total', number>
  results: PreviewResult[]
  limits: {
    maxBytes: number
    maxRows: number
  }
}

const OUTCOME_ORDER: PreviewOutcome[] = ['exact', 'likely', 'ambiguous', 'unmatched']
const OUTCOME_LABELS: Record<PreviewOutcome, string> = {
  exact: 'Exact matches',
  likely: 'Likely matches',
  ambiguous: 'Needs review',
  unmatched: 'No match yet',
}

export default function ArchiveImportClient() {
  const [input, setInput] = useState('')
  const [fileName, setFileName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<PreviewResponse | null>(null)
  const [isPending, startTransition] = useTransition()

  const groupedResults = useMemo(() => {
    if (!preview) return []
    return OUTCOME_ORDER.map((outcome) => ({
      outcome,
      items: preview.results.filter((result) => result.outcome === outcome),
    })).filter((group) => group.items.length > 0)
  }, [preview])

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      setFileName(file.name)
      setInput(text)
      setError(null)
      setPreview(null)
    } catch {
      setError('That file could not be read. Try a plain CSV or tab-separated export.')
    }
  }

  function handlePreview() {
    startTransition(async () => {
      setError(null)
      setPreview(null)

      try {
        const response = await fetch('/api/portability/preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: input }),
        })

        const data = await response.json()
        if (!response.ok) {
          throw new Error(typeof data?.error === 'string' ? data.error : 'Preview failed.')
        }

        setPreview(data as PreviewResponse)
      } catch (nextError) {
        setError(nextError instanceof Error ? nextError.message : 'Preview failed.')
      }
    })
  }

  return (
    <div
      style={{
        background: 'var(--bg)',
        minHeight: '100dvh',
        color: 'var(--text)',
        paddingTop: 'calc(44px + env(safe-area-inset-top, 0px))',
      }}
    >
      <div className="px-4 pt-8 pb-4" style={{ borderBottom: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'grid', gap: 6 }}>
            <p style={{ margin: 0, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Archive import
            </p>
            <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 32, lineHeight: '38px' }}>
              Bring your history in carefully.
            </h1>
            <p style={{ margin: 0, maxWidth: 680, fontSize: 14, lineHeight: '22px', color: 'var(--text-muted)' }}>
              Paste a list or upload a CSV or TSV export. This post-onboarding step only previews matches. Nothing is written to your account.
            </p>
          </div>
          <Link href="/archive" style={{ color: 'var(--accent)', fontSize: 13, fontWeight: 600 }}>
            Back to Archive
          </Link>
        </div>
      </div>

      <div className="px-4 py-6" style={{ display: 'grid', gap: 20 }}>
        <section
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--line)',
            borderRadius: 20,
            padding: 20,
            display: 'grid',
            gap: 16,
          }}
        >
          <div style={{ display: 'grid', gap: 8 }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Source data
            </p>
            <p style={{ margin: 0, fontSize: 14, lineHeight: '22px', color: 'var(--text-muted)' }}>
              Best inputs: customer-controlled CSV, tab-separated text, or a pasted collection list with brand and fragrance names.
            </p>
          </div>

          <div style={{ display: 'grid', gap: 10 }}>
            <label
              htmlFor="archive-import-file"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 48,
                padding: '0 18px',
                borderRadius: 'var(--r-btn)',
                border: '1px solid color-mix(in srgb, var(--line) 75%, transparent)',
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: '0.04em',
                cursor: 'pointer',
                width: 'fit-content',
              }}
            >
              {fileName ? `Loaded ${fileName}` : 'Load CSV or TSV'}
            </label>
            <input
              id="archive-import-file"
              type="file"
              accept=".csv,.tsv,text/csv,text/plain,text/tab-separated-values"
              onChange={handleFileChange}
              style={{
                position: 'absolute',
                width: 1,
                height: 1,
                padding: 0,
                margin: -1,
                overflow: 'hidden',
                clip: 'rect(0, 0, 0, 0)',
                whiteSpace: 'nowrap',
                border: 0,
              }}
            />

            <label
              htmlFor="archive-import-text"
              style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}
            >
              Import source text
            </label>

            <textarea
              id="archive-import-text"
              aria-label="Import source text"
              value={input}
              onChange={(event) => {
                setInput(event.target.value)
                setPreview(null)
                setError(null)
              }}
              placeholder={'brand,name,status,rating,notes\nDior,Sauvage,Owned,4,Easy daily wear'}
              style={{
                width: '100%',
                minHeight: 260,
                resize: 'vertical',
                borderRadius: 16,
                border: '1px solid var(--line)',
                background: 'var(--bg)',
                color: 'var(--text)',
                padding: 16,
                lineHeight: 1.5,
                fontSize: 14,
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <Button onClick={handlePreview} disabled={isPending || input.trim().length === 0}>
              {isPending ? 'Previewing…' : 'Preview import'}
            </Button>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>
              Review only. No database writes happen on this step.
            </p>
          </div>

          {error ? (
            <div
              role="alert"
              style={{
                padding: '12px 14px',
                borderRadius: 14,
                border: '1px solid color-mix(in srgb, var(--color-error) 55%, transparent)',
                background: 'color-mix(in srgb, var(--color-error) 8%, transparent)',
                color: 'var(--color-error)',
                fontSize: 13,
              }}
            >
              {error}
            </div>
          ) : null}
        </section>

        {preview ? (
          <>
            <section
              aria-label="Import preview summary"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: 12,
              }}
            >
              {OUTCOME_ORDER.map((outcome) => (
                <div
                  key={outcome}
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--line)',
                    borderRadius: 18,
                    padding: 16,
                    display: 'grid',
                    gap: 6,
                  }}
                >
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
                    {OUTCOME_LABELS[outcome]}
                  </p>
                  <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 28 }}>
                    {preview.summary[outcome]}
                  </p>
                </div>
              ))}
            </section>

            {groupedResults.map((group) => (
              <section
                key={group.outcome}
                aria-label={OUTCOME_LABELS[group.outcome]}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--line)',
                  borderRadius: 20,
                  padding: 20,
                  display: 'grid',
                  gap: 16,
                }}
              >
                <div style={{ display: 'grid', gap: 4 }}>
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
                    {OUTCOME_LABELS[group.outcome]}
                  </p>
                  <p style={{ margin: 0, fontSize: 14, lineHeight: '22px', color: 'var(--text-muted)' }}>
                    {group.outcome === 'exact' ? 'Unique exact matches can be preselected later.' : null}
                    {group.outcome === 'likely' ? 'Close matches still need your review before any write step exists.' : null}
                    {group.outcome === 'ambiguous' ? 'Multiple candidates need a human choice.' : null}
                    {group.outcome === 'unmatched' ? 'These rows need a manual search or a better export shape.' : null}
                  </p>
                </div>

                <div style={{ display: 'grid', gap: 12 }}>
                  {group.items.map((result) => (
                    <article
                      key={`${result.row.sourceRow}-${result.row.fullName}`}
                      style={{
                        borderRadius: 16,
                        border: '1px solid color-mix(in srgb, var(--line) 80%, transparent)',
                        padding: 16,
                        background: 'color-mix(in srgb, var(--surface) 70%, transparent)',
                        display: 'grid',
                        gap: 10,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'start', flexWrap: 'wrap' }}>
                        <div style={{ display: 'grid', gap: 4 }}>
                          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>
                            Source row {result.row.sourceRow}
                          </p>
                          <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 22, lineHeight: '28px' }}>
                            {result.row.fullName}
                          </h2>
                          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
                            {result.row.status ? `Status: ${result.row.status}` : 'No status supplied'}
                            {result.row.rating ? ` · Rating: ${result.row.rating}` : ''}
                          </p>
                        </div>
                        <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: 'var(--accent)' }}>
                          {result.outcome.toUpperCase()}
                        </p>
                      </div>

                      {result.row.notes ? (
                        <p style={{ margin: 0, fontSize: 13, lineHeight: '21px', color: 'var(--text-muted)' }}>
                          “{result.row.notes}”
                        </p>
                      ) : null}

                      <div style={{ display: 'grid', gap: 4 }}>
                        <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                          Source values kept for review
                        </p>
                        <p style={{ margin: 0, fontSize: 12, lineHeight: '19px', color: 'var(--text-muted)' }}>
                          {result.row.source.headers.map((header, index) => `${header}: ${result.row.source.values[index] ?? ''}`).join(' · ')}
                        </p>
                      </div>

                      {result.candidates.length > 0 ? (
                        <div style={{ display: 'grid', gap: 8 }}>
                          {result.candidates.map((candidate) => (
                            <div
                              key={candidate.id}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                gap: 12,
                                flexWrap: 'wrap',
                                paddingTop: 8,
                                borderTop: '1px solid color-mix(in srgb, var(--line) 65%, transparent)',
                              }}
                            >
                              <div style={{ display: 'grid', gap: 2 }}>
                                <p style={{ margin: 0, fontSize: 14, color: 'var(--text)' }}>
                                  {candidate.brand} {candidate.name}
                                </p>
                                <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>{candidate.reason}</p>
                              </div>
                              <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>
                                {Math.round(candidate.score * 100)}% match
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </>
        ) : null}
      </div>
    </div>
  )
}
