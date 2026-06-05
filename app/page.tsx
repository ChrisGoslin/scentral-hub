'use client'

import Link from 'next/link'
import AudioChord from './components/AudioChord'

const STATS = [
  { value: '76', label: 'Fragrances' },
  { value: '3072', label: 'Resonance dims' },
  { value: '4', label: 'Layering protocols' },
]

const QUICK_LINKS = [
  { label: 'The Wardrobe', sub: 'Browse & explore your collection', href: '/collection' },
  { label: 'The Atelier', sub: 'Formulate layering combinations', href: '/layering' },
  { label: 'The Ritual', sub: 'Plan your daily scent sequence', href: '/schedule' },
  { label: 'Resonance Engine', sub: 'Match olfactory DNA between fragrances', href: '/dna-match' },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex items-center justify-center transition-colors duration-700">
      <main className="max-w-6xl w-full px-6 py-20 grid grid-cols-1 md:grid-cols-2 gap-20 items-center fade-up">

        {/* Left — hero copy */}
        <section className="space-y-10">
          <div>
            <div className="w-12 h-0.5 bg-[var(--accent)] mb-6" />
            <p className="text-[10px] uppercase tracking-[0.4em] text-[var(--text-muted)] font-bold">Scentral</p>
          </div>

          <div className="space-y-6">
            <h1 className="text-5xl md:text-7xl font-serif italic leading-tight tracking-tight">
              Where notes<br />
              <span className="text-[var(--text-muted)]">compose memory</span>
            </h1>
            <p className="text-[var(--text-muted)] max-w-xl text-lg font-light leading-relaxed">
              A sensory-first tool for discovering fragrance pairings, building daily rituals, and understanding your collection.
            </p>
          </div>

          <div className="flex flex-wrap gap-6 items-center">
            <Link
              href="/collection"
              className="bg-[var(--accent)] text-white px-10 py-4 rounded-[var(--r-btn)] shadow-sm transition-all hover:bg-[var(--accent-press)] active:scale-95 font-bold uppercase tracking-widest text-[10px]"
            >
              Enter The Wardrobe
            </Link>
            <Link
              href="/layering"
              className="text-[var(--text)] border-b border-[var(--text)] pb-1 hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all uppercase tracking-[0.2em] text-[10px] font-bold"
            >
              Open The Atelier
            </Link>
          </div>

          {/* Quick nav grid */}
          <div className="grid grid-cols-2 gap-3">
            {QUICK_LINKS.map(({ label, sub, href }) => (
              <Link
                key={href}
                href={href}
                className="group bg-[var(--surface)] border border-[var(--line)] px-5 py-4 transition-all hover:border-[var(--accent)] shadow-sm"
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors">{label}</p>
                <p className="text-[11px] text-[var(--text-muted)] mt-1 font-light leading-snug">{sub}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Right — collection stat card */}
        <aside className="flex flex-col gap-6">
          <div className="bg-[var(--surface)] border border-[var(--line)] p-8 space-y-8">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--text-muted)] font-bold mb-1">The Collection</p>
              <p className="text-[13px] text-[var(--text-muted)] font-light">Live data. Personal intelligence.</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {STATS.map(({ value, label }) => (
                <div key={label} className="text-center">
                  <p className="text-3xl font-bold text-[var(--accent)] font-serif">{value}</p>
                  <p className="text-[9px] uppercase tracking-widest text-[var(--text-muted)] mt-1 font-bold">{label}</p>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-[var(--line)] space-y-3">
              {[
                { label: 'Phase 1 — Anchor', hint: 'Oud · Amber · Musk · Leather' },
                { label: 'Phase 2 — Modulator', hint: 'Florals · Spice · Resin' },
                { label: 'Phase 3 — Top', hint: 'Citrus · Aquatic · Fruit' },
              ].map(({ label, hint }) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-[11px] font-bold text-[var(--text)]">{label}</span>
                  <span className="text-[10px] text-[var(--text-muted)]">{hint}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <AudioChord />
          </div>
        </aside>

      </main>
    </div>
  )
}
