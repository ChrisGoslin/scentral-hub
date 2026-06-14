import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

const QUICK_LINKS = [
  { label: 'My Bottles', sub: 'Browse and track your collection', href: '/collection' },
  { label: 'Layer Builder', sub: 'Combine two scents that work together', href: '/layering' },
  { label: 'Find a Scent', sub: 'Explore 280+ fragrances by feel', href: '/collection?browse=true' },
  { label: 'Compare Scents', sub: 'See how similar two fragrances really are', href: '/dna-match' },
]

export const dynamic = 'force-dynamic'

export default async function Home() {
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)

  const [{ count: totalCount }, { count: ownedCount }, { count: inspiredByCount }] = await Promise.all([
    supabase.from('fragrances').select('*', { count: 'exact', head: true }),
    supabase.from('fragrances').select('*', { count: 'exact', head: true }).eq('is_user_created', false).not('rating', 'is', null),
    supabase.from('fragrances').select('*', { count: 'exact', head: true }).not('inspired_by', 'is', null),
  ])

  const STATS = [
    { value: String(ownedCount ?? 106), label: 'In your collection' },
    { value: String(totalCount ?? 282), label: 'Scents to explore' },
    { value: String(inspiredByCount ?? '76'), label: 'Inspired-by alternatives' },
  ]

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col items-center transition-colors duration-700">
      <main className="max-w-6xl w-full px-6 pt-20 pb-10 grid grid-cols-1 md:grid-cols-2 gap-20 items-center fade-up">

        {/* Left — hero copy */}
        <section className="space-y-10">
          <div>
            <div className="w-12 h-0.5 bg-[var(--accent)] mb-6" />
            <p className="text-[10px] uppercase tracking-[0.4em] text-[var(--text-muted)] font-bold">Scentral</p>
          </div>

          <div className="space-y-6">
            <h1 className="text-5xl md:text-7xl font-serif italic leading-tight tracking-tight">
              You already<br />
              <span className="text-[var(--text-muted)]">know what you like.</span>
            </h1>
            <p className="text-[var(--text-muted)] max-w-xl text-lg font-light leading-relaxed">
              Scentral helps you find more of it — discover inspired-by alternatives, build combinations that last all day, and track the bottles you love.
            </p>
          </div>

          <div className="flex flex-wrap gap-6 items-center">
            <Link
              href="/collection"
              className="bg-[var(--accent)] text-white px-10 py-4 rounded-[var(--r-btn)] shadow-sm transition-all hover:bg-[var(--accent-press)] active:scale-95 font-bold uppercase tracking-widest text-[10px]"
            >
              My Bottles
            </Link>
            <Link
              href="/layering"
              className="text-[var(--text)] border-b border-[var(--text)] pb-1 hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all uppercase tracking-[0.2em] text-[10px] font-bold"
            >
              Try Layering
            </Link>
          </div>
        </section>

        {/* Right — catalogue card */}
        <aside className="flex flex-col gap-6">
          <div className="bg-[var(--surface)] border border-[var(--line)] p-8 space-y-8">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--text-muted)] font-bold mb-1">What's inside</p>
              <p className="text-[13px] text-[var(--text-muted)] font-light">Fragrances you know. Alternatives you don't — yet.</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {STATS.map(({ value, label }) => (
                <div key={label} className="text-center">
                  <p className="text-3xl font-bold text-[var(--accent)] font-serif">{value}</p>
                  <p className="text-[9px] uppercase tracking-widest text-[var(--text-muted)] mt-1 font-bold leading-tight">{label}</p>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-[var(--line)] space-y-3">
              {[
                { label: 'Warm & rich', hint: 'Oud · Amber · Musk · Leather' },
                { label: 'Fresh & elegant', hint: 'Florals · Spice · Citrus' },
                { label: 'Bold & lasting', hint: 'Resin · Wood · Aquatic' },
              ].map(({ label, hint }) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-[11px] font-bold text-[var(--text)]">{label}</span>
                  <span className="text-[10px] text-[var(--text-muted)]">{hint}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </main>

      {/* The Christopher Moment */}
      <section className="max-w-6xl w-full px-6 py-20 grid grid-cols-1 md:grid-cols-2 gap-10 items-center border-y border-[var(--line)] my-10 bg-[var(--surface-subtle)]">
        {/* Left Side — Story Card */}
        <div className="bg-[var(--surface)] border border-[var(--line)] p-10 space-y-6 shadow-sm">
          <div>
            <p className="text-[10px] text-[var(--accent)] uppercase tracking-[0.3em] font-bold mb-4">How it starts</p>
            <h2 className="text-3xl font-serif leading-tight tracking-tight italic">
              "Your colleague pulls out a bottle."
            </h2>
          </div>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed font-light">
            You recognise the scent immediately. It's your signature — the one you only buy on sale. 
            He paid €18. You paid €140. 
            <br /><br />
            That's the inspired-by world. Scentral maps it.
          </p>
          <Link 
            href="/discover" 
            className="inline-block text-[10px] font-bold uppercase tracking-widest text-[var(--accent)] border-b border-[var(--accent)] pb-1 transition-all hover:pr-2"
          >
            See the alternatives →
          </Link>
        </div>

        {/* Right Side — Mini Cards */}
        <div className="space-y-4">
          {[
            { name: 'Lattafa Asad', inspired: 'Smells like Creed Aventus' },
            { name: 'Afnan 9PM', inspired: 'Smells like Paco Rabanne Invictus' },
            { name: 'Armaf Club de Nuit', inspired: 'Smells like Creed Aventus Silver Mountain' },
          ].map((item, idx) => (
            <div key={idx} className="bg-[var(--surface)] border-l-2 border-[var(--accent)] p-4 shadow-sm flex flex-col justify-center">
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--text)]">{item.name}</p>
              <p className="text-[11px] text-[var(--text-muted)] font-light mt-1 italic">{item.inspired}</p>
            </div>
          ))}
          <p className="text-[12px] text-[var(--text-muted)] font-light mt-4 px-1">
            + {Math.max(0, (inspiredByCount ?? 76) - 3)} more in the catalogue
          </p>
        </div>
      </section>

      {/* Bottom Nav / Quick Links */}
      <section className="max-w-6xl w-full px-6 pb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
    </div>
  )
}

