import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | BaseNote',
  description: 'How we handle your data at BaseNote. GDPR and UK GDPR compliant.',
}

export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px', color: 'var(--text)', lineHeight: '1.6' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, marginBottom: 24 }}>Privacy Policy</h1>

      <p style={{ marginBottom: 16, fontSize: 14, color: 'var(--text-muted)' }}>
        Last updated: June 26, 2026
      </p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>1. What We Collect</h2>
        <p style={{ marginBottom: 12 }}>
          <strong>BaseNote does not require an account.</strong> You can use the app without providing
          any personal information. We do not store your email address or name in our database.
        </p>
        <p>
          Your fragrance collection, ratings, layering combinations, and wear logs are stored locally on
          your device using your browser's <code style={{ background: 'var(--surface-2)', padding: '2px 4px', borderRadius: 2 }}>localStorage</code>.
          This data never leaves your device unless you explicitly choose to sync it.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>2. Anonymous Identity</h2>
        <p>
          On first load, BaseNote generates a unique UUID (<code style={{ background: 'var(--surface-2)', padding: '2px 4px', borderRadius: 2 }}>scentral_anon_id</code>)
          and stores it in your browser. This ID is used to:
        </p>
        <ul style={{ marginLeft: 20, marginTop: 8 }}>
          <li style={{ marginBottom: 6 }}>Group your wear logs and collection activity (if you choose to save these)</li>
          <li style={{ marginBottom: 6 }}>Sync data across devices if you use the sync feature</li>
          <li>Track your anonymized engagement for analytics</li>
        </ul>
        <p style={{ marginTop: 12 }}>
          This UUID contains no personally identifiable information and is not linked to your name, email, or device.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>3. Server-Stored Data (Optional)</h2>
        <p style={{ marginBottom: 12 }}>
          Some features require us to store data on our servers (Supabase):
        </p>
        <ul style={{ marginLeft: 20, marginTop: 8 }}>
          <li style={{ marginBottom: 6 }}>Your <strong>wear logs</strong> (fragrances you logged as worn today)</li>
          <li style={{ marginBottom: 6 }}>Your <strong>collection</strong> (fragrances you've added, with affinity scores)</li>
          <li style={{ marginBottom: 6 }}>Your <strong>streak data</strong> (consecutive days worn)</li>
          <li>Your <strong>XP progress</strong> (engagement level)</li>
        </ul>
        <p style={{ marginTop: 12 }}>
          This server data is associated only with your anonymous UUID, not your personal identity.
          We store this data to enable features like wear streak tracking and synchronized collections across devices.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>4. Analytics &amp; Telemetry</h2>
        <p style={{ marginBottom: 12 }}>
          We use <strong>PostHog</strong> for anonymized event tracking. We collect:
        </p>
        <ul style={{ marginLeft: 20, marginTop: 8 }}>
          <li style={{ marginBottom: 6 }}>App events (page views, button clicks, feature usage)</li>
          <li style={{ marginBottom: 6 }}>Device type and browser (to ensure compatibility)</li>
          <li style={{ marginBottom: 6 }}>Aggregated usage patterns (e.g., "50% of users visit /discover first")</li>
        </ul>
        <p style={{ marginTop: 12 }}>
          We do <strong>not</strong> collect:
        </p>
        <ul style={{ marginLeft: 20, marginTop: 8 }}>
          <li style={{ marginBottom: 6 }}>Specific fragrance names you search for</li>
          <li style={{ marginBottom: 6 }}>Your exact wear logs or collection contents</li>
          <li style={{ marginBottom: 6 }}>Email addresses or personal identifiers</li>
          <li style={{ marginBottom: 6 }}>Geolocation data</li>
        </ul>
        <p style={{ marginTop: 12 }}>
          We respect the "Do Not Track" (DNT) header in your browser. If you enable DNT, we do not log events.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>5. Cookies &amp; Local Storage</h2>
        <p style={{ marginBottom: 12 }}>
          We use browser storage for the following non-personal data:
        </p>
        <ul style={{ marginLeft: 20, marginTop: 8 }}>
          <li><code style={{ background: 'var(--surface-2)', padding: '2px 4px', borderRadius: 2 }}>scentral_anon_id</code> — your anonymous UUID</li>
          <li><code style={{ background: 'var(--surface-2)', padding: '2px 4px', borderRadius: 2 }}>scentral_persona</code> — your chosen scent persona</li>
          <li><code style={{ background: 'var(--surface-2)', padding: '2px 4px', borderRadius: 2 }}>scentral_onboarded</code> — whether you completed onboarding</li>
          <li><code style={{ background: 'var(--surface-2)', padding: '2px 4px', borderRadius: 2 }}>as_xp</code> — your XP progress (cached locally)</li>
        </ul>
        <p style={{ marginTop: 12 }}>
          No cookies are used for tracking purposes. All cookies are strictly functional.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>6. Third-Party Services</h2>
        <p>
          BaseNote uses the following third-party services:
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
          BaseNote contains links to fragrance retailers. Some of these are affiliate links, which
          earn BaseNote a small commission if you purchase through them at no additional cost to you.
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
          <li style={{ marginBottom: 6 }}><strong>Right to Erasure:</strong> Request deletion of your data ("right to be forgotten")</li>
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
          To delete your BaseNote data:
        </p>
        <ul style={{ marginLeft: 20, marginTop: 8 }}>
          <li style={{ marginBottom: 6 }}>Clear your browser's localStorage and cookies</li>
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
          an in-app notification or banner. Your continued use of BaseNote after changes constitutes
          acceptance of the updated policy.
        </p>
      </section>

      <div style={{ marginTop: 48, borderTop: '1px solid var(--line)', paddingTop: 24 }}>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
          By using BaseNote, you acknowledge that you have read and understood this Privacy Policy.
        </p>
      </div>
    </div>
  )
}
