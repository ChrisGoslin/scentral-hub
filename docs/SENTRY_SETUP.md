# Sentry Setup

To activate error monitoring:
1. Create a free account at https://sentry.io
2. Create a new project → Next.js
3. Copy the DSN from Project Settings → Client Keys
4. Add to Vercel: Settings → Environment Variables → NEXT_PUBLIC_SENTRY_DSN = <your-dsn>
5. Add to .env.local for local dev
