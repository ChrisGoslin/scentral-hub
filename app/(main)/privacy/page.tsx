import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | AnotherSense',
  description: 'How we handle your data at AnotherSense.',
}

export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px', color: 'var(--text)', lineHeight: '1.6' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, marginBottom: 24 }}>Privacy Policy</h1>
      
      <p style={{ marginBottom: 16 }}>
        Last updated: June 17, 2026
      </p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>1. Data Sovereignty</h2>
        <p>
          At AnotherSense, we believe your fragrance collection is private. Most of your data—including your 
          fragrance ratings, collections, and custom combinations—is processed and stored locally on your 
          device using <strong>localStorage</strong>.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>2. Anonymized Telemetry</h2>
        <p>
          We use anonymized telemetry (via PostHog) to understand how the app is used. We do <strong>not</strong> 
          capture search strings, email addresses, or unique hardware identifiers. We strictly respect 
          native browser "Do Not Track" headers.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>3. GDPR Compliance</h2>
        <p>
          We comply with Irish and UK GDPR standards. Since we do not store personal identifiers in a 
          central database by default, your "Right to be Forgotten" is handled by clearing your 
          browser data or deleting the app.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>4. Third-Party Services</h2>
        <p>
          Our application uses Supabase for infrastructure. When you use the "AURA" AI features, 
          anonymized fragrance data may be processed by our inference partners to generate 
          layering recommendations.
        </p>
      </section>

      <div style={{ marginTop: 48, borderTop: '1px solid var(--line)', paddingTop: 24 }}>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
          Questions? Reach out via the AnotherSense Community.
        </p>
      </div>
    </div>
  )
}
