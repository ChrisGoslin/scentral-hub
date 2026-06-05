// @ts-nocheck
'use client';

// The Wardrobe — your personal olfactory sanctuary.
// Requires login. Reads/writes to the `fragrances` table in Supabase.
// Supabase Row Level Security ensures you only see your own entries.

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { Fragrance } from '@/lib/types';
import AudioChord from '../components/AudioChord';
import TheExhibition from '../components/TheExhibition';

const STAR_LABELS: Record<number, string> = {
  1: 'Weak Presence',
  2: 'Fair Resonance',
  3: 'Balanced Harmony',
  4: 'Great Distinction',
  5: 'Outstanding Masterpiece',
};

export default function WardrobePage() {
  const supabase = createClient();
  // ── Auth state ─────────────────────────────────────────────────────────────
  const [authLoading, setAuthLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // ── Fragrance list ─────────────────────────────────────────────────────────
  const [fragrances, setFragrances] = useState<Fragrance[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  // ── UI state ───────────────────────────────────────────────────────────────
  const [showEnshrineForm, setShowEnshrineSection] = useState(false);

  // ── Enshrine-Scent form ────────────────────────────────────────────────────
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState(3);
  const [isPublic, setIsPublic] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user.id ?? null);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id ?? null);
      setAuthLoading(false);
      if (!session) setFragrances([]);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadFragrances = useCallback(async () => {
    if (!userId) return;
    setListLoading(true);
    setListError(null);

    const { data, error } = await supabase
      .from('fragrances')
      .select('id, user_id, name, brand, notes, rating, is_public, created_at, image_url')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      setListError(error.message);
    } else {
      setFragrances(data ?? []);
    }
    setListLoading(false);
  }, [userId]);

  useEffect(() => {
    if (userId) loadFragrances();
  }, [userId, loadFragrances]);

  async function handleEnshrine(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    setFormError(null);

    const { data: inserted, error } = await supabase
      .from('fragrances')
      .insert({
        user_id: userId,
        name: name.trim(),
        brand: brand.trim() || null,
        notes: notes.trim() || null,
        rating,
        is_public: isPublic,
      })
      .select()
      .single();

    if (error) {
      setFormError(error.message);
    } else {
      setFragrances((prev) => [inserted as Fragrance, ...prev]);
      setName('');
      setBrand('');
      setNotes('');
      setRating(3);
      setShowEnshrineSection(false);
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    const deleted = fragrances.find((f) => f.id === id);
    setFragrances((prev) => prev.filter((f) => f.id !== id));

    const { error } = await supabase.from('fragrances').delete().eq('id', id);

    if (error) {
      if (deleted) setFragrances((prev) => [deleted, ...prev]);
      setListError(`Enshrinement removal failed: ${error.message}`);
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center text-stone-400">
        <p className="animate-pulse">Consulting the archives...</p>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-screen bg-stone-50 text-stone-900 flex items-center justify-center p-6">
        <main className="max-w-md w-full text-center space-y-6">
          <h1 className="text-4xl font-serif italic tracking-tight">The Wardrobe</h1>
          <p className="text-stone-500 text-lg">
            Your personal fragrance sanctuary is reserved for registered curators.
          </p>
          <a
            href="/login"
            className="inline-block bg-[#c49a3c] text-white px-8 py-3 rounded-full font-bold transition hover:bg-[#a07d30] shadow-sm"
          >
            Sign in to access
          </a>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#06070a] via-[#071022] to-[#0b0f13] text-white">
      <main className="max-w-6xl mx-auto px-6 py-16">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <h1 className="text-5xl font-bold tracking-tight">The Wardrobe</h1>
            <p className="text-slate-400 text-lg">
              A private chronicle of your olfactory journey.
            </p>
          </div>
          <button
            onClick={() => setShowEnshrineSection(!showEnshrineForm)}
            className="inline-flex items-center gap-2 bg-slate-800 border border-slate-700 hover:border-amber-400/50 hover:bg-slate-700 px-6 py-3 rounded-full transition text-sm font-medium z-10 relative"
          >
            {showEnshrineForm ? 'Close Portal' : 'Enshrine a Scent'}
            <span className="text-amber-400">{showEnshrineForm ? '×' : '＋'}</span>
          </button>
        </header>

        {/* ── Top 10 Visual Shelf (The Exhibition) ── */}
        {!listLoading && !listError && fragrances.length > 0 && (
          <TheExhibition fragrances={fragrances} />
        )}

        {/* ── Enshrine Section ── */}
        {showEnshrineForm && (
          <section className="mb-16 fade-up bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl">
            <h2 className="text-2xl font-semibold mb-6">New Enshrinement</h2>
            <form onSubmit={handleEnshrine} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">
                    Nomenclature *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Oud Wood"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-400/50 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">
                    Maison
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Tom Ford"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-400/50 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">
                    Resonance: {rating} / 5 — {STAR_LABELS[rating]}
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                </div>
              </div>

              <div className="space-y-6 flex flex-col">
                <div className="flex-1">
                  <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">
                    Olfactory Impressions
                  </label>
                  <textarea
                    placeholder="Describe the evolution, the chemistry, the soul of the scent..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-400/50 transition resize-none h-full"
                  />
                </div>
                
                <div className="flex items-center justify-between gap-4 mt-auto">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="isPublic"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      className="w-5 h-5 rounded-md border-slate-700 bg-slate-800 text-amber-400 focus:ring-0"
                    />
                    <label htmlFor="isPublic" className="text-sm text-slate-400 cursor-pointer select-none">
                      Broadcast to Community
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-amber-400 text-slate-900 px-8 py-3 rounded-xl font-bold hover:bg-amber-300 transition shadow-lg disabled:opacity-50"
                  >
                    {saving ? 'Enshrining...' : 'Enshrine'}
                  </button>
                </div>
              </div>
              
              {formError && (
                <p className="col-span-full text-red-400 text-sm mt-2 flex items-center gap-2">
                  <span>⚠</span> {formError}
                </p>
              )}
            </form>
          </section>
        )}

        {/* ── Collection Grid ── */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-semibold">Your Curated Collection ({fragrances.length})</h2>
          </div>

          {listError && (
            <div className="bg-red-950/20 border border-red-900/50 text-red-300 p-6 rounded-2xl mb-8 flex items-center justify-between">
              <p><strong>A disturbance in the archives:</strong> {listError}</p>
              <button
                onClick={loadFragrances}
                className="text-xs uppercase tracking-widest font-bold border border-red-900/50 px-4 py-2 rounded-lg hover:bg-red-900/30 transition"
              >
                Retry
              </button>
            </div>
          )}

          {listLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-48 bg-slate-900/50 border border-slate-800 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : fragrances.length === 0 && !listError ? (
            <div className="text-center py-20 bg-slate-900/30 border border-dashed border-slate-800 rounded-3xl">
              <p className="text-slate-500 text-lg">No scents have been enshrined yet.</p>
              <button 
                onClick={() => setShowEnshrineSection(true)}
                className="mt-4 text-amber-400 hover:text-amber-300 font-medium transition"
              >
                Begin your chronicle →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {fragrances.map((f) => (
                <div
                  key={f.id}
                  className="group relative bg-slate-900/40 border border-slate-800/80 hover:border-amber-400/30 rounded-3xl p-6 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-900/10"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1 flex-1 min-w-0">
                      <p className="text-2xl font-semibold truncate group-hover:text-amber-50">{f.name}</p>
                      {f.brand && (
                        <p className="text-slate-400 font-medium tracking-wide uppercase text-xs">{f.brand}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(f.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-slate-600 hover:text-red-400 transition transition-opacity duration-300"
                      title="Remove from Wardrobe"
                    >
                      <span className="text-2xl">×</span>
                    </button>
                  </div>

                  {f.rating && (
                    <div className="mt-4 flex items-center gap-2">
                      <div className="flex text-amber-400/80 text-sm tracking-tighter">
                        {'★'.repeat(f.rating)}
                        <span className="text-slate-800">{'★'.repeat(5 - f.rating)}</span>
                      </div>
                      <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                        {STAR_LABELS[f.rating]}
                      </span>
                    </div>
                  )}

                  {f.notes && (
                    <p className="mt-4 text-slate-400 text-sm leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all">
                      {f.notes}
                    </p>
                  )}

                  <div className="mt-6 flex items-center justify-between">
                    <span
                      className={`text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full ${
                        f.is_public 
                          ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20' 
                          : 'bg-slate-800 text-slate-500 border border-slate-700'
                      }`}
                    >
                      {f.is_public ? 'Public Archive' : 'Private Journal'}
                    </span>
                    <span className="text-[10px] text-slate-600 font-mono italic">
                      {new Date(f.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
        
        <aside className="fixed bottom-8 right-8 z-50">
          <AudioChord />
        </aside>
      </main>
    </div>
  );
}
