import type { NextConfig } from "next";
import { withSentryConfig } from '@sentry/nextjs';
import { ALLOWED_FRAGRANCE_IMAGE_HOSTS } from './lib/fragranceImageHosts'

const nextConfig: NextConfig = {
  // Baseline security headers (docs/nota/06-testing-security-abuse.md §2.4).
  // CSP is deliberately deferred — ship Report-Only first, tighten from real
  // reports. Do not add a blocking CSP here untested.
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
  images: {
    remotePatterns: ALLOWED_FRAGRANCE_IMAGE_HOSTS.map(hostname => ({ protocol: 'https', hostname })),
  },
  turbopack: {
    root: process.cwd(),
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

  org: "nota-prod",

  project: "sentry-nota-scent-identity",

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
