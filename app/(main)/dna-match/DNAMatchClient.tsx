'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AudioChord from '@/app/components/AudioChord';
import dynamic from 'next/dynamic';

const ChemistPanel = dynamic(() => import('@/components/ChemistPanel'), { ssr: false });

interface Fragrance {
  id: string;
  brand: string;
  name: string;
  family: string;
  image_url?: string | null;
}

interface DNAMatchResult {
  success: boolean;
  score: number;
  category: string;
  narrative: string;
  cached: boolean;
}

export default function CompareScentsClient({ fragrances }: { fragrances: Fragrance[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [fragA, setFragA] = useState<Fragrance | null>(null);
  const [fragB, setFragB] = useState<Fragrance | null>(null);
  const [result, setResult] = useState<DNAMatchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchA, setSearchA] = useState('');
  const [searchB, setSearchB] = useState('');

  // Deep-link: pre-seed from ?a=<id> (Collection "See similar" handoff)
  useEffect(() => {
    const aId = searchParams.get('a');
    if (!aId) return;
    const match = fragrances.find((f) => f.id === aId);
    if (match) setFragA(match);
  }, [searchParams, fragrances]);

  const filteredA = useMemo(
    () =>
      fragrances.filter(
        (f) =>
          `${f.brand} ${f.name}`.toLowerCase().includes(searchA.toLowerCase()) && f.id !== fragB?.id
      ),
    [searchA, fragB, fragrances]
  );

  const filteredB = useMemo(
    () =>
      fragrances.filter(
        (f) =>
          `${f.brand} ${f.name}`.toLowerCase().includes(searchB.toLowerCase()) && f.id !== fragA?.id
      ),
    [searchB, fragA, fragrances]
  );

  const handleFindMatch = async () => {
    if (!fragA || !fragB) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/dna-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fragrance_a_id: fragA.id,
          fragrance_b_id: fragB.id,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setResult(data);
      } else {
        console.error('Harmony check failed:', data.error);
      }
    } catch (error) {
      console.error('Request failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const categoryColor = result
    ? result.category.includes('Twin')
      ? 'var(--positive)'
      : result.category.includes('Strategic')
        ? 'var(--accent)'
        : result.category.includes('Homage')
          ? 'var(--burgundy)'
          : 'var(--text-muted)'
    : 'var(--accent)';

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100dvh' }}>
      {/* Flush header — matches Wardrobe / You */}
      <header className="px-4 pt-8 pb-4 md:px-6" style={{ borderBottom: '1px solid var(--line)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--text)', lineHeight: '34px' }}>
          Compare Scents
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
          Check the harmony between two fragrances and see how they work together.
        </p>
      </header>

      <div className="px-4 py-5 space-y-8 md:max-w-4xl md:mx-auto md:px-6 md:py-10 md:space-y-12">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-12 md:items-center">
          <FragrancePicker
            label="First Fragrance"
            selected={fragA}
            search={searchA}
            onSearchChange={setSearchA}
            filtered={filteredA}
            onSelect={setFragA}
          />

          <FragrancePicker
            label="Second Fragrance"
            selected={fragB}
            search={searchB}
            onSearchChange={setSearchB}
            filtered={filteredB}
            onSelect={setFragB}
          />
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleFindMatch}
            disabled={!fragA || !fragB || loading}
            className="w-full max-w-sm py-4 rounded-full font-bold text-lg transition-all shadow-md active:scale-95 disabled:cursor-not-allowed disabled:active:scale-100"
            style={
              !fragA || !fragB || loading
                ? { background: 'var(--surface-2)', color: 'var(--text-muted)' }
                : { background: 'var(--accent)', color: 'var(--bg)' }
            }
          >
            {loading ? 'Checking Harmony…' : 'Check Harmony'}
          </button>
        </div>

        {loading && (
          <div className="space-y-4 animate-pulse">
            <div className="h-40 rounded-3xl" style={{ background: 'var(--surface)' }} />
            <div className="h-6 w-1/3 mx-auto rounded" style={{ background: 'var(--surface)' }} />
          </div>
        )}

        {result && !loading && fragA && fragB && (
          <div className="fade-up border rounded-3xl p-8 md:p-10 shadow-sm text-center space-y-8" style={{ background: 'var(--surface)', borderColor: 'var(--line)' }}>
            <div className="flex items-center justify-center gap-4">
              <div className="text-right min-w-0">
                <p className="text-[10px] uppercase font-bold tracking-widest truncate" style={{ color: 'var(--text-muted)' }}>{fragA.brand}</p>
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{fragA.name}</p>
              </div>
              <span className="text-lg flex-shrink-0" style={{ color: 'var(--accent)' }}>×</span>
              <div className="text-left min-w-0">
                <p className="text-[10px] uppercase font-bold tracking-widest truncate" style={{ color: 'var(--text-muted)' }}>{fragB.brand}</p>
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{fragB.name}</p>
              </div>
            </div>

            <ScoreRing score={result.score} />

            <button
              onClick={() => router.push(`/layering?anchor=${fragA.id}&top=${fragB.id}`)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-sm transition-all hover:opacity-80 active:scale-95"
              style={{ background: 'var(--accent)', color: 'var(--bg)' }}
            >
              Try Layering These →
            </button>

            <div className="space-y-4">
              <div
                className="inline-block px-6 py-2 rounded-full border-2 font-bold text-sm uppercase tracking-widest"
                style={{ borderColor: categoryColor, color: categoryColor }}
              >
                {result.category}
              </div>

              <div className="max-w-xl mx-auto mt-2 p-6 rounded-2xl italic leading-relaxed border text-left" style={{ background: 'var(--bg)', color: 'var(--text-muted)', borderColor: 'var(--line)' }}>
                {result.narrative}
              </div>
            </div>

            {result.cached && <div className="text-[10px] font-mono tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>🔄 Match Found in Archives</div>}

            <ChemistPanel
              fragranceAId={fragA.id}
              fragranceBId={fragB.id}
              fragranceAName={fragA.name}
              fragranceBName={fragB.name}
            />
          </div>
        )}
      </div>

      <aside className="fixed right-4 z-50" style={{ bottom: 'calc(56px + env(safe-area-inset-bottom, 0px) + 16px)' }}>
        <AudioChord />
      </aside>
    </div>
  );
}

function FragrancePicker({
  label,
  selected,
  search,
  onSearchChange,
  filtered,
  onSelect,
}: {
  label: string;
  selected: Fragrance | null;
  search: string;
  onSearchChange: (s: string) => void;
  filtered: Fragrance[];
  onSelect: (f: Fragrance | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handle(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('pointerdown', handle);
    return () => document.removeEventListener('pointerdown', handle);
  }, [open]);

  return (
    <div ref={ref} className="relative space-y-3">
      <label className="block text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{label}</label>

      {!selected ? (
        <input
          type="text"
          placeholder="Search for a bottle..."
          value={search}
          onChange={(e) => { onSearchChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          className="w-full rounded-xl px-4 py-4 focus:outline-none transition shadow-sm"
          style={{ background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text)' }}
        />
      ) : (
        <div className="flex items-center gap-4 rounded-2xl p-4 shadow-sm group" style={{ background: 'var(--surface)', border: '1px solid var(--accent)' }}>
          {selected.image_url && (
            <img src={selected.image_url} alt="" className="w-12 h-12 object-contain rounded-lg" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase font-bold tracking-widest" style={{ color: 'var(--text-muted)' }}>{selected.brand}</p>
            <p className="font-semibold truncate" style={{ color: 'var(--text)' }}>{selected.name}</p>
          </div>
          <button onClick={() => onSelect(null)} className="text-xl transition hover:opacity-60" style={{ color: 'var(--text-muted)' }}>×</button>
        </div>
      )}

      {open && !selected && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl shadow-xl z-50 overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}>
          {filtered.slice(0, 8).map((f) => (
            <div
              key={f.id}
              onClick={() => { onSelect(f); onSearchChange(''); setOpen(false); }}
              className="px-5 py-4 cursor-pointer transition flex items-center gap-4"
              style={{ borderBottom: '1px solid var(--line)' }}
            >
              {f.image_url && <img src={f.image_url} alt="" className="w-8 h-8 object-contain opacity-70" />}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase font-bold" style={{ color: 'var(--text-muted)' }}>{f.brand}</p>
                <p className="text-sm truncate" style={{ color: 'var(--text)' }}>{f.name}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
      <svg width="160" height="160" viewBox="0 0 120 120" className="transform -rotate-90">
        <circle cx="60" cy="60" r="45" fill="none" stroke="var(--surface-2)" strokeWidth="2" />
        <circle
          cx="60"
          cy="60"
          r="45"
          fill="none"
          stroke="url(#resonance-gradient)"
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="resonance-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--accent)" />
            <stop offset="100%" stopColor="var(--burgundy)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center space-y-0">
        <span className="text-4xl font-bold tracking-tighter" style={{ color: 'var(--text)' }}>{score}</span>
        <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: 'var(--text-muted)' }}>Harmony</span>
      </div>
    </div>
  );
}
