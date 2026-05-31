import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { productAPI, categoryAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import useWindowSize from '../hooks/useWindowSize';

function HeroSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section
      ref={ref}
      style={{
        height: '100svh', position: 'relative',
        overflow: 'hidden', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: '#111111',
      }}
    >
      <motion.div style={{ y, opacity, width: '100%', textAlign: 'center', padding: '0 24px' }}>
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 'clamp(60px, 13vw, 180px)',
            fontWeight: 900,
            letterSpacing: '-0.06em',
            textTransform: 'uppercase',
            color: '#EDE8E3',
            lineHeight: 0.85,
            userSelect: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ color: '#EDE8E3' }}>Cute</span><span style={{ color: '#E8242A' }}>Look</span><span style={{ color: '#EDE8E3' }}>Comfy</span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          style={{
            fontFamily: 'Inter', fontSize: '13px',
            letterSpacing: '0.3em', textTransform: 'uppercase',
            color: 'rgba(237,232,227,0.5)',
            marginTop: '24px',
          }}
        >
          Premium Fashion — Spring / Summer 2025
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          style={{ marginTop: '40px', display: 'flex', gap: '16px', justifyContent: 'center' }}
        >
          <Link
            to="/shop"
            style={{
              padding: '14px 40px',
              background: '#E8242A', color: '#fff',
              fontFamily: 'Inter', fontSize: '12px',
              letterSpacing: '0.2em', textTransform: 'uppercase',
              textDecoration: 'none',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#c51e22'}
            onMouseLeave={e => e.currentTarget.style.background = '#E8242A'}
          >
            Shop Now
          </Link>
          <Link
            to="/shop?sort=newest"
            style={{
              padding: '14px 40px',
              background: 'none',
              border: '1px solid rgba(237,232,227,0.3)',
              color: '#EDE8E3',
              fontFamily: 'Inter', fontSize: '12px',
              letterSpacing: '0.2em', textTransform: 'uppercase',
              textDecoration: 'none',
              transition: 'border-color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(237,232,227,0.8)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(237,232,227,0.3)'}
          >
            New Arrivals
          </Link>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        style={{
          position: 'absolute', bottom: '32px', left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
        }}
      >
        <span style={{
          fontFamily: 'Inter', fontSize: '9px',
          letterSpacing: '0.3em', textTransform: 'uppercase',
          color: 'rgba(237,232,227,0.3)',
        }}>
          Scroll
        </span>
        <div style={{ width: '1px', height: '32px', background: 'rgba(237,232,227,0.2)' }} />
      </motion.div>
    </section>
  );
}

function MarqueeText({ text = 'CuteLookComfy — PREMIUM FASHION — ', speed = 25 }) {
  const repeated = Array(12).fill(text).join('');
  return (
    <div style={{ overflow: 'hidden', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '14px 0' }}>
      <motion.div
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: speed, repeat: Infinity, ease: 'linear' }}
        style={{
          display: 'flex', whiteSpace: 'nowrap',
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: '20px', fontWeight: 700,
          letterSpacing: '0.1em', textTransform: 'uppercase',
          color: 'var(--text)',
        }}
      >
        {Array(4).fill(0).map((_, i) => (
          <span key={i} style={{ flexShrink: 0 }}>
            {Array(8).fill(text).map((t, j) => (
              <span key={j}>
                {t}
                <span style={{ color: 'var(--red)', marginRight: '4px' }}>✦</span>
              </span>
            ))}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

function FeaturedGrid({ products }) {
  const { isMobile } = useWindowSize();
  if (!products?.length) return null;
  const [first, second, ...rest] = products;

  return (
    <section style={{ maxWidth: '1400px', margin: '80px auto', padding: '0 32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 'clamp(48px, 6vw, 80px)',
            fontWeight: 900, textTransform: 'uppercase',
            letterSpacing: '-0.02em', color: 'var(--text)',
            lineHeight: 0.9, margin: 0,
          }}
        >
          Featured<br />
          <span style={{ color: 'var(--red)' }}>Pieces</span>
        </motion.h2>
        <Link to="/shop" style={{
          fontFamily: 'Inter', fontSize: '11px',
          letterSpacing: '0.2em', textTransform: 'uppercase',
          color: 'var(--text)', textDecoration: 'none',
          opacity: 0.6,
          borderBottom: '1px solid currentColor',
          paddingBottom: '2px',
        }}>
          View All
        </Link>
      </div>

      {/* Hero 2-up */}
      {first && second && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          {[first, second].map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      )}

      {/* Rest grid */}
      {rest.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${isMobile ? 2 : 4}, 1fr)`,
          gap: '16px',
          marginTop: '16px',
        }}>
          {rest.slice(0, 4).map((p, i) => (
            <ProductCard key={p.id} product={p} index={i + 2} />
          ))}
        </div>
      )}
    </section>
  );
}

function CategoryStrip({ categories }) {
  const { isMobile } = useWindowSize();
  if (!categories?.length) return null;
  return (
    <section style={{ maxWidth: '1400px', margin: '80px auto', padding: '0 32px' }}>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 'clamp(36px, 5vw, 64px)',
          fontWeight: 900, textTransform: 'uppercase',
          letterSpacing: '-0.02em', color: 'var(--text)',
          marginBottom: '32px',
        }}
      >
        Shop by Category
      </motion.h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${Math.min(categories.length, isMobile ? 2 : 4)}, 1fr)`,
        gap: '12px',
      }}>
        {categories.slice(0, 4).map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
          >
            <Link
              to={`/shop/${cat.slug}`}
              style={{
                position: 'relative', display: 'block',
                aspectRatio: '1/1.2', overflow: 'hidden',
                background: 'var(--surface)', textDecoration: 'none',
              }}
            >
              {cat.imageUrl && (
                <img
                  src={cat.imageUrl} alt={cat.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                  onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                  onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                />
              )}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(17,17,17,0.7) 0%, transparent 50%)',
                display: 'flex', alignItems: 'flex-end', padding: '20px',
              }}>
                <span style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: '28px', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.02em',
                  color: '#EDE8E3',
                }}>
                  {cat.name}
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function NewArrivalsSection({ products }) {
  const { isMobile } = useWindowSize();
  if (!products?.length) return null;
  return (
    <section style={{ maxWidth: '1400px', margin: '80px auto', padding: '0 32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 'clamp(36px, 5vw, 64px)',
            fontWeight: 900, textTransform: 'uppercase',
            letterSpacing: '-0.02em', color: 'var(--text)', margin: 0,
          }}
        >
          New Arrivals
        </motion.h2>
        <Link to="/shop?sort=newest" style={{
          fontFamily: 'Inter', fontSize: '11px',
          letterSpacing: '0.2em', textTransform: 'uppercase',
          color: 'var(--text)', textDecoration: 'none',
          opacity: 0.6, borderBottom: '1px solid currentColor', paddingBottom: '2px',
        }}>
          See All
        </Link>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${isMobile ? 2 : 4}, 1fr)`, gap: '16px' }}>
        {products.slice(0, 8).map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} />
        ))}
      </div>
    </section>
  );
}

function EditorialBanner() {
  return (
    <section style={{
      background: 'var(--red)', padding: '80px 32px',
      textAlign: 'center', margin: '80px 0',
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 'clamp(48px, 10vw, 120px)',
          fontWeight: 900, textTransform: 'uppercase',
          letterSpacing: '-0.03em', color: '#fff',
          lineHeight: 0.9,
        }}>
          Wear Your<br />Confidence
        </div>
        <p style={{
          fontFamily: 'Inter', fontSize: '14px',
          letterSpacing: '0.15em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.7)', marginTop: '24px',
        }}>
          Fresh styles added regularly
        </p>
        <Link
          to="/shop"
          style={{
            display: 'inline-block', marginTop: '32px',
            padding: '14px 48px',
            background: '#fff', color: '#E8242A',
            fontFamily: 'Inter', fontSize: '12px',
            letterSpacing: '0.2em', textTransform: 'uppercase',
            textDecoration: 'none', fontWeight: 600,
          }}
        >
          Explore Now
        </Link>
      </motion.div>
    </section>
  );
}

export default function Home() {
  const { data: featuredData } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => productAPI.featured(),
    select: d => d.data.data,
  });

  const { data: newArrivalsData } = useQuery({
    queryKey: ['products', 'new-arrivals'],
    queryFn: () => productAPI.newArrivals(),
    select: d => d.data.data,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryAPI.getTree(),
    select: d => d.data.data,
  });

  return (
    <main>
      <HeroSection />
      <MarqueeText />
      <FeaturedGrid products={featuredData} />
      <CategoryStrip categories={categoriesData} />
      <EditorialBanner />
      <NewArrivalsSection products={newArrivalsData} />
    </main>
  );
}
