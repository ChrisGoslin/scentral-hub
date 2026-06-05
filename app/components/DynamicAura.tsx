'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

// The Dynamic Aura (Sensory Proxy)
// Concept: Compensate for the lack of smell by translating 'Scent DNA' into
// a pulsating visual orb, accompanied by a continuous ambient drone, and haptic feedback.

interface ScentDNA {
  woody: number; // drives amber/brown colors, deep bass frequencies
  floral: number; // drives pink/purple colors, mid-high frequencies
  fresh: number;  // drives cyan/green colors, high shimmering frequencies
  spicy: number;  // drives red/orange colors, pulsating tremolo
}

export default function DynamicAura({ dna, size = 300 }: { dna: ScentDNA; size?: number }) {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const gainNodeRef = useRef<GainNode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Translate DNA to CSS gradients
  const auraGradient = `radial-gradient(circle at 30% 30%, 
    rgba(${dna.spicy * 2.5}, ${dna.woody * 1.5}, ${dna.floral * 2}, 0.8) 0%, 
    rgba(${dna.floral * 2}, ${dna.fresh * 2}, ${dna.woody * 2}, 0.5) 40%, 
    rgba(6, 7, 10, 0) 70%)`;

  const initializeAudio = () => {
    if (audioCtxRef.current) return;
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContext();
    audioCtxRef.current = ctx;

    const masterGain = ctx.createGain();
    masterGain.gain.value = 0;
    masterGain.connect(ctx.destination);
    gainNodeRef.current = masterGain;

    // Create a drone based on DNA
    const baseFreq = 65.41; // C2 (Deep Woody anchor)
    
    const createOscillator = (freq: number, type: OscillatorType, gainVal: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.value = gainVal;
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start();
      return osc;
    };

    // Woody = Sub Bass (Sine)
    oscillatorsRef.current.push(createOscillator(baseFreq, 'sine', (dna.woody / 100) * 0.5));
    // Floral = Lush Mids (Triangle)
    oscillatorsRef.current.push(createOscillator(baseFreq * 1.5, 'triangle', (dna.floral / 100) * 0.3));
    // Fresh = High Shimmer (Sine + slight detune)
    oscillatorsRef.current.push(createOscillator(baseFreq * 4.01, 'sine', (dna.fresh / 100) * 0.15));
    // Spicy = Dissonance (Sawtooth)
    oscillatorsRef.current.push(createOscillator(baseFreq * 2.1, 'sawtooth', (dna.spicy / 100) * 0.1));
  };

  const toggleAura = () => {
    // Haptic feedback (Touch)
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }

    if (!isPlaying) {
      initializeAudio();
      if (audioCtxRef.current?.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      // Fade in
      gainNodeRef.current?.gain.setTargetAtTime(1, audioCtxRef.current!.currentTime, 2);
      setIsPlaying(true);
    } else {
      // Fade out
      gainNodeRef.current?.gain.setTargetAtTime(0, audioCtxRef.current!.currentTime, 1);
      setTimeout(() => {
        if (audioCtxRef.current?.state === 'running') {
          audioCtxRef.current.suspend();
        }
      }, 1000);
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup audio
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center space-y-8">
      <motion.div
        onClick={toggleAura}
        className="relative rounded-full cursor-pointer touch-none"
        style={{ width: size, height: size }}
        animate={{
          scale: isPlaying ? [1, 1.05, 1] : 1,
          rotate: isPlaying ? [0, 5, -5, 0] : 0,
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Core Scent Blur */}
        <div 
          className="absolute inset-0 rounded-full mix-blend-screen filter blur-3xl transition-opacity duration-1000"
          style={{ 
            background: auraGradient,
            opacity: isPlaying ? 1 : 0.4
          }}
        />
        
        {/* Inner Physical Core */}
        <div className="absolute inset-4 rounded-full bg-slate-950/40 backdrop-blur-md border border-white/5 flex items-center justify-center overflow-hidden z-10 shadow-inner group">
          {/* Film Grain Texture */}
          <div className="absolute inset-0 opacity-[0.03] bg-[url('/assets/noise.svg')] pointer-events-none mix-blend-overlay" />

          <div className="text-center relative z-20">
            <span className="block text-4xl mb-2 transition-transform duration-700 group-hover:scale-110">{isPlaying ? '〰️' : '⊙'}</span>
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
              {isPlaying ? 'Resonating' : 'Awaken Aura'}
            </span>
          </div>
          
          {/* Internal DNA strings */}
          <motion.div 
            className="absolute inset-0 border-[0.5px] border-white/10 rounded-full"
            animate={{ 
              rotate: isPlaying ? 360 : 0,
              scale: isPlaying ? [1, 1.05, 1] : 1
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            style={{ borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%' }}
          />
          <motion.div 
            className="absolute inset-2 border-[0.5px] border-white/5 rounded-full"
            animate={{ 
              rotate: isPlaying ? -360 : 0,
              opacity: isPlaying ? [0.2, 0.5, 0.2] : 0.2
            }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            style={{ borderRadius: '60% 40% 30% 70% / 50% 40% 50% 60%' }}
          />

          {/* Micro-spark micro-animations */}
          {isPlaying && (
            <motion.div 
              className="absolute inset-0 bg-white/5 blur-3xl rounded-full"
              animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.3, 0.1] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
          )}
        </div>
      </motion.div>

      {/* DNA Breakdown */}
      <div className="flex gap-6 mt-8 fade-up text-center">
        <div className="space-y-1">
          <div className="text-amber-600 font-bold">{dna.woody}%</div>
          <div className="text-[9px] uppercase tracking-widest text-slate-500">Woody</div>
        </div>
        <div className="space-y-1">
          <div className="text-purple-400 font-bold">{dna.floral}%</div>
          <div className="text-[9px] uppercase tracking-widest text-slate-500">Floral</div>
        </div>
        <div className="space-y-1">
          <div className="text-cyan-400 font-bold">{dna.fresh}%</div>
          <div className="text-[9px] uppercase tracking-widest text-slate-500">Fresh</div>
        </div>
        <div className="space-y-1">
          <div className="text-rose-500 font-bold">{dna.spicy}%</div>
          <div className="text-[9px] uppercase tracking-widest text-slate-500">Spicy</div>
        </div>
      </div>
    </div>
  );
}
