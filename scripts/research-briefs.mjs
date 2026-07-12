#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')
const dataDir = path.join(repoRoot, 'scripts', 'data', 'research-briefs')

const args = process.argv.slice(2)
const flags = args.reduce((acc, raw) => {
  const [key, ...rest] = raw.replace(/^--/, '').split('=')
  acc[key] = rest.length > 0 ? rest.join('=') : true
  return acc
}, {})

const dryRun = flags.apply === undefined
const title = flags.title || ''
const tool = flags.tool || ''
const source = flags.source || ''
const confidence = flags.confidence || ''
const notes = flags.notes || ''
const tags = (flags.tags || '').split(',').map(tag => tag.trim()).filter(Boolean)

if (!title) {
  console.error('❌ Missing required flag: --title="Your research brief title"')
  process.exit(1)
}

if (!tool) {
  console.error('❌ Missing required flag: --tool="firecrawl,agent-reach,opencli,last30days"')
  process.exit(1)
}

const brief = {
  title: String(title).trim(),
  tool: String(tool).trim(),
  source: source ? String(source).trim() : null,
  confidence: confidence ? String(confidence).trim() : null,
  tags,
  notes: notes ? String(notes).trim() : null,
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

const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
const filename = `research-brief-${timestamp}.json`
const filepath = path.join(dataDir, filename)

fs.writeFileSync(filepath, JSON.stringify(brief, null, 2) + '\n', 'utf8')
console.log(`✅ Saved research brief to ${path.relative(repoRoot, filepath)}`)
