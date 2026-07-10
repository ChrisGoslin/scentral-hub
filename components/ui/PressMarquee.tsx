'use client';

const BRAND_PROPS = [
  'Know your nose.',
  'The $18 answer to the $140 question.',
  'Inspired by, never ripped off.',
  'Stop blind buying.',
  'All tastes are mathematically equal.',
  'Your signature, decoded.',
  'The clone that outperforms the original.',
];

export default function PressMarquee() {
  const items = [...BRAND_PROPS, ...BRAND_PROPS];

  return (
    <section className="press-marquee relative w-full overflow-hidden py-12 border-t border-b border-white/[0.06]">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes bn-marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .animate-bn-marquee {
          display: inline-flex;
          white-space: nowrap;
          animation: bn-marquee 40s linear infinite;
        }
        .animate-bn-marquee:hover { animation-play-state: paused; }
        @media (hover: none) {
          .animate-bn-marquee:hover { animation-play-state: running; }
        }
      `}} />

      <p className="text-center font-serif italic text-white/40 tracking-wide text-xs sm:text-sm max-w-2xl mx-auto mb-8 px-6 leading-relaxed">
        &quot;The invisible architecture of identity. Radically democratized.&quot;
      </p>

      <div
        className="w-full overflow-hidden"
        style={{
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)',
          maskImage: 'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)'
        }}
      >
        <div className="animate-bn-marquee flex items-center" aria-hidden="true">
          {items.map((prop, i) => (
            <div key={i} className="inline-flex items-center gap-5 px-8 text-[10px] sm:text-[11px] font-sans tracking-[0.2em] uppercase text-white/35 select-none cursor-default hover:text-[#B8913A] transition-colors duration-300 group">
              <span className="whitespace-nowrap">{prop}</span>
              <span className="text-[#B8913A] opacity-40 text-[7px] group-hover:opacity-70 transition-opacity" aria-hidden="true">◆</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
