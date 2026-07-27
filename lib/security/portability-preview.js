import { parseImportText } from '../portability/preview.js'

export const PORTABILITY_PREVIEW_LIMITS = Object.freeze({
  maxBytes: 100_000,
  maxRequestBytes: 104_096,
  maxRows: 75,
})

export function sanitizePreviewSearchTerm(value) {
  return String(value ?? '')
    .replace(/[%,()'";]/g, ' ')
    .trim()
    .slice(0, 80)
}

export function buildPortabilityPreviewRequest(body) {
  const text = typeof body?.text === 'string' ? body.text.trim() : ''
  if (!text) {
    return { ok: false, error: 'Paste a list or load a CSV or TSV export first.' }
  }

  if (text.includes('\0')) {
    return { ok: false, error: 'That preview contains invalid characters.' }
  }

  const byteLength = Buffer.byteLength(text, 'utf8')
  if (byteLength > PORTABILITY_PREVIEW_LIMITS.maxBytes) {
    return {
      ok: false,
      error: `That preview is too large. Keep it under ${PORTABILITY_PREVIEW_LIMITS.maxRows} rows or ${PORTABILITY_PREVIEW_LIMITS.maxBytes} bytes.`,
    }
  }

  const rows = parseImportText(text)
  if (!rows.length) {
    return { ok: false, error: 'We could not find any fragrance rows in that preview.' }
  }

  if (rows.length > PORTABILITY_PREVIEW_LIMITS.maxRows) {
    return {
      ok: false,
      error: `That preview has ${rows.length} rows. Keep each preview to ${PORTABILITY_PREVIEW_LIMITS.maxRows} rows or fewer.`,
    }
  }

  return {
    ok: true,
    value: {
      byteLength,
      rows,
    },
  }
}

export function validatePortabilityPreviewContentLength(contentLength) {
  if (!contentLength) return { ok: true }
  if (!/^\d+$/.test(contentLength)) {
    return { ok: false, error: 'The preview payload was not valid.' }
  }
  const parsed = Number.parseInt(contentLength, 10)
  if (!Number.isFinite(parsed)) {
    return { ok: false, error: 'The preview payload was not valid.' }
  }
  if (parsed > PORTABILITY_PREVIEW_LIMITS.maxRequestBytes) {
    return {
      ok: false,
      error: `That preview request is too large. Keep it under ${PORTABILITY_PREVIEW_LIMITS.maxBytes} bytes of import text.`,
    }
  }
  return { ok: true }
}
