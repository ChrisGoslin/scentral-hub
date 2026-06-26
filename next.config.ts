import type { NextConfig } from "next";
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lrkdwobnemczvhpixpky.supabase.co' },
      { protocol: 'https', hostname: 'media.parfumo.com' },
      { protocol: 'https', hostname: 'fimgs.net' },
      { protocol: 'https', hostname: 'www.fragrantica.com' },
    ],
  },
  // Prevent script output files from triggering dev server hot reloads.
  // enrich-images.mjs writes to scripts/data/ every ~1.5s which causes
  // continuous page reloads in the browser during dev sessions.
  watchOptions: {
    ignored: ['**/scripts/data/**', '**/.git/**'],
  },
};

export default withSentryConfig(nextConfig, {
  silent: true,
  org: 'scentral',
  project: 'scentral-hub',
});
