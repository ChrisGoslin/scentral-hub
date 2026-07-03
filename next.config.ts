import type { NextConfig } from "next";
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lrkdwobnemczvhpixpky.supabase.co' },
      { protocol: 'https', hostname: 'media.parfumo.com' },
      { protocol: 'https', hostname: 'www.parfumo.com' },
      { protocol: 'https', hostname: 'fimgs.net' },
      { protocol: 'https', hostname: 'www.fragrantica.com' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      // enrich-images-shopify.mjs writes cdn.shopify.com URLs (brand stores +
      // multi-brand retailers). Missing since the 2026-06-28 brand run — see
      // AGENTS.md L16, next/image throws at render time on unlisted hosts.
      { protocol: 'https', hostname: 'cdn.shopify.com' },
    ],
  },
  webpack: (config, { isServer }) => {
    // Prevent script output files from triggering dev server hot reloads.
    // enrich-images.mjs writes to scripts/data/ every ~1.5s which causes
    // continuous page reloads during dev sessions.
    if (!isServer) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [
          ...(Array.isArray(config.watchOptions?.ignored)
            ? config.watchOptions.ignored
            : config.watchOptions?.ignored
            ? [config.watchOptions.ignored]
            : []),
          '**/scripts/data/**',
        ],
      }
    }
    return config
  },
};

export default withSentryConfig(nextConfig, {
  silent: true,
  org: 'scentral',
  project: 'scentral-hub',
});
