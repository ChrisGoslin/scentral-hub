'use client';

import { useState, useEffect, useRef } from 'react';

export type FragranceResult = {
  id: string;
  brand: string;
  name: string;
  family: string;
  image_url: string | null;
};

export function useFragranceSearch(query: string, debounceMs = 200) {
  const [results, setResults] = useState<FragranceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      setLoading(true);
      try {
        const res = await fetch(
          `/api/fragrances/search?q=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error('Search failed');
        const data: FragranceResult[] = await res.json();
        setResults(data);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    return () => {
      clearTimeout(timer);
      controllerRef.current?.abort();
    };
  }, [query, debounceMs]);

  return { results, loading };
}
