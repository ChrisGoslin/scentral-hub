const MAX_CONTEXT_LENGTH = 80
const MAX_METADATA_LENGTH = 10_000

function optionalText(value) {
  if (value === null || value === undefined || value === '') return null
  if (typeof value !== 'string') return undefined

  const trimmed = value.trim()
  if (!trimmed || trimmed.length > MAX_CONTEXT_LENGTH) return undefined
  return trimmed
}

function isValidDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const parsed = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
}

export function buildWearLogInsert(body, authUserId) {
  if (!authUserId || !body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'Please sign in to log a wear.' }
  }

  const fragranceId = typeof body.fragrance_id === 'string' ? body.fragrance_id.trim() : ''
  const rating = body.rating
  const wornOn = body.worn_on ?? new Date().toISOString().slice(0, 10)
  const occasion = optionalText(body.occasion)
  const weather = optionalText(body.weather)

  if (!fragranceId || fragranceId.length > 100) {
    return { ok: false, error: 'Choose a fragrance before saving.' }
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { ok: false, error: 'Choose a rating from 1 to 5.' }
  }
  if (!isValidDate(wornOn)) {
    return { ok: false, error: 'Choose a valid wear date.' }
  }
  if (occasion === undefined || weather === undefined) {
    return { ok: false, error: 'Wear context must be short text.' }
  }

  const metadata = body.metadata ?? {}
  if (
    !metadata ||
    typeof metadata !== 'object' ||
    Array.isArray(metadata) ||
    JSON.stringify(metadata).length > MAX_METADATA_LENGTH
  ) {
    return { ok: false, error: 'Wear details were too large or invalid.' }
  }

  return {
    ok: true,
    value: {
      user_id: authUserId,
      fragrance_id: fragranceId,
      worn_on: wornOn,
      occasion,
      weather,
      rating,
      metadata,
    },
  }
}
