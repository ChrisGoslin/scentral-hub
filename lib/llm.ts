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
  timeoutMs?: number
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
 * Calls the configured LLM and returns raw text, or a parsed object when
 * json=true.
 */
export async function runLLM(opts: RunLLMOptions & { json?: false }): Promise<string>
export async function runLLM<T = unknown>(opts: RunLLMOptions & { json: true }): Promise<T>
export async function runLLM<T = unknown>(opts: RunLLMOptions): Promise<string | T> {
  const { system, prompt, maxTokens = 1024, json = false, model, timeoutMs } = opts
  const anthropic = getClient()
  const resolvedModel = model ?? process.env.LLM_MODEL ?? 'claude-haiku-4-5-20251001'
  const timeout = timeoutMs ?? Number(process.env.LLM_TIMEOUT_MS ?? 30_000)

  const message = await anthropic.messages.create(
    {
      model: resolvedModel,
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: prompt }],
    },
    { timeout },
  )

  const block = message.content[0]
  const rawText = block && block.type === 'text' ? block.text : ''

  if (!json) return rawText

  const cleaned = stripJsonFence(rawText)
  try {
    return JSON.parse(cleaned) as T
  } catch {
    throw new Error(`runLLM: expected JSON but got unparseable text: ${cleaned.slice(0, 200)}`)
  }
}
