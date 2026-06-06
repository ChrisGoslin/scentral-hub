'use client';

import { useState } from 'react';

type Archetype = 'collector' | 'experimenter' | 'minimalist' | 'architect';

const ARCHETYPES: { id: Archetype; label: string; description: string }[] = [
  {
    id: 'collector',
    label: 'The Collector',
    description: 'You curate with intention. Every bottle is a chapter.',
  },
  {
    id: 'experimenter',
    label: 'The Experimenter',
    description: 'You layer fearlessly. Rules are suggestions.',
  },
  {
    id: 'minimalist',
    label: 'The Minimalist',
    description: 'One perfect scent. Worn like a signature.',
  },
  {
    id: 'architect',
    label: 'The Architect',
    description: 'You build accords. Fragrance is a system.',
  },
];

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#06070a',
    color: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 24px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  inner: {
    maxWidth: '560px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0',
  },
  wordmark: {
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontStyle: 'italic',
    fontSize: 'clamp(2.5rem, 8vw, 4.5rem)',
    fontWeight: '400',
    letterSpacing: '-0.02em',
    color: '#ffffff',
    margin: '0 0 24px',
    lineHeight: '1',
  },
  tagline: {
    fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)',
    color: '#a0a8b8',
    textAlign: 'center',
    margin: '0 0 10px',
    lineHeight: '1.5',
    maxWidth: '420px',
  },
  subline: {
    fontSize: '0.8rem',
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    color: '#4a5368',
    margin: '0 0 48px',
  },
  divider: {
    width: '40px',
    height: '1px',
    backgroundColor: '#1e2333',
    margin: '0 0 40px',
  },
  archetypeGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    width: '100%',
    marginBottom: '24px',
  },
  archetypeCard: (selected: boolean): React.CSSProperties => ({
    background: selected ? '#0f1520' : '#0a0c12',
    border: selected ? '1px solid #3a4a6b' : '1px solid #161b28',
    borderRadius: '10px',
    padding: '18px 16px',
    cursor: 'pointer',
    transition: 'border-color 0.15s, background 0.15s',
    textAlign: 'left',
    outline: 'none',
  }),
  archetypeLabel: (selected: boolean): React.CSSProperties => ({
    fontSize: '0.875rem',
    fontWeight: '600',
    color: selected ? '#c8d4f0' : '#7a8299',
    marginBottom: '6px',
    transition: 'color 0.15s',
  }),
  archetypeDesc: (selected: boolean): React.CSSProperties => ({
    fontSize: '0.75rem',
    color: selected ? '#5a6a8a' : '#363d52',
    lineHeight: '1.5',
    transition: 'color 0.15s',
  }),
  archetypeRequired: {
    fontSize: '0.75rem',
    color: '#c0392b',
    marginBottom: '8px',
    alignSelf: 'flex-start',
  },
  formRow: {
    display: 'flex',
    width: '100%',
    gap: '10px',
  },
  input: {
    flex: '1',
    background: '#0a0c12',
    border: '1px solid #1e2535',
    borderRadius: '8px',
    padding: '13px 16px',
    color: '#ffffff',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color 0.15s',
  },
  button: (disabled: boolean): React.CSSProperties => ({
    background: disabled ? '#1a2035' : '#2a3a6b',
    border: '1px solid transparent',
    borderRadius: '8px',
    padding: '13px 20px',
    color: disabled ? '#3a4a6b' : '#c8d4f0',
    fontSize: '0.85rem',
    fontWeight: '600',
    letterSpacing: '0.04em',
    cursor: disabled ? 'not-allowed' : 'pointer',
    whiteSpace: 'nowrap' as const,
    transition: 'background 0.15s, color 0.15s',
  }),
  error: {
    fontSize: '0.8rem',
    color: '#c0392b',
    marginTop: '8px',
    alignSelf: 'flex-start',
  },
  successBox: {
    width: '100%',
    background: '#070c14',
    border: '1px solid #1a2840',
    borderRadius: '12px',
    padding: '32px 28px',
    textAlign: 'center' as const,
  },
  successHeading: {
    fontSize: '1.05rem',
    fontWeight: '600',
    color: '#c8d4f0',
    marginBottom: '10px',
  },
  successPosition: {
    fontSize: '0.8rem',
    color: '#4a5a7a',
    lineHeight: '1.6',
  },
  successNumber: {
    color: '#6a7fa8',
    fontVariantNumeric: 'tabular-nums',
  },
};

export default function WaitlistPage() {
  const [email, setEmail] = useState('');
  const [archetype, setArchetype] = useState<Archetype | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [archetypeError, setArchetypeError] = useState(false);
  const [success, setSuccess] = useState<{ position: number } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setArchetypeError(false);

    if (!archetype) {
      setArchetypeError(true);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, archetype }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Try again.');
      } else {
        setSuccess({ position: data.position });
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.inner}>
        <h1 style={styles.wordmark}>Scentral</h1>
        <p style={styles.tagline}>
          The world&rsquo;s first intelligent scent-layering ecosystem.
        </p>
        <p style={styles.subline}>Private beta — by invitation only.</p>
        <div style={styles.divider} />

        {success ? (
          <div style={styles.successBox}>
            <p style={styles.successHeading}>You&rsquo;re on the list. We&rsquo;ll be in touch.</p>
            <p style={styles.successPosition}>
              <span style={styles.successNumber}>{success.position}</span> people are ahead of you.
              <br />
              We&rsquo;re onboarding in waves — expect an invitation within 2–4 weeks.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0' }}
          >
            <div style={{ width: '100%', marginBottom: '28px' }}>
              <p
                style={{
                  fontSize: '0.7rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#3a4560',
                  marginBottom: '12px',
                }}
              >
                Your fragrance archetype
              </p>
              <div style={styles.archetypeGrid}>
                {ARCHETYPES.map((a) => {
                  const selected = archetype === a.id;
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => { setArchetype(a.id); setArchetypeError(false); }}
                      style={styles.archetypeCard(selected)}
                    >
                      <div style={styles.archetypeLabel(selected)}>{a.label}</div>
                      <div style={styles.archetypeDesc(selected)}>{a.description}</div>
                    </button>
                  );
                })}
              </div>
              {archetypeError && (
                <p style={styles.archetypeRequired}>Select your archetype before requesting access.</p>
              )}
            </div>

            <div style={{ ...styles.formRow, marginBottom: error ? '4px' : '0' }}>
              <input
                style={styles.input}
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
              <button
                type="submit"
                style={styles.button(loading)}
                disabled={loading}
              >
                {loading ? 'Sending…' : 'Request Access'}
              </button>
            </div>
            {error && <p style={styles.error}>{error}</p>}
          </form>
        )}
      </div>
    </div>
  );
}
