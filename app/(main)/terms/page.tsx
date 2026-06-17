import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | Scentral',
  description: 'The Scentral User Agreement.',
}

export default function TermsPage() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px', color: 'var(--text)', lineHeight: '1.6' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, marginBottom: 24 }}>Terms of Service</h1>
      
      <p style={{ marginBottom: 16 }}>
        Last updated: June 17, 2026
      </p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>1. Acceptance of Terms</h2>
        <p>
          By accessing or using Scentral, you agree to be bound by these terms. Scentral is a 
          digital fragrance wardrobe tool provided "as is".
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>2. Non-Commercial Use</h2>
        <p>
          Scentral is for personal, non-commercial use. You may not scrape our catalogue or use our 
          proprietary "AURA" layering intelligence for commercial purposes without explicit permission.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>3. Content Disclaimer</h2>
        <p>
          Fragrance "inspired-by" mappings are based on community consensus and olfactory analysis. 
          They are not definitive and do not imply official affiliation with any brand or perfume house.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>4. Limitation of Liability</h2>
        <p>
          Scentral is not responsible for any allergic reactions or financial losses resulting from 
          purchases made based on app recommendations. Always sample before buying a full bottle.
        </p>
      </section>

      <div style={{ marginTop: 48, borderTop: '1px solid var(--line)', paddingTop: 24 }}>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
          By using this app, you acknowledge that you have read and understood these terms.
        </p>
      </div>
    </div>
  )
}
