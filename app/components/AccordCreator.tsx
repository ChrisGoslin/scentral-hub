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

  if (!mounted) return <div className="bg-gray-900 h-screen" />;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Accord Creator</h1>
          <p className="text-gray-400">Build and discover fragrance layering combos</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Layer Your Bottles</h2>
              <button
                onClick={loadPreset}
                className="px-4 py-2 bg-amber-700 hover:bg-amber-600 rounded-lg text-sm font-medium transition"
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
          <div className="mt-12 pt-8 border-t border-gray-700">
            <h2 className="text-xl font-semibold mb-6">Accord Breakdown</h2>
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
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-gray-400 font-medium">Layer {index + 1}</span>
          {selected && (
            <button
              onClick={onRemove}
              className="text-gray-500 hover:text-red-400 text-sm"
            >
              ✕
            </button>
          )}
        </div>

        {selected ? (
          <div>
            <p className="font-semibold text-amber-400">{selected.name}</p>
            <p className="text-sm text-gray-400">{selected.brand}</p>
            <div className="mt-3 text-xs space-y-1">
              <p><span className="text-amber-300">Top:</span> {selected.notes.top.join(', ')}</p>
              <p><span className="text-amber-300">Heart:</span> {selected.notes.heart.join(', ')}</p>
              <p><span className="text-amber-300">Base:</span> {selected.notes.base.join(', ')}</p>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full text-left py-2 text-gray-400 hover:text-gray-300"
          >
            + Pick a fragrance
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg overflow-hidden z-10 shadow-lg">
          {availableFragrances.map(frag => (
            <button
              key={frag.id}
              onClick={() => {
                onSelect(frag);
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-3 hover:bg-gray-700 transition border-b border-gray-700 last:border-b-0"
            >
              <p className="font-medium">{frag.name}</p>
              <p className="text-xs text-gray-400">{frag.brand}</p>
            </button>
          ))}
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
    if (score >= 75) return 'text-green-400';
    if (score >= 50) return 'text-amber-400';
    return 'text-red-400';
  };

  const getScoreLabel = () => {
    if (score >= 75) return 'Excellent';
    if (score >= 50) return 'Good';
    if (score > 0) return 'Fair';
    return 'Add fragrances';
  };

  return (
    <div className="sticky top-6 bg-gray-800 border border-amber-700 rounded-lg p-6 space-y-4">
      <h3 className="text-lg font-semibold">Vibe Match</h3>

      {fragranceCount >= 2 ? (
        <>
          <div className="text-center">
            <div className={`text-5xl font-bold ${getScoreColor()}`}>{score}%</div>
            <p className="text-sm text-gray-400 mt-2">{getScoreLabel()}</p>
          </div>

          <div className="space-y-3 pt-4 border-t border-gray-700">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">Top Notes</span>
                <span className="text-amber-400">{breakdown.topMatchPct}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-amber-500 h-2 rounded-full transition-all"
                  style={{ width: `${breakdown.topMatchPct}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">Heart Notes</span>
                <span className="text-amber-400">{breakdown.heartMatchPct}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-amber-500 h-2 rounded-full transition-all"
                  style={{ width: `${breakdown.heartMatchPct}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">Base Notes</span>
                <span className="text-amber-400">{breakdown.baseMatchPct}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-amber-500 h-2 rounded-full transition-all"
                  style={{ width: `${breakdown.baseMatchPct}%` }}
                />
              </div>
            </div>
          </div>

          {breakdown.dominantProfile !== 'balanced' && (
            <div className="text-xs text-gray-400 pt-2 border-t border-gray-700">
              <span className="text-amber-300 font-medium capitalize">
                {breakdown.dominantProfile}
              </span>{' '}
              note harmony dominant
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-gray-400 text-center py-8">
          Layer 2+ fragrances to see score
        </p>
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {['top', 'heart', 'base'].map(level => {
        const pct =
          level === 'top'
            ? breakdown.topMatchPct
            : level === 'heart'
            ? breakdown.heartMatchPct
            : breakdown.baseMatchPct;

        return (
          <div key={level} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <h3 className="text-amber-400 font-semibold mb-3 capitalize">{level} Notes</h3>
            <p className="text-xs text-gray-400 mb-4">Match: {pct}%</p>
            <div className="space-y-2">
              {active.map((frag, idx) => (
                <div key={`${frag.id}-${idx}`} className="text-sm">
                  <p className="text-gray-400">{frag.name}:</p>
                  <p className="text-gray-500 ml-2">{frag.notes[level as 'top' | 'heart' | 'base'].join(', ')}</p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
