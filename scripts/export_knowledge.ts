#!/usr/bin/env -S npx tsx
// Export fragrance_facts / layering_patterns into NotebookLM-ready docs.
// Usage:
//   npx tsx scripts/export_knowledge.ts --target=wardrobe   (MASTER_WARDROBE.md + WARDROBE_INDEX.json)
//   npx tsx scripts/export_knowledge.ts --target=layering   (LAYERING_PATTERNS.md + WARDROBE_INDEX.json)
//   npx tsx scripts/export_knowledge.ts                     (both, default)
//
// Output lands in data/fragrance/canonical/ — the same folder the ingest
// pipeline drains processed source files into, so the whole knowledge base
// (sources + generated docs) is one NotebookLM notebook.
//
// Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_KEY in .env.local.
//
// Note: this does NOT touch the existing hand-curated docs/MASTER_WARDROBE.md
// — that file predates this pipeline. Output here is a separate,
// script-generated artifact so nothing curated gets silently overwritten.

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { writeFileSync } from 'fs'
import { join } from 'path'

dotenv.config({ path: '.env.local' })

const target = (process.argv.find((a) => a.startsWith('--target='))?.split('=')[1] ?? 'all') as
  | 'wardrobe'
  | 'layering'
  | 'all'

for (const key of ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_KEY']) {
  if (!process.env[key]) {
    console.error(`Missing ${key} in .env.local`)
    process.exit(1)
  }
}

const OUT_DIR = join(process.cwd(), 'data/fragrance/canonical')
const INDEX_PATH = join(OUT_DIR, 'WARDROBE_INDEX.json')
const ROLE_LABELS: Record<string, string> = {
  anchor: 'Anchor (base-heavy — foundation + longevity)',
  modulator: 'Modulator (heart-heavy — complexity + texture)',
  top: 'Top (volatile/fresh — opening + radiance)',
}

interface FragranceFactRow {
  brand: string | null
  name: string
  source_file: string
  top_notes: string[] | null
  heart_notes: string[] | null
  base_notes: string[] | null
  accord_families: string[] | null
  role: 'anchor' | 'modulator' | 'top' | null
}

interface LayeringPatternRow {
  pattern_name: string
  source_file: string
  fragrance_names: string[]
  roles: string[] | null
  use_case: string | null
  rationale: string | null
}

function createSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
  )
}

// Supabase's Data API caps a single select at its configured max rows
// (1,000 by default) with no error — an unpaginated select silently
// returns only the first page once the tables grow past that, and the
// generated exports would look complete while missing everything after.
const PAGE_SIZE = 1000

async function fetchFacts(supabase: SupabaseClient): Promise<FragranceFactRow[]> {
  const rows: FragranceFactRow[] = []
  let page = 0
  for (;;) {
    // role/brand are frequently tied (esp. both null) — .range() pagination
    // over a non-unique order can return the same row on two pages while
    // dropping another, since Postgres doesn't guarantee stable ordering
    // among ties across separate queries. id is the primary key, so it's
    // always unique and breaks every tie.
    // Explicit projection, not select('*'): the table also has raw_text
    // (the full original source, stored per row) and enriched (the raw LLM
    // extraction JSON) — every extracted item repeats that source text, so
    // pulling them into WARDROBE_INDEX.json balloons it far beyond the
    // structured catalogue this export is meant to produce.
    const { data, error } = await supabase
      .from('fragrance_facts')
      .select('id, brand, name, source_file, top_notes, heart_notes, base_notes, accord_families, role')
      .order('role', { ascending: true })
      .order('brand', { ascending: true })
      .order('id', { ascending: true })
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1)
    if (error) throw new Error(`fragrance_facts fetch failed: ${error.message}`)
    const batch = (data ?? []) as FragranceFactRow[]
    rows.push(...batch)
    if (batch.length < PAGE_SIZE) break
    page++
  }
  return rows
}

async function fetchPatterns(supabase: SupabaseClient): Promise<LayeringPatternRow[]> {
  const rows: LayeringPatternRow[] = []
  let page = 0
  for (;;) {
    // pattern_name is only unique within a source_file, so it alone is a
    // non-unique tie-breaker across pages — same issue as fetchFacts.
    // Explicit projection for the same reason as fetchFacts: raw_text/
    // enriched aren't part of the exported shape.
    const { data, error } = await supabase
      .from('layering_patterns')
      .select('id, pattern_name, source_file, fragrance_names, roles, use_case, rationale')
      .order('pattern_name', { ascending: true })
      .order('id', { ascending: true })
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1)
    if (error) throw new Error(`layering_patterns fetch failed: ${error.message}`)
    const batch = (data ?? []) as LayeringPatternRow[]
    rows.push(...batch)
    if (batch.length < PAGE_SIZE) break
    page++
  }
  return rows
}

function renderWardrobe(facts: FragranceFactRow[]): string {
  const lines = [
    '# nota. — Knowledge Engine: Fragrance Facts',
    '',
    '> Generated by `npm run export:wardrobe` from the `fragrance_facts` table.',
    '> Source pipeline: `scripts/ingest_fragrance_sources.ts` (see docs/KNOWLEDGE_ENGINE.md).',
    '',
    '## Olfactory Phase Model',
    '- **Anchor:** base-heavy scents (oud, amber, musk, leather) — foundation + longevity.',
    '- **Modulator:** heart-heavy scents (florals, spices, resins) — complexity + texture.',
    '- **Top:** volatile, fresh scents (citrus, aquatics, fruits) — opening blast + radiance.',
    '',
  ]

  for (const role of ['anchor', 'modulator', 'top', null] as const) {
    const group = facts.filter((f) => (f.role ?? null) === role)
    if (group.length === 0) continue
    lines.push(`## ${role ? ROLE_LABELS[role] : 'Unclassified'}`, '')
    for (const f of group) {
      lines.push(`### ${f.brand ? `${f.brand} — ` : ''}${f.name}`)
      lines.push(`- **Top notes:** ${f.top_notes?.join(', ') || 'N/A'}`)
      lines.push(`- **Heart notes:** ${f.heart_notes?.join(', ') || 'N/A'}`)
      lines.push(`- **Base notes:** ${f.base_notes?.join(', ') || 'N/A'}`)
      lines.push(`- **Accord families:** ${f.accord_families?.join(', ') || 'N/A'}`)
      lines.push(`- **Source:** ${f.source_file}`)
      lines.push('')
    }
  }

  return lines.join('\n')
}

function renderLayering(patterns: LayeringPatternRow[]): string {
  const lines = [
    '# nota. — Knowledge Engine: Layering Patterns',
    '',
    '> Generated by `npm run export:layering` from the `layering_patterns` table.',
    '> Source pipeline: `scripts/ingest_fragrance_sources.ts` (see docs/KNOWLEDGE_ENGINE.md).',
    '',
  ]

  for (const p of patterns) {
    lines.push(`## ${p.pattern_name}`)
    if (p.use_case) lines.push(`- **Use case:** ${p.use_case}`)
    const names = p.fragrance_names
    const roles = p.roles ?? undefined
    lines.push(
      `- **Fragrances:** ${names.map((n, i) => (roles?.[i] ? `${n} (${roles[i]})` : n)).join(' → ')}`,
    )
    if (p.rationale) lines.push(`- **Rationale:** ${p.rationale}`)
    lines.push(`- **Source:** ${p.source_file}`)
    lines.push('')
  }

  return lines.join('\n')
}

async function main() {
  const supabase = createSupabaseAdmin()
  const facts = target !== 'layering' ? await fetchFacts(supabase) : null
  const patterns = target !== 'wardrobe' ? await fetchPatterns(supabase) : null

  if (facts) {
    writeFileSync(join(OUT_DIR, 'MASTER_WARDROBE.md'), renderWardrobe(facts))
    console.log(`✓ MASTER_WARDROBE.md (${facts.length} facts)`)
  }
  if (patterns) {
    writeFileSync(join(OUT_DIR, 'LAYERING_PATTERNS.md'), renderLayering(patterns))
    console.log(`✓ LAYERING_PATTERNS.md (${patterns.length} patterns)`)
  }

  // The index always needs both halves regardless of which --target was
  // requested for the .md exports — fetch whichever wasn't already fetched
  // above instead of falling back to a possibly-missing/stale local file.
  // A targeted export on a fresh clone (no existing WARDROBE_INDEX.json)
  // previously wrote an empty array for the untouched half even when the
  // corresponding DB table had real rows.
  const indexFacts = facts ?? (await fetchFacts(supabase))
  const indexPatterns = patterns ?? (await fetchPatterns(supabase))

  writeFileSync(
    INDEX_PATH,
    JSON.stringify({ generated_at: new Date().toISOString(), facts: indexFacts, patterns: indexPatterns }, null, 2),
  )
  console.log('✓ WARDROBE_INDEX.json')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
