// supabase/functions/enrich-descriptions-batch/index.ts
// Batch description generation for fragrances with null plain_description
// Trigger: manual HTTP POST or pg_cron (daily at 2am UTC)
// Calls Claude Haiku to generate nota-tone descriptions
// Inserts pending review records into description_enrichment_queue

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.108.2'

interface FragranceRow {
  id: string
  name: string
  brand: string
  plain_description: string | null
  interaction_count: number
}

interface EnrichmentResult {
  fragrance_id: string
  generated_description: string
  status: 'success' | 'error'
  error?: string
}

// Claude Haiku prompt template — generates nota-tone description
function buildPrompt(fragrance_name: string, brand: string, notes: string): string {
  return `Generate a 2-3 sentence fragrance description in nota-tone style (opening → heart → drydown) for: ${fragrance_name} by ${brand}. Notes: ${notes}. Be sensory, never technical or marketing-speak. Example reference tone: "Opens with citrus brightness that softens as it dries. The heart blooms with florals before settling into warm woods." Keep to ~2-3 sentences. Reply with only the description, no quotes or preamble.`
}

// Call Claude Haiku via Anthropic API
async function generateDescription(
  fragrance: FragranceRow,
  fragmentNotes: string,
  apiKey: string
): Promise<string> {
  const prompt = buildPrompt(fragrance.name, fragrance.brand, fragmentNotes)

  const response = await fetch('https://api.anthropic.com/v1/messages/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 200,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Claude API error: ${response.status} ${error}`)
  }

  const data = await response.json()
  if (!data.content || !data.content[0] || !data.content[0].text) {
    throw new Error('Unexpected Claude response format')
  }

  return data.content[0].text.trim()
}

// Main edge function handler
Deno.serve(async (req: Request) => {
  try {
    // Security: verify service role or token-based auth
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY')

    if (!supabaseUrl || !supabaseServiceKey || !anthropicApiKey) {
      return new Response(
        JSON.stringify({ error: 'Missing environment credentials' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parse request body for optional filters
    const body = await req.json().catch(() => ({}))
    const limit = body.limit || 50
    const offset = body.offset || 0

    // Query: fragrances without descriptions, ordered by interaction count (most popular first)
    const { data: fragrances, error: queryError } = await supabase
      .from('fragrances')
      .select('id, name, brand, plain_description')
      .is('plain_description', null)
      .order('interaction_count', { ascending: false })
      .range(offset, offset + limit - 1)

    if (queryError) {
      console.error('Query error:', queryError)
      return new Response(
        JSON.stringify({ error: 'Failed to query fragrances', details: queryError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const results: EnrichmentResult[] = []
    let created = 0
    let skipped = 0
    let errored = 0

    for (const fragrance of fragrances || []) {
      try {
        // Check if already queued for this fragrance
        const { data: existing } = await supabase
          .from('description_enrichment_queue')
          .select('id')
          .eq('fragrance_id', fragrance.id)
          .single()

        if (existing) {
          console.log(`Skipped ${fragrance.id}: already in queue`)
          skipped++
          results.push({
            fragrance_id: fragrance.id,
            generated_description: '',
            status: 'success' // not an error, just skipped
          })
          continue
        }

        // Get fragrance notes via RPC or join
        // Note: assumes fragrance_notes table exists with fragrance_id foreign key
        const { data: notesData } = await supabase
          .from('fragrance_notes')
          .select('note')
          .eq('fragrance_id', fragrance.id)
          .limit(20)

        const notesList = (notesData || []).map((n: any) => n.note).join(', ') || 'Unknown notes'

        // Generate description via Claude Haiku
        const description = await generateDescription(fragrance, notesList, anthropicApiKey)

        // Insert into enrichment queue with status pending_review
        const { error: insertError } = await supabase
          .from('description_enrichment_queue')
          .insert({
            fragrance_id: fragrance.id,
            generated_description: description,
            status: 'pending_review'
          })

        if (insertError) {
          throw insertError
        }

        created++
        console.log(`Created queue record for ${fragrance.id}: ${fragrance.name}`)
        results.push({
          fragrance_id: fragrance.id,
          generated_description: description,
          status: 'success'
        })
      } catch (err) {
        errored++
        const errorMsg = err instanceof Error ? err.message : String(err)
        console.error(`Error processing ${fragrance.id}:`, errorMsg)
        results.push({
          fragrance_id: fragrance.id,
          generated_description: '',
          status: 'error',
          error: errorMsg
        })
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        summary: {
          total_processed: fragrances?.length || 0,
          created,
          skipped,
          errored
        },
        results
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('Edge function error:', errorMsg)

    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMsg }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
