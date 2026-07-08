import { getPersonaById } from '@/lib/personas'

type PersonalizationInput = {
  personaId?: string | null
  personaName?: string | null
  displayName?: string | null
  email?: string | null
  ownedCount?: number | null
}

function titleCase(value: string) {
  return value
    .split(/[\s._-]+/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function firstNameFromEmail(email: string | null | undefined) {
  if (!email) return null
  const raw = email.split('@')[0]?.trim()
  if (!raw) return null
  const cleaned = raw.replace(/[._-]+/g, ' ')
  return titleCase(cleaned).split(' ')[0] ?? null
}

function pick<T>(items: T[], fallback: T): T {
  return items.length > 0 ? items[0] : fallback
}

export function resolvePersonalName(input: PersonalizationInput) {
  return (
    input.displayName?.trim() ||
    firstNameFromEmail(input.email) ||
    input.personaName?.replace(/^The\s+/i, '') ||
    'you'
  )
}

export function buildPersonalNote(input: PersonalizationInput) {
  const persona = input.personaId ? getPersonaById(input.personaId) : null
  const personaName = input.personaName ?? persona?.name ?? null
  const person = resolvePersonalName(input)
  const ownedCount = input.ownedCount ?? null

  const traitA = pick(persona?.scent_spectrum.top ?? [], 'paper')
  const traitB = pick(persona?.scent_spectrum.heart ?? [], 'ink')
  const traitC = pick(persona?.scent_spectrum.base ?? [], 'wood')
  const tagline = persona?.narrative.tagline ?? 'You already have a scent identity.'
  const layeringTip = pick(persona?.recommendations.layering_tips ?? [], 'Keep a handwritten note by the bottle.')

  const ownedSuffix = typeof ownedCount === 'number'
    ? ownedCount === 0
      ? 'Your shelf is still a blank page.'
      : ownedCount === 1
        ? 'One bottle is a beginning.'
        : `${ownedCount} bottles and still not finished.`
    : 'The collection is still becoming.'

  return {
    label: `For ${person}`,
    title: personaName ? `${personaName} / ${person}` : `Notes for ${person}`,
    note: `${tagline} ${ownedSuffix}`,
    annotation: `${traitA}, ${traitB}, ${traitC}. ${layeringTip}`,
    signature: persona ? `${persona.name} · ${persona.ui_theme.accentColor}` : null,
  }
}
