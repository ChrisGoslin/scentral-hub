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
};

export default withSentryConfig(nextConfig, {
  silent: true,
  org: 'scentral',
  project: 'scentral-hub',
});
