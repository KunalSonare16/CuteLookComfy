import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { wishlistAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import useWindowSize from '../hooks/useWindowSize';
import toast from 'react-hot-toast';

export default function Wishlist() {
  const { addItem } = useCart();
  const queryClient = useQueryClient();
  const { isMobile } = useWindowSize();

  const { data: items, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => wishlistAPI.get(),
    select: d => d.data.data,
  });

  const handleRemove = async (productId) => {
    try {
      await wishlistAPI.remove(productId);
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    } catch {}
  };

  if (isLoading) return (
    <div style={{ paddingTop: '64px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="loader" />
    </div>
  );

  return (
    <div style={{ paddingTop: '64px', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 32px 80px' }}>
        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ fontFamily: "'Barlow Condensed'", fontSize: 'clamp(40px, 6vw, 64px)', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: '40px' }}
        >
          Wishlist ({items?.length || 0})
        </motion.h1>

        {!items?.length ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ fontFamily: "'Barlow Condensed'", fontSize: '32px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text)' }}>Nothing saved yet</p>
            <Link to="/shop" style={{ display: 'inline-block', marginTop: '20px', padding: '12px 32px', background: 'var(--red)', color: '#fff', textDecoration: 'none', fontFamily: 'Inter', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Browse Collection</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${isMobile ? 2 : 4}, 1fr)`, gap: '16px' }}>
            {items.map((item, i) => (
              <div key={item.id} style={{ position: 'relative' }}>
                <ProductCard product={item.product} index={i} />
                <button
                  onClick={() => handleRemove(item.product.id)}
                  style={{
                    position: 'absolute', top: '8px', right: '8px',
                    background: 'var(--bg)', border: 'none', cursor: 'pointer',
                    width: '28px', height: '28px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', color: 'var(--text)',
                  }}
                  aria-label="Remove from wishlist"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
