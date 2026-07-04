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
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "basenote-qn",

  project: "sentry-aquamarine-village",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});
