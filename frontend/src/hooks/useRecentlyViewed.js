import { useEffect, useState } from 'react';
import { productAPI } from '../services/api';

const KEY = 'clc_recently_viewed';
const MAX = 8;

export function addRecentlyViewed(product) {
  try {
    const existing = JSON.parse(localStorage.getItem(KEY) || '[]');
    const filtered = existing.filter(p => p.id !== product.id);
    const updated = [{ id: product.id, name: product.name, slug: product.slug, sellingPrice: product.sellingPrice, comparePrice: product.comparePrice, images: product.images }, ...filtered].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(updated));
  } catch {}
}

export function useRecentlyViewed(excludeId) {
  const [items, setItems] = useState([]);
  useEffect(() => {
    let cancelled = false;
    let stored = [];
    try { stored = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { stored = []; }
    const candidates = stored.filter(p => p.id !== excludeId);

    // Validate against the backend so deleted/unavailable products don't linger.
    (async () => {
      const checks = await Promise.all(candidates.map(async (p) => {
        if (!p.slug) return null;
        try { await productAPI.getBySlug(p.slug); return p; }
        catch { return null; } // 404 / removed → drop it
      }));
      if (cancelled) return;
      const valid = checks.filter(Boolean);
      setItems(valid);
      // Persist the cleaned list (keep the excluded/current product entry too)
      try {
        const validIds = new Set(valid.map(p => p.id));
        const cleaned = stored.filter(p => p.id === excludeId || validIds.has(p.id));
        localStorage.setItem(KEY, JSON.stringify(cleaned));
      } catch {}
    })();

    return () => { cancelled = true; };
  }, [excludeId]);
  return items;
}
