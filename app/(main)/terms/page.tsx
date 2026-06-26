import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | BaseNote',
  description: 'The BaseNote User Agreement. Terms governing your use of the app.',
}

export default function TermsPage() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px', color: 'var(--text)', lineHeight: '1.6' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, marginBottom: 24 }}>Terms of Service</h1>

      <p style={{ marginBottom: 16, fontSize: 14, color: 'var(--text-muted)' }}>
        Last updated: June 21, 2026
      </p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>1. Acceptance of Terms</h2>
        <p>
          By accessing, downloading, or using BaseNote (the "App"), you agree to be bound by these
          Terms of Service ("Terms"). If you do not agree to these Terms, do not use the App.
        </p>
        <p style={{ marginTop: 12 }}>
          BaseNote is provided "as is" and "as available" without warranty. We reserve the right to
          modify these Terms at any time. Your continued use of the App after changes constitutes acceptance
          of the updated Terms.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>2. Governing Law &amp; Jurisdiction</h2>
        <p>
          These Terms are governed by the laws of the Republic of Ireland and the European Union. You
          consent to the exclusive jurisdiction of Irish courts for any disputes arising from this App.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>3. Age Requirement</h2>
        <p>
          You must be at least 13 years old to use BaseNote. If you are under 13, you must have
          parental or guardian consent. We do not knowingly collect personal information from users
          under 13 without such consent.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>4. Permitted Use</h2>
        <p style={{ marginBottom: 12 }}>
          BaseNote is licensed for your personal, non-commercial use only. You agree that you will not:
        </p>
        <ul style={{ marginLeft: 20, marginTop: 8 }}>
          <li style={{ marginBottom: 6 }}>Scrape, crawl, or extract fragrance catalogue data for commercial purposes</li>
          <li style={{ marginBottom: 6 }}>Use the Aura layering intelligence or recommendations for resale or commercial distribution</li>
          <li style={{ marginBottom: 6 }}>Reverse-engineer, decompile, or attempt to derive the source code</li>
          <li style={{ marginBottom: 6 }}>Use the App to compete with BaseNote or build a derivative service</li>
          <li style={{ marginBottom: 6 }}>Modify, translate, or create derivative versions of the App</li>
          <li style={{ marginBottom: 6 }}>Remove or obscure any proprietary notices, labels, or marks</li>
          <li>Violate any applicable laws or regulations in your jurisdiction</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>5. Fragrance Content &amp; Disclaimer</h2>
        <p style={{ marginBottom: 12 }}>
          BaseNote contains fragrance descriptions, "inspired-by" mappings, and recommendations
          based on community feedback and olfactory analysis. These are provided for informational
          purposes only and:
        </p>
        <ul style={{ marginLeft: 20, marginTop: 8 }}>
          <li style={{ marginBottom: 6 }}>Are not guaranteed to be accurate or complete</li>
          <li style={{ marginBottom: 6 }}>Do not constitute professional fragrance consultation</li>
          <li style={{ marginBottom: 6 }}>Do not imply official endorsement or affiliation with any brand</li>
          <li style={{ marginBottom: 6 }}>May change without notice if community feedback is updated</li>
        </ul>
        <p style={{ marginTop: 12 }}>
          <strong>Always sample a fragrance before purchasing a full-size bottle.</strong> Individual scent
          preferences vary based on body chemistry, and what smells good on one person may not work for another.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>6. Affiliate Disclosure</h2>
        <p style={{ marginBottom: 12 }}>
          BaseNote may contain links to fragrance retailers and e-commerce sites. Some of these links
          are affiliate links, meaning:
        </p>
        <ul style={{ marginLeft: 20, marginTop: 8 }}>
          <li style={{ marginBottom: 6 }}>BaseNote earns a small commission if you purchase through these links</li>
          <li style={{ marginBottom: 6 }}>There is no additional cost to you</li>
          <li>We clearly disclose affiliate relationships wherever they appear</li>
        </ul>
        <p style={{ marginTop: 12 }}>
          By clicking an affiliate link, you acknowledge that you understand this relationship and consent
          to our participation in affiliate programs.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>7. User-Generated Content</h2>
        <p style={{ marginBottom: 12 }}>
          Any content you contribute to BaseNote (e.g., custom collection names, scent memories,
          layering notes) is subject to the following:
        </p>
        <ul style={{ marginLeft: 20, marginTop: 8 }}>
          <li style={{ marginBottom: 6 }}>You retain ownership of your content</li>
          <li style={{ marginBottom: 6 }}>You grant BaseNote a non-exclusive license to use, store, and display it</li>
          <li>You warrant that your content does not infringe third-party rights</li>
        </ul>
        <p style={{ marginTop: 12 }}>
          We reserve the right to remove content that is illegal, abusive, or violates these Terms.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>8. Limitation of Liability</h2>
        <p style={{ marginBottom: 12 }}>
          <strong>TO THE MAXIMUM EXTENT PERMITTED BY LAW, BASENOTE IS NOT LIABLE FOR:</strong>
        </p>
        <ul style={{ marginLeft: 20, marginTop: 8 }}>
          <li style={{ marginBottom: 6 }}>Allergic reactions or skin sensitivities from fragrances recommended by the App</li>
          <li style={{ marginBottom: 6 }}>Financial losses or overpayment resulting from fragrance purchases</li>
          <li style={{ marginBottom: 6 }}>Inaccurate fragrance descriptions or "inspired-by" mappings</li>
          <li style={{ marginBottom: 6 }}>Loss of data, service interruptions, or unavailability of the App</li>
          <li style={{ marginBottom: 6 }}>Any indirect, incidental, special, or consequential damages</li>
          <li>Third-party disputes arising from purchases made through affiliate links</li>
        </ul>
        <p style={{ marginTop: 12 }}>
          <strong>Your sole remedy is to stop using the App.</strong> This limitation applies even if
          BaseNote has been advised of the possibility of such damages.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>9. Indemnification</h2>
        <p>
          You agree to indemnify, defend, and hold harmless BaseNote and its creators from any claims,
          damages, or costs (including legal fees) arising from your use of the App, violation of these Terms,
          or infringement of any third-party rights.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>10. Termination</h2>
        <p style={{ marginBottom: 12 }}>
          We may terminate or suspend your access to BaseNote at any time, with or without cause, if:
        </p>
        <ul style={{ marginLeft: 20, marginTop: 8 }}>
          <li style={{ marginBottom: 6 }}>You violate these Terms</li>
          <li style={{ marginBottom: 6 }}>You engage in abusive or malicious behavior</li>
          <li>We reasonably believe your use poses a risk to other users or the App</li>
        </ul>
        <p style={{ marginTop: 12 }}>
          Upon termination, you lose the right to use the App. Data associated with your account may be
          deleted in accordance with our Privacy Policy.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>11. No Warranty</h2>
        <p>
          THE APP IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT ANY WARRANTY, EXPRESS OR IMPLIED.
          WE DISCLAIM ALL WARRANTIES INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
          AND NON-INFRINGEMENT. WE DO NOT GUARANTEE THAT THE APP WILL BE ERROR-FREE, SECURE, OR
          UNINTERRUPTED.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>12. Modifications to the App</h2>
        <p>
          BaseNote reserves the right to modify, suspend, or discontinue any feature or the entire App
          at any time without notice. We are not liable for any loss or damage resulting from these changes.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>13. Entire Agreement</h2>
        <p>
          These Terms, together with our Privacy Policy, constitute the entire agreement between you and
          BaseNote regarding your use of the App. Any other terms or conditions are superseded by this agreement.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>14. Contact</h2>
        <p>
          For questions about these Terms or to report violations, contact us at{' '}
          <a href="mailto:christophergoslin@outlook.com" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
            christophergoslin@outlook.com
          </a>.
        </p>
      </section>

      <div style={{ marginTop: 48, borderTop: '1px solid var(--line)', paddingTop: 24 }}>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
          By using this app, you acknowledge that you have read, understood, and accept these Terms of Service.
        </p>
      </div>
    </div>
  )
}
