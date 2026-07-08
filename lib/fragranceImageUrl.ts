import { ALLOWED_FRAGRANCE_IMAGE_HOST_SET } from './fragranceImageHosts'

const IMAGE_EXTENSION_PATTERN = /\.(?:avif|bmp|gif|ico|jpe?g|png|svg|webp)(?:[?#].*)?$/i

export function getSafeFragranceImageUrl(imageUrl: string | null | undefined): string | null {
  if (typeof imageUrl !== 'string') return null

  const trimmed = imageUrl.trim()
  if (!trimmed) return null

  try {
    const parsed = new URL(trimmed)
    const protocol = parsed.protocol.toLowerCase()
    const host = parsed.hostname.toLowerCase()
    const pathname = parsed.pathname.toLowerCase()

    if (protocol !== 'https:') return null
    if (!ALLOWED_FRAGRANCE_IMAGE_HOST_SET.has(host)) return null

    const isFragranticaPage =
      host.includes('fragrantica.com') && !IMAGE_EXTENSION_PATTERN.test(trimmed)
    const isParfumoPage =
      host.includes('parfumo.com') &&
      pathname.includes('/perfumes/') &&
      !IMAGE_EXTENSION_PATTERN.test(trimmed)

    if (isFragranticaPage || isParfumoPage) return null

    return trimmed
  } catch {
    return null
  }
}
