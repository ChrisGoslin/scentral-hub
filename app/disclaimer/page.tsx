// app/disclaimer/page.tsx

export default function DisclaimerPage() {
  const sections = [
    {
      heading: 'Fragrance Suggestions',
      body: 'Application zones, spritz counts, layering combinations, and anosmia risk ratings are based on general fragrance community knowledge and hobbyist research. They are not clinical recommendations. Individual skin chemistry, sensitivity, and health conditions vary — what works for one person may not suit another.',
    },
    {
      heading: 'Anosmia Risk Ratings',
      body: 'The ARR system indicates community-reported likelihood of olfactory fatigue from overuse. It is not a medical assessment and does not account for individual health conditions or neurological factors.',
    },
    {
      heading: 'Layering Protocols',
      body: 'Aroma chemical references are for educational context only. They are not instructions to apply raw chemicals to skin. Always use commercially formulated fragrances as directed by their manufacturers.',
    },
    {
      heading: 'Patch Testing',
      body: 'Always patch test a new fragrance before full application. Apply a small amount to the inside of your wrist and wait 24 hours. Discontinue use if irritation occurs.',
    },
    {
      heading: 'Allergies and Skin Conditions',
      body: 'If you have known fragrance allergies, sensitive skin, eczema, psoriasis, or any respiratory condition, consult a dermatologist before following any application guidance in this app.',
    },
    {
      heading: 'No Liability',
      body: 'Scentral and its creator accept no liability for adverse reactions, skin irritation, or any harm arising from fragrance application based on suggestions in this tool. Use at your own discretion.',
    },
    {
      heading: 'About Scentral',
      body: 'Scentral is an independent hobby project. It is not affiliated with, endorsed by, or connected to any fragrance brand or retailer mentioned within the app.',
    },
  ]

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <header className="mb-16 border-b border-stone-200 pb-8">
          <h1 className="editorial-title text-4xl mb-4">Disclaimer &amp; Terms</h1>
          <p className="text-stone-500 text-sm uppercase tracking-[0.2em]">Safety and hobbyist boundaries</p>
        </header>

        <div className="space-y-12">
          {sections.map(({ heading, body }) => (
            <section key={heading} className="luxury-card p-8">
              <h2 className="editorial-title text-2xl mb-4 text-[#c49a3c]">{heading}</h2>
              <p className="text-stone-600 text-sm leading-relaxed font-serif italic">
                {body}
              </p>
            </section>
          ))}
        </div>

        <footer className="mt-20 pt-8 border-t border-stone-200 text-center">
          <p className="text-stone-400 text-[10px] uppercase tracking-[0.3em] font-bold">
            Scentral · Usage Agreement
          </p>
        </footer>
      </div>
    </div>
  )
}
