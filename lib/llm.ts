// Shared LLM helper for enrichment scripts and API routes. Reads model + key
// from process.env so callers never hardcode either. Deliberately has no
// Next.js-only imports (no `server-only`, no `next/*`) so it works from both
// app/api routes and standalone scripts run via tsx.

import Anthropic from '@anthropic-ai/sdk'

export interface RunLLMOptions {
  system?: string
  prompt: string
  maxTokens?: number
  json?: boolean // when true, strips ```json fences and JSON.parses the response
  model?: string
}

let client: Anthropic | null = null

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('Missing ANTHROPIC_API_KEY in process.env')
  }
  if (!client) {
    client = new Anthropic({ apiKey })
  }
  return client
}

function stripJsonFence(text: string): string {
  return text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim()
}

/**
 * Calls the configured LLM (model defaults to process.env.LLM_MODEL, falling
 * back to Haiku) and returns raw text, or a parsed object when json=true.
 */
export async function runLLM(opts: RunLLMOptions): Promise<string | unknown> {
  const { system, prompt, maxTokens = 1024, json = false, model } = opts
  const anthropic = getClient()
  const resolvedModel = model ?? process.env.LLM_MODEL ?? 'claude-haiku-4-5-20251001'

  const message = await anthropic.messages.create({
    model: resolvedModel,
    max_tokens: maxTokens,
    system,
    messages: [{ role: 'user', content: prompt }],
  })

  const block = message.content[0]
  const rawText = block && block.type === 'text' ? block.text : ''

  if (!json) return rawText

  const cleaned = stripJsonFence(rawText)
  try {
    return JSON.parse(cleaned)
  } catch {
    throw new Error(`runLLM: expected JSON but got unparseable text: ${cleaned.slice(0, 200)}`)
  }
}
