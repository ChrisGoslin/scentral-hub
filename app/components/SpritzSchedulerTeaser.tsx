'use client';

import { useEffect, useState } from 'react';

// Scentral Spritz Scheduler - The Elusive Hero Component
// Concept: A cinematic, rotating "Scent Clock" that visualizes the wearer's day.
// Interaction: "Narcissism meets Altruism" — Users can drag an essence into a time slot,
// but they only see the true resulting "sillage aura" if they unlock the portal.

export default function SpritzSchedulerTeaser({ onUnlock }: { onUnlock: () => void }) {
  const [time, setTime] = useState(new Date());
  const [hoveredPhase, setHoveredPhase] = useState<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const currentHour = time.getHours();

  // The 4 olfactory phases of the day
  const phases = [
    { id: 1, label: '08:00 - The Morning Anchor', active: currentHour >= 6 && currentHour < 12, angle: 0 },
    { id: 2, label: '13:00 - The Midday Modulation', active: currentHour >= 12 && currentHour < 17, angle: 90 },
    { id: 3, label: '19:00 - The Evening Shift', active: currentHour >= 17 && currentHour < 22, angle: 180 },
    { id: 4, label: '23:00 - The Midnight Exothermic', active: currentHour >= 22 || currentHour < 6, angle: 270 },
  ];

  return (
    <div className="relative w-full max-w-md mx-auto aspect-square flex items-center justify-center fade-up">
      {/* Background glow indicating the active time of day */}
      <div className="absolute inset-0 bg-amber-500/5 blur-[100px] rounded-full animate-pulse" />

      {/* The Scent Clock Dial */}
      <div className="relative w-full h-full rounded-full border border-slate-800/60 shadow-[0_0_80px_rgba(0,0,0,0.8)] backdrop-blur-sm flex items-center justify-center group overflow-hidden">
        
        {/* Inner mysterious void */}
        <div className="absolute inset-8 rounded-full bg-[#06070a] border border-slate-900 shadow-inner flex flex-col items-center justify-center text-center p-6 z-10 transition-all duration-700">
          <p className="text-[10px] uppercase tracking-[0.3em] text-amber-400/80 mb-2">The Architecture of Sillage</p>
          <h2 className="text-2xl font-semibold text-slate-200 mb-4 font-serif italic">
            {hoveredPhase ? phases.find(p => p.id === hoveredPhase)?.label : "Curate Your Aura"}
          </h2>
          
          <div className="h-12 flex items-center justify-center">
             <button 
                onClick={onUnlock}
                className="opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100 bg-amber-400 text-slate-900 px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-amber-300"
              >
                Unlock the Scheduler
             </button>
          </div>
        </div>

        {/* The 4 Time Nodes */}
        {phases.map((phase) => (
          <div 
            key={phase.id}
            className={`absolute w-3 h-3 rounded-full transition-all duration-500 cursor-pointer z-20 ${
              phase.active 
                ? 'bg-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.6)] scale-150' 
                : 'bg-slate-700 hover:bg-slate-500'
            }`}
            style={{
              transform: `rotate(${phase.angle}deg) translateY(-140px) rotate(-${phase.angle}deg)`
            }}
            onMouseEnter={() => setHoveredPhase(phase.id)}
            onMouseLeave={() => setHoveredPhase(null)}
          >
            {/* The "Elusive" visual hint connecting the node to the center */}
            <div className={`absolute top-1/2 left-1/2 w-0.5 h-16 origin-top -translate-x-1/2 bg-gradient-to-b from-amber-400/0 to-amber-400/40 opacity-0 transition-opacity duration-500 ${hoveredPhase === phase.id ? 'opacity-100' : ''}`} 
                 style={{ transform: `rotate(${phase.angle + 180}deg)` }}
            />
          </div>
        ))}

        {/* Rotating subtle orbital rings */}
        <div className="absolute inset-4 rounded-full border border-slate-800/30 animate-[spin_60s_linear_infinite]" />
        <div className="absolute inset-16 rounded-full border border-slate-800/40 animate-[spin_40s_linear_infinite_reverse]" />
      </div>
    </div>
  );
}
