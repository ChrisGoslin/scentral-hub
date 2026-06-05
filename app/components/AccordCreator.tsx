'use client';

import { useEffect, useState, useCallback } from 'react';
import { Fragrance, CombinerState } from '@/app/lib/types';
import { calculateHarmonyScore } from '@/app/lib/harmonyEngine';
import { PRESET_FRAGRANCES } from '@/app/lib/presets';

const STORAGE_KEY = 'scentral_accord_state';
const MAX_FRAGRANCES = 3;

export default function AccordCreator() {
  const [state, setState] = useState<CombinerState>({
    fragrances: [null, null, null],
    harmonyScore: 0,
    breakdown: { topMatchPct: 0, heartMatchPct: 0, baseMatchPct: 0, dominantProfile: 'balanced' }
  });
  const [mounted, setMounted] = useState(false);
  const [allFragrances] = useState<Fragrance[]>(PRESET_FRAGRANCES);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setState(parsed);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    const { score, breakdown } = calculateHarmonyScore(state.fragrances);
    setState(prev => ({
      ...prev,
      harmonyScore: score,
      breakdown
    }));
  }, [state.fragrances]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (mounted) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [state, mounted]);

  const selectFragrance = useCallback((index: number, fragrance: Fragrance) => {
    setState(prev => {
      const newFragrances = [...prev.fragrances];
      newFragrances[index] = fragrance;
      return { ...prev, fragrances: newFragrances };
    });
  }, []);

  const removeFragrance = useCallback((index: number) => {
    setState(prev => {
      const newFragrances = [...prev.fragrances];
      newFragrances[index] = null;
      return { ...prev, fragrances: newFragrances };
    });
  }, []);

  const loadPreset = useCallback(() => {
    setState({
      fragrances: [
        PRESET_FRAGRANCES[0],
        PRESET_FRAGRANCES[1],
        null
      ],
      harmonyScore: 0,
      breakdown: { topMatchPct: 0, heartMatchPct: 0, baseMatchPct: 0, dominantProfile: 'balanced' }
    });
  }, []);

  if (!mounted) return <div className="bg-[var(--bg)] h-screen" />;

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] p-6 pt-24">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <h1 className="text-5xl font-serif italic mb-3 tracking-tight">The Atelier</h1>
          <p className="text-[var(--text-muted)] text-lg font-light">Build and discover olfactory resonance</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-serif">Synthesize Your Wardrobe</h2>
              <button
                onClick={loadPreset}
                className="px-6 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-press)] text-white rounded-[var(--r-btn)] text-[10px] font-bold tracking-widest uppercase transition shadow-sm"
              >
                Load Example
              </button>
            </div>

            <div className="space-y-4">
              {state.fragrances.map((frag, idx) => (
                <FragranceSlot
                  key={idx}
                  index={idx}
                  selected={frag}
                  availableFragrances={allFragrances}
                  onSelect={(f) => selectFragrance(idx, f)}
                  onRemove={() => removeFragrance(idx)}
                />
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <ScoreCard
              score={state.harmonyScore}
              breakdown={state.breakdown}
              fragranceCount={state.fragrances.filter(f => f !== null).length}
            />
          </div>
        </div>

        {state.fragrances.some(f => f !== null) && (
          <div className="mt-12 pt-8 border-t border-[var(--line)]">
            <h2 className="text-xl font-serif italic mb-6">Accord Breakdown</h2>
            <NotesDisplay fragrances={state.fragrances} breakdown={state.breakdown} />
          </div>
        )}
      </div>
    </div>
  );
}

function FragranceSlot({
  index,
  selected,
  availableFragrances,
  onSelect,
  onRemove
}: {
  index: number;
  selected: Fragrance | null;
  availableFragrances: Fragrance[];
  onSelect: (f: Fragrance) => void;
  onRemove: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--r-card)] p-6 shadow-sm transition-all hover:shadow-md">
        <div className="flex justify-between items-center mb-4">
          <span className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-bold">Layer {index + 1}</span>
          {selected && (
            <button
              onClick={onRemove}
              className="text-[var(--text-muted)] hover:text-[var(--danger)] text-sm transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        {selected ? (
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-bold mb-1">{selected.brand}</p>
            <p className="text-xl font-serif italic text-[var(--text)] mb-4">{selected.name}</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-stone-50">
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-widest text-[var(--accent)] font-bold">Top</span>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">{selected.notes.top.join(', ')}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-widest text-[var(--accent)] font-bold">Heart</span>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">{selected.notes.heart.join(', ')}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-widest text-[var(--accent)] font-bold">Base</span>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">{selected.notes.base.join(', ')}</p>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full text-left py-6 text-[var(--text-muted)] hover:text-[var(--text)] transition-all font-serif italic text-lg"
          >
            + Select an essence to layer
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--surface)] border border-[var(--line)] rounded-[var(--r-card)] overflow-hidden z-50 shadow-2xl">
          <div className="max-h-64 overflow-y-auto">
            {availableFragrances.map(frag => (
              <button
                key={frag.id}
                onClick={() => {
                  onSelect(frag);
                  setIsOpen(false);
                }}
                className="w-full text-left px-6 py-4 hover:bg-[var(--surface)] transition border-b border-[var(--line)] last:border-b-0"
              >
                <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-bold">{frag.brand}</p>
                <p className="font-serif text-[var(--text)]">{frag.name}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreCard({
  score,
  breakdown,
  fragranceCount
}: {
  score: number;
  breakdown: any;
  fragranceCount: number;
}) {
  const getScoreColor = () => {
    if (score >= 75) return 'text-[var(--positive)]';
    if (score >= 50) return 'text-[var(--accent)]';
    return 'text-[var(--danger)]';
  };

  const getScoreLabel = () => {
    if (score >= 75) return 'Exceptional Harmony';
    if (score >= 50) return 'Strategic Accord';
    if (score > 0) return 'Experimental Sillage';
    return 'Add fragrances';
  };

  return (
    <div className="sticky top-24 bg-[var(--surface)] border border-[var(--line)] rounded-[var(--r-card)] p-8 shadow-sm space-y-8">
      <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">Resonance Score</h3>

      {fragranceCount >= 2 ? (
        <>
          <div className="text-center space-y-2">
            <div className={`text-6xl font-serif italic ${getScoreColor()}`}>{score}%</div>
            <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-bold">{getScoreLabel()}</p>
          </div>

          <div className="space-y-6 pt-6 border-t border-stone-50">
            <div>
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-2">
                <span className="text-[var(--text-muted)]">Top Notes</span>
                <span className="text-[var(--accent)]">{breakdown.topMatchPct}%</span>
              </div>
              <div className="w-full bg-[var(--surface)] h-0.5">
                <div
                  className="bg-[var(--accent)] h-0.5 transition-all duration-700"
                  style={{ width: `${breakdown.topMatchPct}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-2">
                <span className="text-[var(--text-muted)]">Heart Notes</span>
                <span className="text-[var(--accent)]">{breakdown.heartMatchPct}%</span>
              </div>
              <div className="w-full bg-[var(--surface)] h-0.5">
                <div
                  className="bg-[var(--accent)] h-0.5 transition-all duration-700"
                  style={{ width: `${breakdown.heartMatchPct}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-2">
                <span className="text-[var(--text-muted)]">Base Notes</span>
                <span className="text-[var(--accent)]">{breakdown.baseMatchPct}%</span>
              </div>
              <div className="w-full bg-[var(--surface)] h-0.5">
                <div
                  className="bg-[var(--accent)] h-0.5 transition-all duration-700"
                  style={{ width: `${breakdown.baseMatchPct}%` }}
                />
              </div>
            </div>
          </div>

          {breakdown.dominantProfile !== 'balanced' && (
            <div className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] pt-6 border-t border-stone-50 text-center font-bold">
              <span className="text-[var(--accent)] capitalize">
                {breakdown.dominantProfile}
              </span>{' '}
              Dominance detected
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 space-y-4">
          <div className="text-4xl opacity-20">⚗️</div>
          <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-bold leading-relaxed">
            Layer two or more essences<br />to synthesize resonance
          </p>
        </div>
      )}
    </div>
  );
}

function NotesDisplay({
  fragrances,
  breakdown
}: {
  fragrances: (Fragrance | null)[];
  breakdown: any;
}) {
  const active = fragrances.filter((f): f is Fragrance => f !== null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {['top', 'heart', 'base'].map(level => {
        const pct =
          level === 'top'
            ? breakdown.topMatchPct
            : level === 'heart'
            ? breakdown.heartMatchPct
            : breakdown.baseMatchPct;

        return (
          <div key={level} className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--r-card)] p-6 shadow-sm">
            <h3 className="text-[10px] uppercase tracking-widest text-[var(--accent)] font-bold mb-4">{level} Harmony</h3>
            <div className="space-y-4">
              {active.map((frag, idx) => (
                <div key={`${frag.id}-${idx}`} className="space-y-1">
                  <p className="text-[9px] uppercase tracking-widest text-[var(--text-muted)] font-bold">{frag.name}</p>
                  <p className="text-xs text-[var(--text)] font-serif italic">{frag.notes[level as 'top' | 'heart' | 'base'].join(', ')}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-stone-50">
              <p className="text-[10px] text-right font-bold tracking-widest text-[var(--accent)]">{pct}% SYNERGY</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
