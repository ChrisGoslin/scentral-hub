import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — Scentral',
  description: 'How Scentral handles your fragrance data and personal information.',
}

const SECTIONS = [
  {
    heading: 'Overview',
    body: `Scentral is a personal fragrance wardrobe app. We take your privacy seriously. This policy explains what information we collect, how we use it, and what choices you have. In short: your fragrance data lives in your browser, we don't sell anything about you, and we only use anonymised analytics to improve the app.`,
  },
  {
    heading: 'Data stored in your browser',
    body: `Scentral currently stores all personal data locally in your browser using localStorage. This includes:\n\n• Your fragrance collection and affinity ratings\n• Wishlist entries\n• Scent persona preferences from the Sanctuary Profiler\n• Field notes and personal annotations\n• UI preferences (theme, view mode)\n\nThis data never leaves your device and is not transmitted to our servers. Clearing your browser storage or uninstalling the app will permanently delete this data. We recommend exporting your wardrobe periodically (feature in development).`,
  },
  {
    heading: 'No account, no auth — for now',
    body: `The current MVP does not require you to create an account or provide any personal information such as your name, email address, or date of birth. No login credentials are collected or stored.`,
  },
  {
    heading: 'Analytics (PostHog)',
    body: `We use PostHog to understand how people use Scentral so we can improve it. PostHog is configured with the following privacy settings:\n\n• IP addresses are masked\n• No cross-site tracking\n• Personal identifiers are not collected\n• Session recordings (if enabled) are anonymised\n\nAnalytics data is used solely to understand feature usage and diagnose bugs. It is never sold or shared with third parties for advertising purposes. You can opt out of analytics by enabling your browser's Do Not Track signal or by using a content blocker.`,
  },
  {
    heading: 'Third-party services',
    body: `Scentral does not sell, rent, or share your personal information with third parties for marketing purposes. The only third-party service currently integrated is PostHog (analytics), described above. Fragrance metadata sourced from public databases (e.g. Parfumo) is used to enrich your collection — no personal data is transmitted to these services.`,
  },
  {
    heading: 'Cookies',
    body: `Scentral does not use tracking cookies. PostHog may set a first-party cookie to maintain an anonymised session. This cookie contains no personally identifiable information. It expires after 365 days or when you clear cookies for this site.`,
  },
  {
    heading: 'Children',
    body: `Scentral is not directed at children under 13. We do not knowingly collect any information from children. If you believe a child has provided personal information through our app, please contact us and we will delete it promptly.`,
  },
  {
    heading: 'Changes to this policy',
    body: `We may update this Privacy Policy from time to time. When we do, we will revise the "Last updated" date below. Continued use of Scentral after changes are posted constitutes acceptance of the updated policy. For significant changes, we will provide a notice within the app.`,
  },
  {
    heading: 'Contact',
    body: `If you have questions or concerns about this Privacy Policy or how your data is handled, please contact us at:\n\nchristophergoslin@outlook.com\n\nWe will respond within 30 days.`,
  },
]

export default function PrivacyPage() {
  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'var(--bg)',
        color: 'var(--text)',
        fontFamily: 'var(--font-body)',
      }}
    >
      <main
        style={{
          maxWidth: 680,
          margin: '0 auto',
          padding: '48px 24px 80px',
          boxSizing: 'border-box',
        }}
      >
        {/* Back link */}
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            textDecoration: 'none',
            marginBottom: 48,
            borderBottom: '1px solid var(--line)',
            paddingBottom: 2,
          }}
        >
          ← Scentral
        </Link>

        {/* Page header */}
        <div
          style={{
            width: 32,
            height: 2,
            background: 'var(--color-primary)',
            marginBottom: 20,
          }}
        />

        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: 'clamp(1.8rem, 5vw, 2.8rem)',
            fontWeight: 400,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            color: 'var(--text)',
            margin: '0 0 12px',
          }}
        >
          Privacy Policy
        </h1>

        <p
          style={{
            fontSize: 13,
            color: 'var(--text-muted)',
            margin: '0 0 48px',
            letterSpacing: '0.02em',
          }}
        >
          Last updated: June 2026
        </p>

        {/* Sections */}
        {SECTIONS.map(({ heading, body }) => (
          <section
            key={heading}
            style={{
              paddingBottom: 32,
              marginBottom: 32,
              borderBottom: '1px solid var(--line)',
            }}
          >
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                fontSize: '1.15rem',
                fontWeight: 400,
                color: 'var(--color-primary)',
                margin: '0 0 14px',
                letterSpacing: '-0.01em',
              }}
            >
              {heading}
            </h2>

            {body.split('\n').map((paragraph, i) => (
              paragraph.trim() === '' ? (
                <div key={i} style={{ height: 10 }} />
              ) : (
                <p
                  key={i}
                  style={{
                    fontSize: 14,
                    lineHeight: 1.7,
                    color: paragraph.startsWith('•')
                      ? 'var(--text-muted)'
                      : 'var(--text)',
                    margin: '0 0 6px',
                    paddingLeft: paragraph.startsWith('•') ? 4 : 0,
                  }}
                >
                  {paragraph}
                </p>
              )
            ))}
          </section>
        ))}

        {/* Footer note */}
        <p
          style={{
            fontSize: 12,
            color: 'var(--text-muted)',
            lineHeight: 1.6,
            marginTop: 8,
          }}
        >
          Scentral · Made for fragrance obsessives ·{' '}
          <Link
            href="/terms"
            style={{
              color: 'var(--color-primary)',
              textDecoration: 'none',
              borderBottom: '1px solid var(--line)',
              paddingBottom: 1,
            }}
          >
            Terms of Service
          </Link>
        </p>
      </main>
    </div>
  )
}
