#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomUUID } from 'node:crypto'
import dotenv from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')
const dataDir = path.join(repoRoot, 'scripts', 'data', 'research-briefs')

dotenv.config({ path: path.join(repoRoot, '.env.local') })

const VALID_TOOLS = ['firecrawl', 'agent-reach', 'opencli', 'last30days']

const args = process.argv.slice(2)
const flags = args.reduce((acc, raw) => {
  const [key, ...rest] = raw.replace(/^--/, '').split('=')
  acc[key] = rest.length > 0 ? rest.join('=') : true
  return acc
}, {})

const stringFlag = value => (typeof value === 'string' ? value.trim() : '')

const dryRun = flags.apply === undefined
const title = stringFlag(flags.title)
const tool = stringFlag(flags.tool)
const source = stringFlag(flags.source)
const confidence = stringFlag(flags.confidence)
const notes = stringFlag(flags.notes)
const tags = stringFlag(flags.tags).split(',').map(tag => tag.trim()).filter(Boolean)

if (!title) {
  console.error('❌ Missing required flag: --title="Your research brief title"')
  process.exit(1)
}

if (!tool) {
  console.error(`❌ Missing required flag: --tool="${VALID_TOOLS.join(',')}"`)
  process.exit(1)
}

const requestedTools = tool.split(',').map(t => t.trim()).filter(Boolean)
const unknownTools = requestedTools.filter(t => !VALID_TOOLS.includes(t))
if (unknownTools.length > 0) {
  console.error(`❌ Unknown tool(s): ${unknownTools.join(', ')}. Valid tools: ${VALID_TOOLS.join(', ')}`)
  process.exit(1)
}

const brief = {
  title,
  tool,
  source: source || null,
  confidence: confidence || null,
  tags,
  notes: notes || null,
  recordedAt: new Date().toISOString(),
  repository: 'scentral-hub',
  branch: process.env.GIT_BRANCH || null,
}

console.log('=== Research Brief Preview ===')
console.log(JSON.stringify(brief, null, 2))
console.log('==============================')

if (dryRun) {
  console.log('\n⚠️ Dry run only. Add --apply to save this brief to the repository data directory.')
  process.exit(0)
}

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

const timestamp = brief.recordedAt.replace(/[:.]/g, '-')
const uniqueSuffix = randomUUID().slice(0, 8)
const filename = `research-brief-${timestamp}-${uniqueSuffix}.json`
const filepath = path.join(dataDir, filename)

fs.writeFileSync(filepath, JSON.stringify(brief, null, 2) + '\n', 'utf8')
console.log(`✅ Saved research brief to ${path.relative(repoRoot, filepath)}`)
