import { useState, useEffect } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { productAPI, categoryAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import useWindowSize from '../hooks/useWindowSize';

const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low–High' },
  { value: 'price_desc', label: 'Price: High–Low' },
  { value: 'popular', label: 'Popular' },
];

export default function Shop() {
  const { category: categorySlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { width } = useWindowSize();
  const gridCols = width <= 480 ? 2 : width <= 900 ? 2 : 4;

  const q = searchParams.get('q') || '';
  const isNew = searchParams.get('new') === 'true';
  const sort = isNew ? 'newest' : (searchParams.get('sort') || 'newest');
  const sale = searchParams.get('sale') === 'true';
  const page = parseInt(searchParams.get('page') || '0');
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  const setParam = (key, val) => {
    const next = new URLSearchParams(searchParams);
    if (val) next.set(key, val);
    else next.delete(key);
    next.delete('page');
    setSearchParams(next);
  };

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryAPI.getTree(),
    select: d => d.data.data,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['products', { categorySlug, q, sort, sale, page, minPrice, maxPrice }],
    queryFn: () => {
      if (q) return productAPI.search(q, { sort, page, size: 20 });
      if (categorySlug) return categoryAPI.getProducts(categorySlug, { sort, page, size: 20, minPrice, maxPrice });
      return productAPI.getAll({ sort, page, size: 20, sale, minPrice, maxPrice });
    },
    select: d => d.data.data,
    placeholderData: (prev) => prev,
  });

  const products = data?.content || [];
  const totalPages = data?.totalPages || 1;

  const pageTitle = q
    ? `Search: "${q}"`
    : categorySlug
      ? categories?.find(c => c.slug === categorySlug)?.name || categorySlug
      : sale
        ? 'Sale'
        : isNew
          ? 'New Arrivals'
          : 'All Products';

  return (
    <div style={{ paddingTop: '64px', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{
        maxWidth: '1400px', margin: '0 auto', padding: '40px 32px 0',
      }}>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 'clamp(48px, 8vw, 96px)',
            fontWeight: 900, textTransform: 'uppercase',
            letterSpacing: '-0.03em', color: 'var(--text)',
            lineHeight: 0.9, margin: 0,
          }}
        >
          {pageTitle}
          {data?.totalElements !== undefined && (
            <span style={{
              fontFamily: 'Inter', fontSize: '16px', fontWeight: 400,
              letterSpacing: '0.05em', color: 'var(--text-muted)',
              marginLeft: '20px', verticalAlign: 'middle',
            }}>
              {data.totalElements} items
            </span>
          )}
        </motion.h1>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 32px 80px' }}>
        {/* Toolbar */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          paddingBottom: '20px', borderBottom: '1px solid var(--border)',
          marginBottom: '32px', flexWrap: 'wrap', gap: '12px',
        }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setFiltersOpen(o => !o)}
              style={{
                background: 'none', border: '1px solid var(--border)',
                padding: '8px 16px', cursor: 'pointer', color: 'var(--text)',
                fontFamily: 'Inter', fontSize: '11px', letterSpacing: '0.15em',
                textTransform: 'uppercase',
                background: filtersOpen ? 'var(--black)' : 'none',
                color: filtersOpen ? 'var(--bg)' : 'var(--text)',
              }}
            >
              Filters {filtersOpen ? '↑' : '↓'}
            </button>

            {/* Category pills */}
            {categories?.filter(c => !c.parentId).slice(0, 5).map(cat => (
              <a
                key={cat.id}
                href={`/shop/${cat.slug}`}
                style={{
                  padding: '8px 16px',
                  border: `1px solid ${categorySlug === cat.slug ? 'var(--red)' : 'var(--border)'}`,
                  background: categorySlug === cat.slug ? 'var(--red)' : 'none',
                  color: categorySlug === cat.slug ? '#fff' : 'var(--text)',
                  fontFamily: 'Inter', fontSize: '11px', letterSpacing: '0.12em',
                  textTransform: 'uppercase', textDecoration: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                {cat.name}
              </a>
            ))}
          </div>

          <select
            value={sort}
            onChange={e => setParam('sort', e.target.value)}
            style={{
              background: 'var(--bg)', border: '1px solid var(--border)',
              padding: '8px 12px', color: 'var(--text)',
              fontFamily: 'Inter', fontSize: '11px', letterSpacing: '0.1em',
              textTransform: 'uppercase', cursor: 'pointer', outline: 'none',
            }}
          >
            {SORTS.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* Filter panel */}
        <AnimatePresence>
          {filtersOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{
                overflow: 'hidden',
                borderBottom: '1px solid var(--border)',
                marginBottom: '32px',
              }}
            >
              <div style={{
                paddingBottom: '24px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '24px',
              }}>
                <div>
                  <label style={{ fontFamily: 'Inter', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '10px' }}>
                    Min Price (₹)
                  </label>
                  <input
                    type="number"
                    value={minPrice}
                    onChange={e => setParam('minPrice', e.target.value)}
                    placeholder="0"
                    style={{
                      width: '100%', background: 'none', border: '1px solid var(--border)',
                      padding: '8px 12px', color: 'var(--text)',
                      fontFamily: 'Inter', fontSize: '13px', outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontFamily: 'Inter', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '10px' }}>
                    Max Price (₹)
                  </label>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={e => setParam('maxPrice', e.target.value)}
                    placeholder="Any"
                    style={{
                      width: '100%', background: 'none', border: '1px solid var(--border)',
                      padding: '8px 12px', color: 'var(--text)',
                      fontFamily: 'Inter', fontSize: '13px', outline: 'none',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <label style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    cursor: 'pointer', userSelect: 'none',
                  }}>
                    <input
                      type="checkbox"
                      checked={sale}
                      onChange={e => setParam('sale', e.target.checked ? 'true' : '')}
                      style={{ width: '16px', height: '16px', accentColor: '#E8242A' }}
                    />
                    <span style={{ fontFamily: 'Inter', fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text)' }}>
                      Sale Items Only
                    </span>
                  </label>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Products Grid */}
        {isLoading ? (
          <div style={{
            display: 'grid', gridTemplateColumns: `repeat(${gridCols}, 1fr)`, gap: '16px',
          }}>
            {Array(8).fill(0).map((_, i) => (
              <div key={i} style={{ aspectRatio: '3/4', background: 'var(--surface)', animation: 'pulse 1.5s ease-in-out infinite' }} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '80px 0',
            color: 'var(--text-muted)',
          }}>
            <p style={{ fontFamily: "'Barlow Condensed'", fontSize: '32px', fontWeight: 700, textTransform: 'uppercase' }}>
              No products found
            </p>
            <p style={{ fontFamily: 'Inter', fontSize: '13px', marginTop: '8px' }}>
              Try adjusting your filters or{' '}
              <a href="/shop" style={{ color: 'var(--red)', textDecoration: 'none' }}>browse all products</a>
            </p>
          </div>
        ) : (
          <motion.div
            key={`${page}-${sort}-${categorySlug}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
              gap: '16px',
            }}
          >
            {products.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </motion.div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex', justifyContent: 'center', gap: '8px',
            marginTop: '64px',
          }}>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => {
                  const next = new URLSearchParams(searchParams);
                  next.set('page', i);
                  setSearchParams(next);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                style={{
                  width: '40px', height: '40px',
                  background: page === i ? 'var(--red)' : 'none',
                  border: `1px solid ${page === i ? 'var(--red)' : 'var(--border)'}`,
                  color: page === i ? '#fff' : 'var(--text)',
                  cursor: 'pointer', fontFamily: 'Inter', fontSize: '13px',
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @media (max-width: 900px) {
          .shop-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}
