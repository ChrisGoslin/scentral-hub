// Shared placeholder glyph for fragrance cards with no image_url or a dead
// image URL — signals "no photo yet" intentionally, instead of looking broken.
export function FragranceBottleIcon({ opacity = 0.35 }: { opacity?: number }) {
  return (
    <svg width="32" height="48" viewBox="0 0 32 48" style={{ opacity }}>
      <rect x="11" y="2" width="10" height="6" rx="1" fill="currentColor" />
      <path
        d="M9 8h14v6l3 4v26a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V18l3-4V8z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  )
}
