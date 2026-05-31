import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { wishlistAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function ProductCard({ product, index = 0 }) {
  const { addItem } = useCart();
  const { user } = useAuth();
  const [wishlisted, setWishlisted] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [adding, setAdding] = useState(false);

  const mainImage = product.featuredImageUrl || product.images?.[0]?.imageUrl || '/placeholder.jpg';
  const hoverImage = product.images?.[1]?.imageUrl || mainImage;
  const hasDiscount = product.comparePrice && product.comparePrice > product.sellingPrice;
  const discountPct = hasDiscount
    ? Math.round((1 - product.sellingPrice / product.comparePrice) * 100)
    : null;

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Sign in to save items'); return; }
    try {
      if (wishlisted) {
        await wishlistAPI.remove(product.id);
        setWishlisted(false);
        toast.success('Removed from wishlist');
      } else {
        await wishlistAPI.add(product.id);
        setWishlisted(true);
        toast.success('Saved to wishlist');
      }
    } catch {}
  };

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    if (!product.variants || product.variants.length === 0) {
      setAdding(true);
      await addItem(product.id, null, 1, product);
      setAdding(false);
    } else {
      window.location.href = `/product/${product.slug}`;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      style={{ position: 'relative' }}
    >
      <Link to={`/product/${product.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
        {/* Image container */}
        <div style={{
          position: 'relative', overflow: 'hidden',
          aspectRatio: '3/4', background: 'var(--surface)',
        }}>
          <motion.img
            src={mainImage}
            alt={product.name}
            animate={{ opacity: hovering ? 0 : 1 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%', objectFit: 'cover',
            }}
          />
          <motion.img
            src={hoverImage}
            alt={product.name}
            animate={{ opacity: hovering ? 1 : 0, scale: hovering ? 1.03 : 1 }}
            transition={{ duration: 0.4 }}
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%', objectFit: 'cover',
            }}
          />

          {/* Badges */}
          <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {product.isNew && (
              <span style={{
                background: 'var(--black)', color: 'var(--bg)',
                fontFamily: 'Inter', fontSize: '9px',
                letterSpacing: '0.2em', textTransform: 'uppercase',
                padding: '4px 8px',
              }}>New</span>
            )}
            {discountPct && (
              <span style={{
                background: 'var(--red)', color: '#fff',
                fontFamily: 'Inter', fontSize: '9px',
                letterSpacing: '0.1em', textTransform: 'uppercase',
                padding: '4px 8px',
              }}>−{discountPct}%</span>
            )}
          </div>

          {/* Wishlist */}
          <button
            onClick={handleWishlist}
            style={{
              position: 'absolute', top: '12px', right: '12px',
              background: 'none', border: 'none', cursor: 'pointer',
              color: wishlisted ? '#E8242A' : 'var(--text)',
              opacity: hovering ? 1 : 0,
              transition: 'opacity 0.2s',
              padding: '4px',
            }}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24"
              fill={wishlisted ? 'currentColor' : 'none'}
              stroke="currentColor" strokeWidth="1.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>

          {/* Quick add */}
          <motion.button
            onClick={handleQuickAdd}
            disabled={adding || product.stockQty === 0}
            animate={{ y: hovering ? 0 : '100%', opacity: hovering ? 1 : 0 }}
            transition={{ duration: 0.25 }}
            style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              background: product.stockQty === 0 ? 'rgba(17,17,17,0.6)' : 'rgba(17,17,17,0.85)',
              color: '#EDE8E3', border: 'none', cursor: product.stockQty === 0 ? 'not-allowed' : 'pointer',
              padding: '14px',
              fontFamily: 'Inter', fontSize: '11px',
              letterSpacing: '0.2em', textTransform: 'uppercase',
            }}
          >
            {product.stockQty === 0 ? 'Sold Out' : adding ? 'Adding…' : 'Quick Add'}
          </motion.button>
        </div>

        {/* Info */}
        <div style={{ paddingTop: '14px' }}>
          {product.categoryName && (
            <div style={{
              fontFamily: 'Inter', fontSize: '10px',
              letterSpacing: '0.2em', textTransform: 'uppercase',
              color: 'var(--text-muted)', marginBottom: '5px',
            }}>
              {product.categoryName}
            </div>
          )}
          <h3 style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: '18px', fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.02em',
            color: 'var(--text)', margin: 0, lineHeight: 1.2,
          }}>
            {product.name}
          </h3>
          <div style={{ marginTop: '6px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: '18px', fontWeight: 700,
              color: 'var(--red)',
            }}>
              ₹{product.sellingPrice?.toLocaleString()}
            </span>
            {hasDiscount && (
              <span style={{
                fontFamily: 'Inter', fontSize: '12px',
                color: 'var(--text-muted)', textDecoration: 'line-through',
              }}>
                ₹{product.comparePrice?.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
