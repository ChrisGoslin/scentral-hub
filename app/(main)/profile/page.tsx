'use client'

export default function ProfilePage() {
  const userStats = [
    { label: 'Collection Size', value: '76' },
    { label: 'Signature Layers', value: '12' },
    { label: 'Scent Identity', value: 'Resinous / Woody' },
  ]

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 px-6 py-12">
      <div className="max-w-md mx-auto space-y-12">
        <header className="space-y-4 text-center">
          <div className="w-24 h-24 bg-stone-200 rounded-full mx-auto border-2 border-white shadow-sm flex items-center justify-center">
            <span className="text-stone-400 font-serif text-3xl">CG</span>
          </div>
          <div className="space-y-1">
            <h1 className="editorial-title text-4xl">Christopher</h1>
            <p className="text-stone-500 text-sm uppercase tracking-[0.2em]">Curator of Atmosphere</p>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-4">
          {userStats.map((stat) => (
            <div key={stat.label} className="luxury-card p-6 flex justify-between items-center">
              <span className="text-stone-500 text-xs uppercase tracking-widest font-medium">{stat.label}</span>
              <span className="text-stone-900 font-serif text-lg">{stat.value}</span>
            </div>
          ))}
        </section>

        <section className="space-y-6">
          <h2 className="editorial-title text-2xl">Preferences</h2>
          <div className="luxury-card divide-y divide-stone-100">
            <div className="p-6 flex justify-between items-center">
              <div>
                <p className="text-stone-900 text-sm font-medium">Auto-apply Layering Rules</p>
                <p className="text-stone-500 text-xs mt-1">Automatically suggest anchors for top notes</p>
              </div>
              <div className="w-10 h-5 bg-stone-200 rounded-full relative">
                <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" />
              </div>
            </div>
            <div className="p-6 flex justify-between items-center">
              <div>
                <p className="text-stone-900 text-sm font-medium">Anosmia Warnings</p>
                <p className="text-stone-500 text-xs mt-1">Notify when ARR is High or Medium</p>
              </div>
              <div className="w-10 h-5 bg-[#c49a3c] rounded-full relative">
                <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" />
              </div>
            </div>
          </div>
        </section>

        <footer className="pt-12 text-center">
          <button className="text-stone-400 text-[10px] uppercase tracking-[0.3em] font-bold hover:text-stone-600 transition-colors">
            Sign Out — End Session
          </button>
        </footer>
      </div>
    </div>
  )
}
