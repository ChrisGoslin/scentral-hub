#!/usr/bin/env -S npx tsx
// Ingest raw fragrance source files into fragrance_facts / layering_patterns.
// Usage: npx tsx scripts/ingest_fragrance_sources.ts [--dry-run]
//
// Reads data/fragrance/incoming/*.{md,csv,json}, asks the LLM to classify
// each file's content as one or more fragrance profiles and/or layering
// patterns (per the anchor/modulator/top framework in docs/MASTER_WARDROBE.md
// and app/api/aura/route.ts), upserts the extracted rows into Supabase, then
// moves the processed file into data/fragrance/canonical/.
//
// Requires: ANTHROPIC_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_KEY
// in .env.local. Rate limit: 1 LLM call per file, 500ms apart.

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { readdirSync, readFileSync, renameSync, existsSync } from 'fs'
import { join } from 'path'
import { runLLM } from '../lib/llm'

dotenv.config({ path: '.env.local' })

const isDryRun = process.argv.includes('--dry-run')
const delayMs = 500
const MAX_CONSECUTIVE_FAILURES = 3
const MAX_FAILURE_RATIO = 0.5
const MIN_FILES_BEFORE_RATIO_BREAK = 5

const INCOMING_DIR = join(process.cwd(), 'data/fragrance/incoming')
const CANONICAL_DIR = join(process.cwd(), 'data/fragrance/canonical')
const SUPPORTED_EXTENSIONS = new Set(['.md', '.csv', '.json'])

for (const key of ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_KEY']) {
  if (!process.env[key]) {
    console.error(`Missing ${key} in .env.local`)
    process.exit(1)
  }
}
if (!isDryRun && !process.env.ANTHROPIC_API_KEY) {
  console.error('Missing ANTHROPIC_API_KEY in .env.local')
  process.exit(1)
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

interface FragranceProfileItem {
  kind: 'fragrance_profile'
  brand?: string
  name: string
  top_notes?: string[]
  heart_notes?: string[]
  base_notes?: string[]
  accord_families?: string[]
  role?: 'anchor' | 'modulator' | 'top'
}

interface LayeringPatternItem {
  kind: 'layering_pattern'
  pattern_name: string
  fragrance_names: string[]
  roles?: string[]
  use_case?: string
  rationale?: string
}

type ExtractedItem = FragranceProfileItem | LayeringPatternItem

const EXTRACTION_SYSTEM_PROMPT = `You are a fragrance-knowledge extraction engine for nota., a personal scent identity app.
Given raw source text (markdown, CSV, or JSON) about fragrances, extract structured items.

Each item is either:
1. A single fragrance's profile — kind "fragrance_profile" with brand, name, top_notes, heart_notes, base_notes,
   accord_families, and a "role" of "anchor" (base-heavy, e.g. oud/amber/musk — foundation + longevity),
   "modulator" (heart-heavy, e.g. florals/spices/resins — complexity + texture), or "top" (volatile/fresh,
   e.g. citrus/aquatics/fruits — opening + radiance). This is nota.'s olfactory phase model.
2. A described combination of fragrances worn together — kind "layering_pattern" with pattern_name,
   fragrance_names (in the order they're applied or referenced), roles (parallel array: anchor/modulator/top
   per fragrance, when inferable), use_case, and rationale.

Return ONLY JSON: {"items": [...]}. If the text has no extractable fragrance content, return {"items": []}.`

async function classifyAndExtract(rawText: string): Promise<ExtractedItem[]> {
  const result = await runLLM<{ items?: ExtractedItem[] }>({
    system: EXTRACTION_SYSTEM_PROMPT,
    prompt: rawText.slice(0, 12000),
    maxTokens: 4096,
    json: true,
  })
  const items = result.items
  return Array.isArray(items) ? items : []
}

function createSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
  )
}

async function cleanupSourceFile(supabase: SupabaseClient, sourceFile: string) {
  const { error: factsError } = await supabase
    .from('fragrance_facts')
    .delete()
    .eq('source_file', sourceFile)
  if (factsError) throw new Error(`fragrance_facts cleanup failed: ${factsError.message}`)

  const { error: patternsError } = await supabase
    .from('layering_patterns')
    .delete()
    .eq('source_file', sourceFile)
  if (patternsError) throw new Error(`layering_patterns cleanup failed: ${patternsError.message}`)
}

async function processFile(supabase: SupabaseClient, file: string) {
  const path = join(INCOMING_DIR, file)
  const rawText = readFileSync(path, 'utf8')

  if (isDryRun) {
    console.log(`[DRY RUN] would classify+ingest: ${file}`)
    return { profilesWritten: 0, patternsWritten: 0 }
  }

  const items = await classifyAndExtract(rawText)
  await cleanupSourceFile(supabase, file)

  let profilesWritten = 0
  let patternsWritten = 0

  for (const item of items) {
    if (item.kind === 'fragrance_profile') {
      const { error } = await supabase.from('fragrance_facts').insert({
        brand: item.brand ?? null,
        name: item.name,
        source_file: file,
        top_notes: item.top_notes ?? [],
        heart_notes: item.heart_notes ?? [],
        base_notes: item.base_notes ?? [],
        accord_families: item.accord_families ?? [],
        role: item.role ?? null,
        raw_text: rawText,
        enriched: item,
      })
      if (error) throw new Error(`fragrance_facts insert failed: ${error.message}`)
      profilesWritten++
    } else if (item.kind === 'layering_pattern') {
      const { error } = await supabase.from('layering_patterns').insert({
        pattern_name: item.pattern_name,
        source_file: file,
        fragrance_names: item.fragrance_names ?? [],
        roles: item.roles ?? [],
        use_case: item.use_case ?? null,
        rationale: item.rationale ?? null,
        raw_text: rawText,
        enriched: item,
      })
      if (error) throw new Error(`layering_patterns insert failed: ${error.message}`)
      patternsWritten++
    }
  }

  renameSync(path, join(CANONICAL_DIR, file))
  console.log(`✓ ${file} — ${items.length} item(s) extracted, moved to canonical/`)

  return { profilesWritten, patternsWritten }
}

function shouldStopForFailure(processed: number, failed: number, consecutiveFailures: number) {
  if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) return true
  return processed >= MIN_FILES_BEFORE_RATIO_BREAK && failed / processed > MAX_FAILURE_RATIO
}

async function main() {
  if (!existsSync(INCOMING_DIR)) {
    console.error(`Missing ${INCOMING_DIR}`)
    process.exit(1)
  }

  const files = readdirSync(INCOMING_DIR).filter((f) =>
    SUPPORTED_EXTENSIONS.has(f.slice(f.lastIndexOf('.'))),
  )

  if (files.length === 0) {
    console.log('No new files in data/fragrance/incoming/.')
    return
  }

  const supabase = createSupabaseAdmin()
  console.log(`Found ${files.length} file(s) to ingest.`)

  let profilesWritten = 0
  let patternsWritten = 0
  let failed = 0
  let processed = 0
  let consecutiveFailures = 0

  for (const file of files) {
    try {
      const result = await processFile(supabase, file)
      profilesWritten += result.profilesWritten
      patternsWritten += result.patternsWritten
      consecutiveFailures = 0
    } catch (err) {
      failed++
      consecutiveFailures++
      console.error(`❌ ${file}:`, err instanceof Error ? err.message : err)
    }

    processed++
    if (shouldStopForFailure(processed, failed, consecutiveFailures)) {
      console.error('Stopping early: failure threshold exceeded.')
      break
    }

    await sleep(delayMs)
  }

  console.log(
    `\n📊 ${profilesWritten} fragrance_facts, ${patternsWritten} layering_patterns written, ${failed} file(s) failed.`,
  )
}

main()
