#!/usr/bin/env -S npx tsx
// Generate the weekly nota. product brief from the last 7 days of
// product_signals. Usage: npx tsx scripts/generate_weekly_product_brief.ts
//
// Requires: ANTHROPIC_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_KEY
// in .env.local (or as repo secrets when run from the weekly GitHub Action).

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { runLLM } from '../lib/llm'

dotenv.config({ path: '.env.local' })

const MAX_SIGNALS_PER_RUN = 200 // guardrail against unbounded LLM context; logged if hit

for (const key of ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_KEY', 'ANTHROPIC_API_KEY']) {
  if (!process.env[key]) {
    console.error(`Missing ${key} in .env.local`)
    process.exit(1)
  }
}

interface ProductSignalRow {
  id: string
  created_at: string
  source: string
  raw_text: string
  summary: string | null
  sentiment: string | null
  persona_guess: string | null
  feature_area: string | null
  tags: string[] | null
}

interface Theme {
  name: string
  signal_count: number
  personas_impacted: string[]
  feature_areas: string[]
  example_quotes: string[]
}

interface RecommendedBet {
  title: string
  rationale: string
  effort: 'S' | 'M' | 'L'
  impact: 'low' | 'medium' | 'high'
}

interface BriefResult {
  overview: string
  themes: Theme[]
  recommended_bets: RecommendedBet[]
}

const CLUSTERING_SYSTEM_PROMPT = `You are nota.'s product analyst. nota. is a personal scent identity app
(understands, reflects, evolves a user's scent identity over time — "if it's not personalised, it shouldn't exist").

Known personas (from SCENTRAL_PERSONAS.md): Gavan (The Awakening Collector — newcomer, plain language,
longevity/inspired-by discovery, no DNA-match jargon) and Christopher (the enthusiast — deeper fragrance
knowledge, layering, collection depth).

Known feature areas (from the route surface / AnotherSense gap analysis): The Read, noseprint, Shelf,
Discover, Collection/Living Wardrobe, Compare, Clones, Aura layering, Spritz/XP, Boxes/commerce, Social,
navigation, onboarding, monetisation.

Given a list of product signals (raw feedback + any existing summary/sentiment/persona/feature tags), cluster
them into 3-7 themes and produce 3-5 recommended bets. Return ONLY JSON:
{
  "overview": "<2-3 sentence summary of the week>",
  "themes": [{"name": "...", "signal_count": N, "personas_impacted": ["..."], "feature_areas": ["..."], "example_quotes": ["..."]}],
  "recommended_bets": [{"title": "...", "rationale": "...", "effort": "S"|"M"|"L", "impact": "low"|"medium"|"high"}]
}`

async function clusterSignals(signals: ProductSignalRow[]): Promise<BriefResult> {
  const payload = signals.map((s) => ({
    source: s.source,
    text: s.raw_text,
    summary: s.summary,
    sentiment: s.sentiment,
    persona_guess: s.persona_guess,
    feature_area: s.feature_area,
    tags: s.tags,
  }))

  const result = await runLLM<unknown>({
    system: CLUSTERING_SYSTEM_PROMPT,
    prompt: JSON.stringify(payload),
    maxTokens: 4096,
    json: true,
  })

  return validateBriefResult(result)
}

function createSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
  )
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function validateBriefResult(value: unknown): BriefResult {
  if (!value || typeof value !== 'object') {
    throw new Error('weekly brief LLM response was not an object')
  }

  const candidate = value as Partial<BriefResult>
  if (typeof candidate.overview !== 'string' || !Array.isArray(candidate.themes) || !Array.isArray(candidate.recommended_bets)) {
    throw new Error('weekly brief LLM response is missing required fields')
  }

  const themes = candidate.themes.map((theme) => {
    if (!theme || typeof theme !== 'object') throw new Error('weekly brief theme was malformed')
    const item = theme as Partial<Theme>
    if (
      typeof item.name !== 'string' ||
      typeof item.signal_count !== 'number' ||
      !isStringArray(item.personas_impacted) ||
      !isStringArray(item.feature_areas) ||
      !isStringArray(item.example_quotes)
    ) {
      throw new Error('weekly brief theme failed validation')
    }
    return item as Theme
  })

  const recommended_bets = candidate.recommended_bets.map((bet) => {
    if (!bet || typeof bet !== 'object') throw new Error('weekly brief bet was malformed')
    const item = bet as Partial<RecommendedBet>
    if (
      typeof item.title !== 'string' ||
      typeof item.rationale !== 'string' ||
      !['S', 'M', 'L'].includes(item.effort ?? '') ||
      !['low', 'medium', 'high'].includes(item.impact ?? '')
    ) {
      throw new Error('weekly brief bet failed validation')
    }
    return item as RecommendedBet
  })

  return { overview: candidate.overview, themes, recommended_bets }
}

function redactExampleQuote(text: string) {
  const redacted = text
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[email]')
    .replace(/\+?\d[\d\s().-]{7,}\d/g, '[phone]')
    .replace(/@[a-z0-9_]{2,}/gi, '[handle]')
    .replace(/\s+/g, ' ')
    .trim()

  return redacted.length > 180 ? `${redacted.slice(0, 177)}...` : redacted
}

function renderBrief(dateStr: string, signalCount: number, truncated: boolean, brief: BriefResult): string {
  const lines = [
    `# nota. Weekly Product Brief — ${dateStr}`,
    '',
    `> Generated by \`npm run brief:weekly\` from ${signalCount} signal(s) in the last 7 days.` +
      (truncated ? ` (truncated to ${MAX_SIGNALS_PER_RUN} most recent — see log)` : ''),
    '',
    '## Overview',
    '',
    brief.overview,
    '',
    '## Signals & Themes',
    '',
  ]

  for (const theme of brief.themes) {
    lines.push(`### ${theme.name} (${theme.signal_count} signal(s))`)
    lines.push(`- **Feature areas:** ${theme.feature_areas.join(', ') || 'N/A'}`)
    if (theme.example_quotes.length > 0) {
      lines.push('- **Examples:**')
      for (const q of theme.example_quotes) lines.push(`  - "${redactExampleQuote(q)}"`)
    }
    lines.push('')
  }

  lines.push('## Persona Impact', '')
  const personaMap = new Map<string, string[]>()
  for (const theme of brief.themes) {
    for (const persona of theme.personas_impacted) {
      const list = personaMap.get(persona) ?? []
      list.push(theme.name)
      personaMap.set(persona, list)
    }
  }
  if (personaMap.size === 0) {
    lines.push('_No persona mapping surfaced this week._')
  } else {
    for (const [persona, themes] of personaMap) {
      lines.push(`- **${persona}:** ${themes.join(', ')}`)
    }
  }
  lines.push('')

  lines.push('## Recommended Bets', '')
  for (const bet of brief.recommended_bets) {
    lines.push(`### ${bet.title}`)
    lines.push(`- **Effort:** ${bet.effort} · **Impact:** ${bet.impact}`)
    lines.push(`- **Rationale:** ${bet.rationale}`)
    lines.push('')
  }

  return lines.join('\n')
}

async function main() {
  const supabase = createSupabaseAdmin()
  const since = new Date()
  since.setDate(since.getDate() - 7)

  const { data, error } = await supabase
    .from('product_signals')
    .select('*')
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: false })
    .limit(MAX_SIGNALS_PER_RUN + 1)

  if (error) {
    console.error('Failed to fetch product_signals:', error.message)
    process.exit(1)
  }

  const signals = (data ?? []) as ProductSignalRow[]
  const truncated = signals.length > MAX_SIGNALS_PER_RUN
  if (truncated) {
    console.warn(
      `⚠️ ${signals.length} signals in the last 7 days, truncating to ${MAX_SIGNALS_PER_RUN} most recent.`,
    )
    signals.length = MAX_SIGNALS_PER_RUN
  }

  const todayStr = new Date().toISOString().slice(0, 10)

  if (signals.length === 0) {
    const outDir = join(process.cwd(), 'docs/weekly')
    if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })
    const emptyBrief = `# nota. Weekly Product Brief — ${todayStr}\n\n> No product_signals in the last 7 days.\n`
    writeFileSync(join(outDir, `PRODUCT_BRIEF_${todayStr}.md`), emptyBrief)
    console.log('No signals this week — wrote empty brief.')
    return
  }

  console.log(`Clustering ${signals.length} signal(s)...`)
  const brief = await clusterSignals(signals)

  const outDir = join(process.cwd(), 'docs/weekly')
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })
  const outPath = join(outDir, `PRODUCT_BRIEF_${todayStr}.md`)
  writeFileSync(outPath, renderBrief(todayStr, signals.length, truncated, brief))
  console.log(`✓ Wrote ${outPath}`)
}

main()
