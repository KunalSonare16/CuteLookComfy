import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function CartDrawer() {
  const { cart, drawerOpen, setDrawerOpen, updateItem, removeItem } = useCart();
  const { user } = useAuth();

  const items = cart?.items || [];
  const subtotal = cart?.subtotal || 0;

  return (
    <>
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDrawerOpen(false)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
              zIndex: 1001,
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0,
              width: 'min(420px, 100vw)',
              background: 'var(--bg)',
              zIndex: 1002,
              display: 'flex', flexDirection: 'column',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '24px 28px',
              borderBottom: '1px solid var(--border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <h2 style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '28px', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '-0.01em',
                color: 'var(--text)', margin: 0,
              }}>
                Your Bag ({items.length})
              </h2>
              <button
                onClick={() => setDrawerOpen(false)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text)', fontSize: '20px', lineHeight: 1,
                  opacity: 0.6,
                }}
              >
                ✕
              </button>
            </div>

            {/* Items */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 28px' }}>
              {items.length === 0 ? (
                <div style={{
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  height: '100%', gap: '16px',
                  color: 'var(--text-muted)',
                }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 01-8 0" />
                  </svg>
                  <p style={{ fontFamily: 'Inter', fontSize: '13px', letterSpacing: '0.05em' }}>
                    Your bag is empty
                  </p>
                  <Link
                    to="/shop"
                    onClick={() => setDrawerOpen(false)}
                    style={{
                      padding: '10px 24px', background: 'var(--red)',
                      color: '#fff', textDecoration: 'none',
                      fontFamily: 'Inter', fontSize: '11px',
                      letterSpacing: '0.15em', textTransform: 'uppercase',
                    }}
                  >
                    Shop Now
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {items.map(item => (
                    <motion.div
                      key={item.productId}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      style={{
                        display: 'flex', gap: '16px',
                        paddingBottom: '20px',
                        borderBottom: '1px solid var(--border)',
                      }}
                    >
                      <Link
                        to={`/product/${item.slug}`}
                        onClick={() => setDrawerOpen(false)}
                        style={{
                          width: '80px', height: '100px', flexShrink: 0,
                          overflow: 'hidden', display: 'block',
                        }}
                      >
                        <img
                          src={item.productImage || '/placeholder.jpg'}
                          alt={item.productName}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </Link>

                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <Link
                          to={`/product/${item.slug}`}
                          onClick={() => setDrawerOpen(false)}
                          style={{
                            fontFamily: "'Barlow Condensed', sans-serif",
                            fontSize: '17px', fontWeight: 600,
                            textTransform: 'uppercase', letterSpacing: '0.02em',
                            color: 'var(--text)', textDecoration: 'none',
                            lineHeight: 1.2,
                          }}
                        >
                          {item.productName}
                        </Link>

                        {item.variantLabel && (
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'Inter', letterSpacing: '0.05em' }}>
                            {item.variantLabel}
                          </span>
                        )}

                        <span style={{
                          fontFamily: "'Barlow Condensed', sans-serif",
                          fontSize: '16px', fontWeight: 700,
                          color: 'var(--red)',
                        }}>
                          ₹{((item.unitPrice || 0) * (item.qty || 1)).toLocaleString()}
                        </span>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)' }}>
                            <button
                              onClick={() => updateItem(item.productId, item.qty - 1)}
                              style={{
                                width: '28px', height: '28px', background: 'none',
                                border: 'none', cursor: 'pointer', color: 'var(--text)',
                                fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}
                            >
                              −
                            </button>
                            <span style={{
                              width: '28px', textAlign: 'center',
                              fontFamily: 'Inter', fontSize: '13px', color: 'var(--text)',
                            }}>
                              {item.qty}
                            </span>
                            <button
                              onClick={() => updateItem(item.productId, item.qty + 1)}
                              style={{
                                width: '28px', height: '28px', background: 'none',
                                border: 'none', cursor: 'pointer', color: 'var(--text)',
                                fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}
                            >
                              +
                            </button>
                          </div>

                          <button
                            onClick={() => removeItem(item.productId)}
                            style={{
                              background: 'none', border: 'none', cursor: 'pointer',
                              color: 'var(--text-muted)', fontSize: '11px',
                              fontFamily: 'Inter', letterSpacing: '0.1em',
                              textTransform: 'uppercase', padding: 0,
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div style={{
                padding: '20px 28px',
                borderTop: '1px solid var(--border)',
              }}>
                {cart?.discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontFamily: 'Inter', fontSize: '12px', color: 'var(--text-muted)' }}>Discount</span>
                    <span style={{ fontFamily: 'Inter', fontSize: '12px', color: 'var(--red)' }}>
                      −₹{cart.discountAmount.toLocaleString()}
                    </span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <span style={{ fontFamily: 'Inter', fontSize: '13px', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text)' }}>
                    Subtotal
                  </span>
                  <span style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: '22px', fontWeight: 700, color: 'var(--text)',
                  }}>
                    ₹{subtotal.toLocaleString()}
                  </span>
                </div>

                {user ? (
                  <Link
                    to="/checkout"
                    onClick={() => setDrawerOpen(false)}
                    style={{
                      display: 'block', width: '100%', padding: '16px',
                      background: 'var(--red)', color: '#fff',
                      textAlign: 'center', textDecoration: 'none',
                      fontFamily: 'Inter', fontSize: '12px',
                      letterSpacing: '0.2em', textTransform: 'uppercase',
                    }}
                  >
                    Checkout
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setDrawerOpen(false)}
                    style={{
                      display: 'block', width: '100%', padding: '16px',
                      background: 'var(--black)', color: 'var(--bg)',
                      textAlign: 'center', textDecoration: 'none',
                      fontFamily: 'Inter', fontSize: '12px',
                      letterSpacing: '0.2em', textTransform: 'uppercase',
                    }}
                  >
                    Sign In to Checkout
                  </Link>
                )}

                <p style={{
                  textAlign: 'center', marginTop: '12px',
                  fontFamily: 'Inter', fontSize: '11px',
                  color: 'var(--text-muted)', letterSpacing: '0.05em',
                }}>
                  Flat ₹50 shipping on all orders
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
