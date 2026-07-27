import { NextRequest, NextResponse } from 'next/server'
import { previewImportMatches } from '@/lib/portability/preview'
import {
  PORTABILITY_PREVIEW_LIMITS,
  buildPortabilityPreviewRequest,
  sanitizePreviewSearchTerm,
  validatePortabilityPreviewContentLength,
} from '@/lib/security/portability-preview'
import { enforce, makeLimiter } from '@/lib/rate-limit'
import { createClient } from '@/utils/supabase/server'

const CANDIDATE_LIMIT = 8
const portabilityPreviewLimiter = makeLimiter('portability-preview', 10, '1 m')

async function fetchCandidatesForRow(
  supabase: Awaited<ReturnType<typeof createClient>>,
  row: { brand: string; name: string; fullName: string },
) {
  const brand = sanitizePreviewSearchTerm(row.brand)
  const name = sanitizePreviewSearchTerm(row.name)
  const fullName = sanitizePreviewSearchTerm(row.fullName)

  const clauses = [
    brand ? `brand.ilike.%${brand}%` : null,
    name ? `name.ilike.%${name}%` : null,
    fullName ? `name.ilike.%${fullName}%` : null,
  ].filter(Boolean)

  if (!clauses.length) return []

  const { data, error } = await supabase
    .from('fragrances')
    .select('id, brand, name')
    .or(clauses.join(','))
    .limit(CANDIDATE_LIMIT)

  if (error) throw error
  return data ?? []
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') ?? ''
    if (!contentType.includes('application/json')) {
      return NextResponse.json({ error: 'Send the preview as JSON text.' }, { status: 415 })
    }

    const contentLength = validatePortabilityPreviewContentLength(request.headers.get('content-length'))
    if (!contentLength.ok) {
      return NextResponse.json({ error: contentLength.error }, { status: 413 })
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Please sign in to preview an import.' }, { status: 401 })
    }

    if (!(await enforce(portabilityPreviewLimiter, user.id))) {
      return NextResponse.json({ error: 'Too many import previews. Try again in a minute.' }, { status: 429 })
    }

    const body = await request.json()
    const previewRequest = buildPortabilityPreviewRequest(body)

    if (!previewRequest.ok || !previewRequest.value) {
      return NextResponse.json({ error: previewRequest.error }, { status: 400 })
    }

    const candidateLists = await Promise.all(
      previewRequest.value.rows.map((row) => fetchCandidatesForRow(supabase, row)),
    )

    const catalogue = new Map<string, { id: string; brand: string; name: string }>()
    candidateLists.flat().forEach((candidate) => {
      if (typeof candidate?.id === 'string') {
        catalogue.set(candidate.id, {
          id: candidate.id,
          brand: typeof candidate.brand === 'string' ? candidate.brand : '',
          name: typeof candidate.name === 'string' ? candidate.name : '',
        })
      }
    })

    const preview = previewImportMatches(previewRequest.value.rows, [...catalogue.values()])

    return NextResponse.json({
      ...preview,
      limits: PORTABILITY_PREVIEW_LIMITS,
      scope: 'post-onboarding archive preview only',
    })
  } catch (error) {
    console.error('Portability preview failed:', error)
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'The preview payload was not valid.' }, { status: 400 })
    }
    return NextResponse.json({ error: 'We could not preview that import.' }, { status: 500 })
  }
}
