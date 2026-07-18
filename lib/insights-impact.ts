// Canonical source lives in supabase/functions/_shared/insights-impact.ts —
// that's the only location Supabase's deploy bundler is guaranteed to walk
// (see https://supabase.com/docs/guides/functions/development-tips). This
// re-export lets the Next.js app keep importing from '@/lib/insights-impact'.
export * from '../supabase/functions/_shared/insights-impact'
