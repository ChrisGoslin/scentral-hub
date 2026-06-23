/**
 * Single source of truth for Pro-tier access.
 * During open beta every user gets Pro features for free via NEXT_PUBLIC_BETA_MODE.
 * Replace the fallback with a real check (Stripe webhook → Supabase profiles.is_pro)
 * when billing ships — every consumer already imports getIsPro() from here.
 */
export function getIsPro(): boolean {
  return process.env.NEXT_PUBLIC_BETA_MODE === 'true' ? true : false
}
