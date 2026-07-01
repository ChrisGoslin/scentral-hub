'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCompare } from '@/hooks/useCompare';
import EmptyState from '@/components/ui/EmptyState';
import LoadingShimmer from '@/components/ui/LoadingShimmer';
import Button from '@/components/ui/Button';
import { track } from '@/lib/posthog';

type FragranceData = {
  id: string;
  brand: string;
  name: string;
  family: string;
  projection: string | null;
  top_notes: string[] | null;
  heart_notes: string[] | null;
  base_notes: string[] | null;
  optimal_season: string | null;
  plain_description: string | null;
  inspired_by: string | null;
  image_url: string | null;
  rating: number | null;
};

const COMPARE_FIELDS = [
  { key: 'brand', label: 'Brand' },
  { key: 'family', label: 'Family' },
  { key: 'top_notes', label: 'Top Notes' },
  { key: 'heart_notes', label: 'Heart Notes' },
  { key: 'base_notes', label: 'Base Notes' },
  { key: 'projection', label: 'Longevity' },
  { key: 'optimal_season', label: 'Optimal Season' },
  { key: 'plain_description', label: 'Description' },
  { key: 'inspired_by', label: 'Inspired By' },
];

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (Array.isArray(value)) return value.join(', ') || '—';
  return String(value) || '—';
}

function valuesEqual(a: unknown, b: unknown): boolean {
  const aStr = formatValue(a);
  const bStr = formatValue(b);
  return aStr === bStr;
}

export default function CompareClient() {
  const router = useRouter();
  const { compareIds, clearCompare } = useCompare();
  const [fragrances, setFragrances] = useState<FragranceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (compareIds.length === 0) {
      setLoading(false);
      return;
    }

    const fetchFragrances = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/compare', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: compareIds }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch fragrances');
        }

        const data = await response.json();
        setFragrances(data.fragrances || []);
        track('compare_view', { count: compareIds.length });
      } catch (err) {
        console.error('Compare fetch error:', err);
        setError('Failed to load fragrances');
      } finally {
        setLoading(false);
      }
    };

    fetchFragrances();
  }, [compareIds]);

  if (compareIds.length === 0) {
    return (
      <div style={{ padding: '48px 16px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <EmptyState
          headline="No fragrances to compare"
          caption="Select up to 2 fragrances from Discover or your Collection to compare."
          action={
            <Link href="/discover" style={{ textDecoration: 'none' }}>
              <Button>Go to Discover</Button>
            </Link>
          }
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: '24px 16px' }}>
        <LoadingShimmer count={3} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '48px 16px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>{error}</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  if (fragrances.length === 0) {
    return (
      <div style={{ padding: '48px 16px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Fragrances not found</p>
      </div>
    );
  }

  const f1 = fragrances[0];
  const f2 = fragrances[1];

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '120px' }}>
      {/* Header */}
      <div
        style={{
          padding: '20px 16px',
          borderBottom: '1px solid var(--line)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <h1
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: 'var(--text)',
            margin: 0,
          }}
        >
          Compare
        </h1>
        <button
          onClick={clearCompare}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: 24,
            cursor: 'pointer',
            padding: '4px 8px',
            lineHeight: 1,
          }}
        >
          ×
        </button>
      </div>

      {/* Comparison container - responsive layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          padding: '24px 16px',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        {[f1, f2].filter(Boolean).map((frag) => (
          <Link
            key={frag.id}
            href={`/collection/${frag.id}`}
            style={{
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <div
              style={{
                borderRadius: 'var(--r-card)',
                overflow: 'hidden',
                background: 'var(--surface)',
                border: '1px solid var(--line)',
                cursor: 'pointer',
                transition: 'border-color var(--motion-responsive)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--line)';
              }}
            >
              {/* Image */}
              {frag.image_url && (
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '3/4',
                    background: 'var(--surface-2)',
                  }}
                >
                  <Image
                    src={frag.image_url}
                    alt={`${frag.brand} ${frag.name}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 400px"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              )}

              {/* Info */}
              <div style={{ padding: '16px' }}>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, marginBottom: 4 }}>
                  {frag.brand.toUpperCase()}
                </p>
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: 'var(--text)',
                    margin: 0,
                    marginBottom: 8,
                    fontFamily: 'var(--font-display)',
                  }}
                >
                  {frag.name}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {frag.family && (
                    <div>
                      <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: 0, marginBottom: 2 }}>FAMILY</p>
                      <p style={{ fontSize: 13, color: 'var(--text)', margin: 0 }}>{frag.family}</p>
                    </div>
                  )}
                  {frag.projection && (
                    <div>
                      <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: 0, marginBottom: 2 }}>LONGEVITY</p>
                      <p style={{ fontSize: 13, color: 'var(--text)', margin: 0 }}>{frag.projection}</p>
                    </div>
                  )}
                  {frag.rating !== null && (
                    <div>
                      <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: 0, marginBottom: 2 }}>RATING</p>
                      <p style={{ fontSize: 13, color: 'var(--accent)', margin: 0 }}>
                        {'★'.repeat(Math.round(frag.rating / 2))}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Comparison table */}
      {f1 && f2 && (
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 16px 24px',
          }}
        >
          <h2
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: 'var(--text)',
              margin: '0 0 16px',
            }}
          >
            Details
          </h2>

          <div
            style={{
              borderRadius: 'var(--r-card)',
              overflow: 'hidden',
              border: '1px solid var(--line)',
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: 13,
              }}
            >
              <tbody>
                {COMPARE_FIELDS.map((field) => {
                  const v1 = f1[field.key as keyof FragranceData];
                  const v2 = f2[field.key as keyof FragranceData];
                  const isDifferent = !valuesEqual(v1, v2);

                  return (
                    <tr
                      key={field.key}
                      style={{
                        borderBottom: '1px solid var(--line)',
                      }}
                    >
                      <td
                        style={{
                          padding: '12px 16px',
                          background: 'var(--surface-2)',
                          fontWeight: 600,
                          color: 'var(--text-muted)',
                          fontSize: 11,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          minWidth: '120px',
                          verticalAlign: 'top',
                        }}
                      >
                        {field.label}
                      </td>
                      <td
                        style={{
                          padding: '12px 16px',
                          background: isDifferent ? 'color-mix(in srgb, var(--accent) 8%, var(--surface))' : 'var(--surface)',
                          color: 'var(--text)',
                          verticalAlign: 'top',
                        }}
                      >
                        {formatValue(v1)}
                      </td>
                      <td
                        style={{
                          padding: '12px 16px',
                          background: isDifferent ? 'color-mix(in srgb, var(--accent) 8%, var(--surface))' : 'var(--surface)',
                          color: 'var(--text)',
                          verticalAlign: 'top',
                          borderLeft: '1px solid var(--line)',
                        }}
                      >
                        {formatValue(v2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
