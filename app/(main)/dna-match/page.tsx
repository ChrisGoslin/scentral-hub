import { Suspense } from 'react';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import DNAMatchClient from './DNAMatchClient';
import ProGate from '@/components/ui/ProGate';
import { getIsPro } from '@/lib/subscription';

async function loadFragrances() {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const { data: fragrances, error } = await supabase
    .from('fragrances')
    .select('id, brand, name, family, image_url')
    .order('brand')
    .order('name');

  if (error) {
    console.error('Failed to load fragrances:', error);
    return [];
  }

  return fragrances || [];
}

export default async function CompareScentPage() {
  if (!getIsPro()) {
    return (
      <ProGate
        featureName="Compare Two Scents"
        description="Pick any two fragrances and find out how similar they really are — useful for finding inspired-by alternatives or figuring out if two bottles clash before you layer them."
        preview={
          <div className="px-4 pt-8 pb-4 space-y-6 pointer-events-none">
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28 }}>Compare Two Scents</h1>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-24 bg-[var(--surface)] border border-[var(--line)] rounded-xl" />
              <div className="h-24 bg-[var(--surface)] border border-[var(--line)] rounded-xl" />
            </div>
            <div className="h-40 bg-[var(--surface)] border border-[var(--line)] rounded-3xl mx-auto max-w-sm" />
          </div>
        }
      />
    );
  }

  const fragrances = await loadFragrances();

  return (
    <Suspense fallback={<div style={{ minHeight: '100dvh', background: 'var(--bg)' }} />}>
      <DNAMatchClient fragrances={fragrances} />
    </Suspense>
  );
}
