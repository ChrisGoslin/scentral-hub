const HEADER_ALIASES = {
  brand: ['brand', 'house', 'manufacturer', 'designer'],
  name: ['name', 'perfume', 'fragrance name', 'scent'],
  fullName: ['fragrance', 'full name', 'perfume name', 'title'],
  status: ['status', 'shelf', 'collection status', 'ownership'],
  rating: ['rating', 'score', 'my rating'],
  notes: ['notes', 'note', 'review', 'comments'],
}

function clean(value) {
  return String(value ?? '').trim()
}

export function normalizeForMatch(value) {
  return clean(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

function countDelimiter(line, delimiter) {
  let count = 0
  let quoted = false
  for (let index = 0; index < line.length; index += 1) {
    if (line[index] === '"') quoted = !quoted
    else if (!quoted && line[index] === delimiter) count += 1
  }
  return count
}

function detectDelimiter(text) {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? ''
  return [',', '\t', ';'].sort(
    (left, right) => countDelimiter(firstLine, right) - countDelimiter(firstLine, left),
  )[0]
}

export function parseDelimitedText(text, delimiter = detectDelimiter(text)) {
  if (typeof text !== 'string' || !text.trim()) return []

  const rows = []
  let row = []
  let field = ''
  let quoted = false

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index]
    const next = text[index + 1]

    if (character === '"' && quoted && next === '"') {
      field += '"'
      index += 1
    } else if (character === '"') {
      quoted = !quoted
    } else if (character === delimiter && !quoted) {
      row.push(field)
      field = ''
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && next === '\n') index += 1
      row.push(field)
      if (row.some((value) => clean(value))) rows.push(row)
      row = []
      field = ''
    } else {
      field += character
    }
  }

  row.push(field)
  if (row.some((value) => clean(value))) rows.push(row)
  return rows
}

function canonicalHeader(value) {
  const normalized = normalizeForMatch(value)
  return Object.entries(HEADER_ALIASES).find(([, aliases]) =>
    aliases.some((alias) => normalizeForMatch(alias) === normalized),
  )?.[0]
}

export function parseImportText(text) {
  const rows = parseDelimitedText(text)
  if (!rows.length) return []

  const rawHeaders = rows[0].map((value) => clean(value))
  const mappedHeaders = rows[0].map(canonicalHeader)
  const hasHeaders = mappedHeaders.some(Boolean)
  const headers = hasHeaders
    ? mappedHeaders
    : rows[0].length > 1
      ? ['brand', 'name']
      : ['fullName']
  const dataRows = hasHeaders ? rows.slice(1) : rows

  return dataRows.flatMap((values, rowIndex) => {
    const rawValues = values.map((value) => clean(value))
    const record = {}
    headers.forEach((header, columnIndex) => {
      if (header) record[header] = rawValues[columnIndex]
    })

    const brand = clean(record.brand)
    const name = clean(record.name)
    const fullName = clean(record.fullName) || clean(`${brand} ${name}`)
    if (!fullName) return []

    const numericRating = Number(record.rating)
    return [{
      sourceRow: rowIndex + (hasHeaders ? 2 : 1),
      brand,
      name,
      fullName,
      source: {
        headers: hasHeaders ? rawHeaders : headers.map((header, index) => header || `column_${index + 1}`),
        values: rawValues,
      },
      status: clean(record.status),
      rating: Number.isFinite(numericRating) && numericRating > 0 ? numericRating : null,
      notes: clean(record.notes),
    }]
  })
}

function tokenScore(left, right) {
  const leftTokens = new Set(normalizeForMatch(left).split(' ').filter(Boolean))
  const rightTokens = new Set(normalizeForMatch(right).split(' ').filter(Boolean))
  if (!leftTokens.size || !rightTokens.size) return 0

  const intersection = [...leftTokens].filter((token) => rightTokens.has(token)).length
  const union = new Set([...leftTokens, ...rightTokens]).size
  return intersection / union
}

function candidateName(candidate) {
  return clean(`${candidate.brand ?? ''} ${candidate.name ?? ''}`)
}

export function previewImportMatches(importRows, catalogue) {
  const results = importRows.map((row) => {
    const normalizedFullName = normalizeForMatch(row.fullName)
    const normalizedBrand = normalizeForMatch(row.brand)
    const normalizedName = normalizeForMatch(row.name)

    const candidates = catalogue
      .map((candidate) => {
        const fullName = candidateName(candidate)
        const exact = normalizedBrand && normalizedName
          ? normalizeForMatch(candidate.brand) === normalizedBrand &&
            normalizeForMatch(candidate.name) === normalizedName
          : normalizeForMatch(fullName) === normalizedFullName
        return {
          id: candidate.id,
          brand: clean(candidate.brand),
          name: clean(candidate.name),
          score: exact ? 1 : tokenScore(row.fullName, fullName),
          reason: exact ? 'Exact brand and name' : 'Similar words',
        }
      })
      .filter((candidate) => candidate.score >= 0.5)
      .sort((left, right) => right.score - left.score || left.name.localeCompare(right.name))
      .slice(0, 5)

    const exactCandidates = candidates.filter((candidate) => candidate.score === 1)
    let outcome = 'unmatched'
    if (exactCandidates.length === 1) outcome = 'exact'
    else if (exactCandidates.length > 1) outcome = 'ambiguous'
    else if (candidates.length === 1 && candidates[0].score >= 0.75) outcome = 'likely'
    else if (candidates.length > 0) outcome = 'ambiguous'

    return {
      row,
      outcome,
      selectedFragranceId: outcome === 'exact' ? exactCandidates[0].id : null,
      candidates,
    }
  })

  const summary = { total: results.length, exact: 0, likely: 0, ambiguous: 0, unmatched: 0 }
  results.forEach((result) => { summary[result.outcome] += 1 })
  return { summary, results }
}
