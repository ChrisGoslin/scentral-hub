'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AccordCreator from '@/app/components/AccordCreator';

export default function Home() {
  const [showAccordCreator, setShowAccordCreator] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setShowAccordCreator(true);
  }, []);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return;
    
    localStorage.setItem('scentral_email_signup', email);
    setSubmitted(true);
    setTimeout(() => {
      setShowAccordCreator(true);
    }, 1500);
  };

  if (submitted || showAccordCreator) {
    return <AccordCreator />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center p-6">
      <div className="max-w-2xl w-full">
        {/* Logo / Branding */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">Scentral</h1>
          <p className="text-xl text-gray-400">Create fragrance layering combos in seconds</p>
        </div>

        {/* Hero Section */}
        <div className="bg-gray-800 rounded-xl p-8 md:p-12 border border-gray-700">
          <h2 className="text-3xl font-bold mb-4">Build Your Signature Accords</h2>
          <p className="text-gray-400 mb-8 leading-relaxed">
            Layer 2–3 fragrances from your collection. Get instant harmony scores. Discover combinations you never thought of. Share your Accords with friends.
          </p>

          {/* Email Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-600"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-amber-600 hover:bg-amber-700 rounded-lg font-semibold transition whitespace-nowrap"
              >
                Get Started
              </button>
            </div>
            <p className="text-xs text-gray-500">Free. No account needed.</p>
          </form>
        </div>

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="text-amber-400 text-2xl font-bold mb-2">⚗️</div>
            <h3 className="font-semibold mb-2">Layer Fragrances</h3>
            <p className="text-sm text-gray-400">Combine 2–3 bottles to create new scent experiences</p>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="text-amber-400 text-2xl font-bold mb-2">📊</div>
            <h3 className="font-semibold mb-2">Get Harmony Scores</h3>
            <p className="text-sm text-gray-400">See how well fragrances work together (0–100%)</p>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="text-amber-400 text-2xl font-bold mb-2">📤</div>
            <h3 className="font-semibold mb-2">Share Your Accords</h3>
            <p className="text-sm text-gray-400">Export cards and share combos with friends</p>
          </div>
        </div>

        {/* Skip Button */}
        <div className="text-center mt-12">
          <button
            onClick={() => setShowAccordCreator(true)}
            className="text-gray-500 hover:text-gray-300 text-sm transition"
          >
            Skip and explore →
          </button>
        </div>
      </div>
    </div>
  );
}
