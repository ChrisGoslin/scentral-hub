import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service — Scentral',
  description: 'Terms governing your use of the Scentral fragrance wardrobe app.',
}

const SECTIONS = [
  {
    heading: 'Acceptance of terms',
    body: `By accessing or using Scentral ("the app", "the service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use Scentral. We reserve the right to modify these terms at any time. Continued use after changes are posted constitutes acceptance.`,
  },
  {
    heading: 'What Scentral is',
    body: `Scentral is a personal fragrance wardrobe application that helps you discover, catalogue, and organise your fragrance collection. The current version is a free MVP. There are no paid tiers, subscriptions, or in-app purchases at this time. We may introduce paid features in the future and will provide adequate notice before doing so.`,
  },
  {
    heading: 'Your content',
    body: `You retain full ownership of any content you create within Scentral, including field notes, personal ratings, and annotations.\n\nBy submitting content through Scentral, you grant us a limited, non-exclusive, royalty-free licence to store and display that content solely for the purpose of providing the service to you. We do not claim ownership of your fragrance data, notes, or any other user-generated content.\n\nYou are responsible for the content you create. You agree not to submit content that is unlawful, defamatory, harassing, or infringing on any third party's rights.`,
  },
  {
    heading: 'Community standards — "Yes, And..."',
    body: `Scentral is built around a philosophy of open, generous fragrance discourse — we call it "Yes, And..." Taste is subjective. Every nose is different. We ask that all community interactions (including field notes, reviews, and any future social features) reflect this spirit:\n\n• Be generous: assume good faith in other people's taste\n• Be specific: share what you actually smell, not just verdicts\n• Be respectful: no harassment, gatekeeping, or elitism\n• No spam or self-promotion without prior arrangement\n\nWe reserve the right to remove content or restrict access for violations of these standards.`,
  },
  {
    heading: 'Intellectual property',
    body: `The Scentral name, logo, design system, and application code are owned by us and protected by applicable intellectual property laws. Fragrance names, brand names, and house names referenced within the app remain the property of their respective owners. Scentral is not affiliated with, endorsed by, or in partnership with any fragrance house or retailer unless explicitly stated.`,
  },
  {
    heading: 'Third-party content and links',
    body: `Scentral may display fragrance metadata, imagery, or links sourced from third-party databases and websites (e.g. Parfumo, brand sites, retailers). We do not control third-party content and are not responsible for its accuracy, availability, or legality. Links to external sites are provided for convenience and do not constitute endorsement.`,
  },
  {
    heading: 'Disclaimer of warranties',
    body: `Scentral is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not warrant that the service will be uninterrupted, error-free, or free of viruses or other harmful components. Fragrance recommendations and persona descriptions are for entertainment and personal exploration purposes only — they do not constitute professional advice of any kind.`,
  },
  {
    heading: 'Limitation of liability',
    body: `To the fullest extent permitted by applicable law, Scentral and its creators shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of (or inability to use) the service, including loss of data, loss of profits, or any other damages.\n\nOur total liability for any claim arising from these terms or your use of the service shall not exceed £100 (one hundred British pounds).`,
  },
  {
    heading: 'Data and privacy',
    body: `Your use of Scentral is also governed by our Privacy Policy. Please review it to understand our practices. In summary: fragrance data is stored locally in your browser, no account is required, and we only collect anonymised analytics.`,
  },
  {
    heading: 'Termination',
    body: `You may stop using Scentral at any time. Clearing your browser data will remove all locally stored information. We reserve the right to suspend or terminate access to the service for any user who violates these terms, without prior notice.`,
  },
  {
    heading: 'Governing law',
    body: `These Terms of Service are governed by the laws of England and Wales. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts of England and Wales.`,
  },
  {
    heading: 'Contact',
    body: `Questions about these Terms of Service? Contact us at:\n\nchristophergoslin@outlook.com`,
  },
]

export default function TermsPage() {
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
          Terms of Service
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
            href="/privacy"
            style={{
              color: 'var(--color-primary)',
              textDecoration: 'none',
              borderBottom: '1px solid var(--line)',
              paddingBottom: 1,
            }}
          >
            Privacy Policy
          </Link>
        </p>
      </main>
    </div>
  )
}
