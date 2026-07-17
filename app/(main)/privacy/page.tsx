import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | nota.',
  description: 'How we handle your data at nota., in plain English.',
}

export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px', color: 'var(--text)', lineHeight: '1.6' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, marginBottom: 24 }}>Privacy Policy</h1>

      <p style={{ marginBottom: 16, fontSize: 14, color: 'var(--text-muted)' }}>
        Last updated: July 17, 2026
      </p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>1. What We Collect</h2>
        <p style={{ marginBottom: 12 }}>
          You can browse parts of nota. without an account. In that mode, your fragrance collection,
          ratings, layering combinations, and wear logs are stored locally on your device using your
          browser&apos;s <code style={{ background: 'var(--surface-2)', padding: '2px 4px', borderRadius: 2 }}>localStorage</code>, and never reach our servers.
        </p>
        <p>
          <strong>Signing in creates a real account and stores your data on our servers.</strong> Features
          like Shelf, Traces, and cross-device sync require signing in via Supabase Auth, which processes
          your email address to authenticate you. Once signed in, your collection, wear logs, Noseprint,
          and community activity are stored server-side, not just in your browser.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>2. Identity: Local vs. Signed-In</h2>
        <p style={{ marginBottom: 12 }}>
          nota. currently has two identity modes, which we are in the process of consolidating:
        </p>
        <ul style={{ marginLeft: 20, marginTop: 8 }}>
          <li style={{ marginBottom: 6 }}>
            <strong>Local/guest mode:</strong> a random ID stored in your browser groups locally-saved
            activity. It is not linked to your name or email, and never leaves your device.
          </li>
          <li>
            <strong>Signed-in mode:</strong> a real account (email + Supabase-managed session) that
            identifies you across devices and is required for server-stored features.
          </li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>3. Server-Stored Data (Signed-In Users)</h2>
        <p style={{ marginBottom: 12 }}>
          Once you sign in, we store the following on our servers (Supabase):
        </p>
        <ul style={{ marginLeft: 20, marginTop: 8 }}>
          <li style={{ marginBottom: 6 }}>Your <strong>account email</strong> (used only for authentication, via Supabase Auth)</li>
          <li style={{ marginBottom: 6 }}>Your <strong>wear logs</strong> (fragrances you logged as worn)</li>
          <li style={{ marginBottom: 6 }}>Your <strong>collection</strong> (fragrances you&apos;ve added, with affinity scores)</li>
          <li style={{ marginBottom: 6 }}>Your <strong>Noseprint, Shelf, and Traces activity</strong> (identity, ranking, and community features)</li>
          <li style={{ marginBottom: 6 }}>Your <strong>streak data</strong> (consecutive days worn)</li>
          <li>Your <strong>XP progress</strong> (engagement level)</li>
        </ul>
        <p style={{ marginTop: 12 }}>
          We store this data to enable the features you use — collection sync across devices, wear
          history, identity reflection, and community traces. We do not sell this data.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>4. Analytics &amp; Telemetry</h2>
        <p style={{ marginBottom: 12 }}>
          We use <strong>PostHog</strong> for product analytics, and it is <strong>off by default</strong>.
          Analytics only start recording after you explicitly consent via the in-app banner; nothing is
          sent to PostHog before that choice is made, and you can change your choice at any time. When
          consented, we collect:
        </p>
        <ul style={{ marginLeft: 20, marginTop: 8 }}>
          <li style={{ marginBottom: 6 }}>App events (page views, button clicks, feature usage)</li>
          <li style={{ marginBottom: 6 }}>Device type and browser (to ensure compatibility)</li>
          <li style={{ marginBottom: 6 }}>Aggregated usage patterns (e.g., &quot;50% of users visit /discover first&quot;)</li>
        </ul>
        <p style={{ marginTop: 12 }}>
          We do <strong>not</strong> send email addresses or account identifiers to PostHog.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>5. Cookies &amp; Local Storage</h2>
        <p style={{ marginBottom: 12 }}>
          We use browser storage for the following:
        </p>
        <ul style={{ marginLeft: 20, marginTop: 8 }}>
          <li style={{ marginBottom: 6 }}><code style={{ background: 'var(--surface-2)', padding: '2px 4px', borderRadius: 2 }}>nota_consent</code> — your analytics/error-tracking consent choice</li>
          <li style={{ marginBottom: 6 }}><code style={{ background: 'var(--surface-2)', padding: '2px 4px', borderRadius: 2 }}>scentral_anon_id</code> — local/guest-mode ID (see section 2)</li>
          <li style={{ marginBottom: 6 }}><code style={{ background: 'var(--surface-2)', padding: '2px 4px', borderRadius: 2 }}>scentral_persona</code> — your chosen scent persona</li>
          <li style={{ marginBottom: 6 }}><code style={{ background: 'var(--surface-2)', padding: '2px 4px', borderRadius: 2 }}>scentral_onboarded</code> — whether you completed onboarding</li>
          <li style={{ marginBottom: 6 }}><code style={{ background: 'var(--surface-2)', padding: '2px 4px', borderRadius: 2 }}>as_xp</code> — your XP progress (cached locally)</li>
          <li>Supabase session cookies — required to keep you signed in</li>
        </ul>
        <p style={{ marginTop: 12 }}>
          Session cookies are strictly functional. Analytics-related storage is only written after consent.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>6. Third-Party Services</h2>
        <p>
          nota. uses the following third-party services:
        </p>
        <ul style={{ marginLeft: 20, marginTop: 8 }}>
          <li style={{ marginBottom: 6 }}><strong>Supabase</strong> — database and authentication infrastructure</li>
          <li style={{ marginBottom: 6 }}><strong>Vercel</strong> — hosting and deployment</li>
          <li style={{ marginBottom: 6 }}><strong>PostHog</strong> — anonymized analytics</li>
          <li><strong>Anthropic (Claude)</strong> — AI-powered fragrance recommendations (Aura feature)</li>
        </ul>
        <p style={{ marginTop: 12 }}>
          When you use the Aura layering recommendation feature, anonymized fragrance data (not linked to
          your identity) may be sent to Anthropic to generate personalized suggestions. This data is not
          stored or used for training purposes.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>7. Affiliate Links</h2>
        <p style={{ marginBottom: 12 }}>
          nota. contains links to fragrance retailers. Some of these are affiliate links, which
          earn nota. a small commission if you purchase through them at no additional cost to you.
        </p>
        <p>
          We clearly disclose affiliate relationships wherever they appear. Your privacy is not affected
          by clicking these links.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>8. Your Rights (GDPR &amp; UK GDPR)</h2>
        <p style={{ marginBottom: 12 }}>
          Under Irish and UK GDPR, you have the following rights:
        </p>
        <ul style={{ marginLeft: 20, marginTop: 8 }}>
          <li style={{ marginBottom: 6 }}><strong>Right to Access:</strong> Request a copy of your personal data</li>
          <li style={{ marginBottom: 6 }}><strong>Right to Rectification:</strong> Correct inaccurate data</li>
          <li style={{ marginBottom: 6 }}><strong>Right to Erasure:</strong> Request deletion of your data (&quot;right to be forgotten&quot;)</li>
          <li style={{ marginBottom: 6 }}><strong>Right to Restrict Processing:</strong> Limit how we use your data</li>
          <li style={{ marginBottom: 6 }}><strong>Right to Portability:</strong> Request your data in a portable format</li>
          <li><strong>Right to Object:</strong> Opt out of analytics and processing</li>
        </ul>
        <p style={{ marginTop: 12 }}>
          To exercise any of these rights, contact us at <a href="mailto:christophergoslin@outlook.com" style={{ color: 'var(--accent)', textDecoration: 'none' }}>christophergoslin@outlook.com</a>.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>9. Data Deletion</h2>
        <p style={{ marginBottom: 12 }}>
          To delete your nota. data:
        </p>
        <ul style={{ marginLeft: 20, marginTop: 8 }}>
          <li style={{ marginBottom: 6 }}>Clear your browser&apos;s localStorage and cookies</li>
          <li style={{ marginBottom: 6 }}>This removes your local collection, preferences, and anonymous UUID</li>
          <li>Email us at <a href="mailto:christophergoslin@outlook.com" style={{ color: 'var(--accent)', textDecoration: 'none' }}>christophergoslin@outlook.com</a> to delete your server-stored data</li>
        </ul>
        <p style={{ marginTop: 12 }}>
          We will respond to deletion requests within 30 days.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>10. Data Controller &amp; Contact</h2>
        <p>
          <strong>Data Controller:</strong> Christopher Goslin, Ireland
        </p>
        <p style={{ marginTop: 8 }}>
          <strong>Contact for Privacy Inquiries:</strong> <a href="mailto:christophergoslin@outlook.com" style={{ color: 'var(--accent)', textDecoration: 'none' }}>christophergoslin@outlook.com</a>
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>11. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy at any time. We will notify you of material changes via
          an in-app notification or banner. Your continued use of nota. after changes constitutes
          acceptance of the updated policy.
        </p>
      </section>

      <div style={{ marginTop: 48, borderTop: '1px solid var(--line)', paddingTop: 24 }}>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
          By using nota., you acknowledge that you have read and understood this Privacy Policy.
        </p>
      </div>
    </div>
  )
}
