'use client';

import Link from 'next/link';
import { useCompare } from '@/hooks/useCompare';

export default function CompareBar() {
  const { compareIds, clearCompare } = useCompare();

  if (compareIds.length < 2) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        background: 'var(--surface)',
        borderTop: '1px solid var(--line)',
        boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.12)',
        padding: 'max(16px, env(safe-area-inset-bottom, 0px) + 12px) 16px 16px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <span
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--text)',
          }}
        >
          Compare ({compareIds.length})
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link
            href="/compare"
            style={{
              background: 'var(--accent)',
              color: 'rgba(0, 0, 0, 0.85)',
              border: 'none',
              borderRadius: 'var(--r-btn)',
              padding: '8px 20px',
              fontSize: 13,
              fontWeight: 600,
              textDecoration: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            View Comparison
          </Link>
          <button
            onClick={clearCompare}
            style={{
              background: 'var(--surface-2)',
              color: 'var(--text)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--r-btn)',
              padding: '8px 20px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
