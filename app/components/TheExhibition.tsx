'use client';

import { useState } from 'react';
import { motion, Reorder } from 'framer-motion';
import { Fragrance } from '@/app/lib/types';

// The Exhibition
// A visual shelf component that showcases the user's top "Enshrined" fragrances.
// Now featuring Reorder logic for visual curation.

export default function TheExhibition({ fragrances: initialFragrances }: { fragrances: Fragrance[] }) {
  // Take top 6 for the exhibition shelf reordering
  const [items, setItems] = useState(initialFragrances.slice(0, 6));

  if (items.length === 0) return null;

  return (
    <section className="mb-20 fade-up">
      <div className="flex items-end justify-between mb-8">
        <div>
           <h2 className="text-3xl font-bold tracking-tight text-white mb-2">The Exhibition</h2>
           <p className="text-slate-400 text-sm">Hold and drag to enshrine your Top {items.length}.</p>
        </div>
        <div className="flex items-center gap-4">
           <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold bg-slate-900 border border-slate-800 px-3 py-1 rounded-full animate-pulse">
             Curation Mode Active
           </span>
        </div>
      </div>

      <div className="relative">
        {/* The physical shelf structure */}
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-b from-slate-800 to-slate-950 rounded-b-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-20" />
        <div className="absolute bottom-4 left-4 right-4 h-[1px] bg-white/5 z-20" />

        <Reorder.Group 
          axis="x" 
          values={items} 
          onReorder={setItems}
          className="flex gap-4 md:gap-8 overflow-x-auto pb-12 pt-8 px-4 hide-scrollbar relative z-10"
        >
          {items.map((f, i) => (
            <Reorder.Item 
              key={f.id} 
              value={f}
              className="shrink-0 w-[180px] md:w-[220px] flex flex-col items-center group cursor-grab active:cursor-grabbing"
            >
              {/* Bottle Pedestal Area */}
              <motion.div 
                className="relative w-full aspect-[3/4] mb-6 flex items-end justify-center"
                whileDrag={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {/* Backlight Glow based on index */}
                <div className={`absolute inset-0 bg-gradient-to-t ${i % 2 === 0 ? 'from-amber-500/10' : 'from-sky-500/10'} to-transparent opacity-40 group-hover:opacity-100 transition-opacity duration-700 blur-2xl`} />
                
                {f.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={f.image_url} 
                    alt={f.name}
                    className="h-[85%] w-auto object-contain drop-shadow-[0_25px_25px_rgba(0,0,0,0.9)] group-hover:-translate-y-4 transition-transform duration-500 ease-out select-none pointer-events-none"
                  />
                ) : (
                  <div className="h-[75%] w-16 bg-gradient-to-b from-slate-700 to-slate-900 rounded-t-xl rounded-b-sm shadow-2xl group-hover:-translate-y-4 transition-transform duration-500 border-x border-t border-white/10 flex items-center justify-center select-none">
                    <span className="text-slate-600 text-xs font-serif italic opacity-50 text-center px-1">
                      {f.brand?.slice(0,3).toUpperCase()}
                    </span>
                  </div>
                )}
              </motion.div>

              {/* Plaque */}
              <div className="text-center w-full px-2 pointer-events-none select-none">
                <h3 className="text-white font-bold truncate text-sm mb-1 group-hover:text-amber-400 transition-colors">{f.name}</h3>
                <p className="text-[9px] uppercase tracking-widest text-slate-500 truncate">{f.brand}</p>
                <div className="mt-3 w-8 h-[1px] bg-amber-500/30 mx-auto group-hover:w-16 group-hover:bg-amber-400 transition-all duration-300" />
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </section>
  );
}
