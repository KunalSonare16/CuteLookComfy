import { useEffect, useState } from 'react';

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
    try {
      const stored = JSON.parse(localStorage.getItem(KEY) || '[]');
      setItems(stored.filter(p => p.id !== excludeId));
    } catch {}
  }, [excludeId]);
  return items;
}
