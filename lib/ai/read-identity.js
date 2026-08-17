const IDENTITY_KEYS = [
  'descriptor',
  'noseprintName',
  'opening',
  'signals',
  'stretchNote',
]

const MAX_RAW_LENGTH = 50_000
const MAX_TEXT_LENGTH = 1_000
const SIGNAL_COUNT = 3

function unwrapJsonFence(raw) {
  const text = raw.trim()
  if (!text.startsWith('```')) return text

  const lines = text.split(/\r?\n/)
  const openingFence = lines.shift()
  const closingFence = lines.pop()

  if (!['```', '```json'].includes(openingFence) || closingFence !== '```') {
    return null
  }

  return lines.join('\n').trim()
}

function normalizeText(value) {
  if (typeof value !== 'string') return null

  const normalized = value.trim()
  if (!normalized || normalized.length > MAX_TEXT_LENGTH) return null

  return normalized
}

export function parseReadIdentity(raw) {
  if (typeof raw !== 'string' || raw.length > MAX_RAW_LENGTH) return null

  const json = unwrapJsonFence(raw)
  if (!json) return null

  let candidate
  try {
    candidate = JSON.parse(json)
  } catch {
    return null
  }

  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) return null

  const keys = Object.keys(candidate).sort()
  if (keys.length !== IDENTITY_KEYS.length || keys.some((key, index) => key !== IDENTITY_KEYS[index])) {
    return null
  }

  const opening = normalizeText(candidate.opening)
  const noseprintName = normalizeText(candidate.noseprintName)
  const descriptor = normalizeText(candidate.descriptor)
  const stretchNote = normalizeText(candidate.stretchNote)
  if (!opening || !noseprintName || !descriptor || !stretchNote) return null

  if (!Array.isArray(candidate.signals) || candidate.signals.length !== SIGNAL_COUNT) return null
  const signals = candidate.signals.map(normalizeText)
  if (signals.some((signal) => signal === null)) return null

  return {
    opening,
    noseprintName,
    descriptor,
    signals,
    stretchNote,
  }
}
