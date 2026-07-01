'use client';

import { useState, useEffect, useCallback } from 'react';

const COMPARE_KEY = 'scentral_compare_ids';
const MAX_COMPARE = 2;

export function useCompare() {
  const [compareIds, setCompareIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(COMPARE_KEY);
      if (stored) {
        setCompareIds(JSON.parse(stored));
      }
    } catch {
      /* ignore */
    }
  }, []);

  const toggleCompare = useCallback((id: string) => {
    setCompareIds(prev => {
      const isAdded = prev.includes(id);

      if (isAdded) {
        const next = prev.filter(x => x !== id);
        localStorage.setItem(COMPARE_KEY, JSON.stringify(next));
        return next;
      }

      if (prev.length < MAX_COMPARE) {
        const next = [...prev, id];
        localStorage.setItem(COMPARE_KEY, JSON.stringify(next));
        return next;
      }

      // Replace oldest if at max
      const next = [prev[1], id];
      localStorage.setItem(COMPARE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearCompare = useCallback(() => {
    setCompareIds([]);
    localStorage.removeItem(COMPARE_KEY);
  }, []);

  return { compareIds, toggleCompare, clearCompare };
}
