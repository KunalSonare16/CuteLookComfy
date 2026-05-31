import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import CartDrawer from './CartDrawer';
import useWindowSize from '../hooks/useWindowSize';

const themes = [
  { key: 'cream', label: 'Cream', color: '#EDE8E3' },
  { key: 'dark', label: 'Dark', color: '#111111' },
  { key: 'red', label: 'Red', color: '#E8242A' },
];

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { itemCount, setDrawerOpen } = useCart();
  const { theme, setTheme } = useTheme();
  const { isMobile } = useWindowSize();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setThemeOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQ.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQ.trim())}`);
      setSearchOpen(false);
      setSearchQ('');
    }
  };

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: scrolled ? 'var(--bg)' : 'transparent',
        borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
        transition: 'background 0.3s ease, border-color 0.3s ease',
        backdropFilter: scrolled ? 'blur(8px)' : 'none',
      }}>
        <div style={{
          maxWidth: '1400px', margin: '0 auto',
          padding: isMobile ? '0 16px' : '0 32px',
          height: '64px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          {/* Left — hamburger / nav links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px', flex: 1 }}>
            <button
              onClick={() => setMenuOpen(o => !o)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', gap: '5px', padding: '4px',
              }}
              aria-label="Menu"
            >
              {[0,1,2].map(i => (
                <motion.span
                  key={i}
                  animate={menuOpen ? {
                    rotate: i === 0 ? 45 : i === 2 ? -45 : 0,
                    y: i === 0 ? 7 : i === 2 ? -7 : 0,
                    opacity: i === 1 ? 0 : 1,
                  } : { rotate: 0, y: 0, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    display: 'block', width: '22px', height: '1.5px',
                    background: 'var(--text)', transformOrigin: 'center',
                  }}
                />
              ))}
            </button>

            {!isMobile && (
              <div style={{ display: 'flex', gap: '24px' }}>
                {['Shop', 'New Arrivals', 'Sale'].map(item => (
                  <Link
                    key={item}
                    to={item === 'Shop' ? '/shop' : item === 'New Arrivals' ? '/shop?new=true' : '/shop?sale=true'}
                    style={{
                      fontFamily: 'Inter, sans-serif', fontSize: '12px',
                      letterSpacing: '0.12em', textTransform: 'uppercase',
                      color: 'var(--text)', textDecoration: 'none',
                      opacity: 0.7, transition: 'opacity 0.2s',
                    }}
                    onMouseEnter={e => e.target.style.opacity = 1}
                    onMouseLeave={e => e.target.style.opacity = 0.7}
                  >
                    {item}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Center — logo. On mobile it flows in normal layout (not absolute) to avoid overlap. */}
          <Link
            to="/"
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: isMobile ? '16px' : '28px', fontWeight: 900,
              letterSpacing: '-0.02em', textTransform: 'uppercase',
              color: 'var(--text)', textDecoration: 'none',
              whiteSpace: 'nowrap',
              ...(isMobile
                ? { position: 'static', flexShrink: 0 }
                : { position: 'absolute', left: '50%', transform: 'translateX(-50%)' }),
            }}
          >
            CuteLookComfy
          </Link>

          {/* Right — actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '12px' : '20px', flex: 1, justifyContent: 'flex-end' }}>
            <button
              onClick={() => setSearchOpen(o => !o)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--text)', opacity: 0.7 }}
              aria-label="Search"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="7" /><path d="m21 21-4.35-4.35" />
              </svg>
            </button>

            {user ? (
              <Link to="/profile" style={{ color: 'var(--text)', opacity: 0.7, textDecoration: 'none' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
              </Link>
            ) : isMobile ? (
              <Link to="/login" aria-label="Sign in" style={{ color: 'var(--text)', opacity: 0.7, textDecoration: 'none' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
              </Link>
            ) : (
              <Link to="/login" style={{
                fontFamily: 'Inter, sans-serif', fontSize: '11px',
                letterSpacing: '0.15em', textTransform: 'uppercase',
                color: 'var(--text)', textDecoration: 'none', opacity: 0.7,
              }}>
                Sign In
              </Link>
            )}

            {isAdmin && (
              <Link to="/admin" style={{
                fontFamily: 'Inter, sans-serif', fontSize: '11px',
                letterSpacing: '0.1em', textTransform: 'uppercase',
                color: 'var(--red)', textDecoration: 'none',
              }}>
                Admin
              </Link>
            )}

            <button
              onClick={() => setDrawerOpen(true)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px',
                fontFamily: 'Inter, sans-serif', fontSize: '12px',
                color: 'var(--text)', padding: '4px',
              }}
              aria-label={`Bag (${itemCount} items)`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              <span style={{ minWidth: '16px', color: itemCount > 0 ? 'var(--red)' : 'var(--text)' }}>
                {itemCount}
              </span>
            </button>

            {/* Theme switcher — 3 dots */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setThemeOpen(o => !o)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  display: 'flex', gap: '3px', padding: '4px',
                }}
                aria-label="Switch theme"
              >
                {themes.map(t => (
                  <span key={t.key} style={{
                    width: '7px', height: '7px', borderRadius: '50%',
                    background: t.color,
                    border: theme === t.key ? '1.5px solid var(--text)' : '1px solid rgba(128,128,128,0.4)',
                    display: 'block', transition: 'border 0.2s',
                  }} />
                ))}
              </button>
              <AnimatePresence>
                {themeOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      position: 'absolute', top: '100%', right: 0,
                      marginTop: '8px',
                      background: 'var(--bg)',
                      border: '1px solid var(--border)',
                      padding: '8px',
                      minWidth: '100px',
                      zIndex: 100,
                    }}
                  >
                    {themes.map(t => (
                      <button
                        key={t.key}
                        onClick={() => { setTheme(t.key); setThemeOpen(false); }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '10px',
                          width: '100%', padding: '8px 12px',
                          background: theme === t.key ? 'var(--surface)' : 'none',
                          border: 'none', cursor: 'pointer',
                          fontFamily: 'Inter, sans-serif', fontSize: '12px',
                          letterSpacing: '0.08em', textTransform: 'uppercase',
                          color: 'var(--text)',
                        }}
                      >
                        <span style={{
                          width: '10px', height: '10px', borderRadius: '50%',
                          background: t.color, border: '1px solid rgba(128,128,128,0.3)',
                          flexShrink: 0,
                        }} />
                        {t.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Search bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{ overflow: 'hidden', borderTop: '1px solid var(--border)', background: 'var(--bg)' }}
            >
              <form onSubmit={handleSearch} style={{
                maxWidth: '1400px', margin: '0 auto', padding: '16px 32px',
                display: 'flex', gap: '12px',
              }}>
                <input
                  autoFocus
                  value={searchQ}
                  onChange={e => setSearchQ(e.target.value)}
                  placeholder="Search for products…"
                  style={{
                    flex: 1, background: 'none', border: 'none',
                    borderBottom: '1px solid var(--text)',
                    padding: '8px 0', fontSize: '16px',
                    fontFamily: 'Inter, sans-serif', color: 'var(--text)',
                    outline: 'none',
                  }}
                />
                <button type="submit" style={{
                  background: 'var(--red)', color: '#fff',
                  border: 'none', padding: '8px 24px',
                  fontFamily: 'Inter, sans-serif', fontSize: '11px',
                  letterSpacing: '0.15em', textTransform: 'uppercase',
                  cursor: 'pointer',
                }}>
                  Search
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Full-screen menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '-100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '-100%' }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'fixed', top: 0, left: 0, bottom: 0,
              width: 'min(420px, 90vw)',
              background: 'var(--bg)',
              borderRight: '1px solid var(--border)',
              zIndex: 999,
              display: 'flex', flexDirection: 'column',
              padding: '80px 48px 48px',
            }}
          >
            <nav style={{ flex: 1 }}>
              {[
                { label: 'Shop All', to: '/shop' },
                { label: 'New Arrivals', to: '/shop?new=true' },
                { label: 'Kids', to: '/shop/kids' },
                { label: 'Sale', to: '/shop?sale=true' },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                >
                  <Link
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    style={{
                      display: 'block',
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: 'clamp(40px, 6vw, 56px)',
                      fontWeight: 700,
                      letterSpacing: '-0.02em',
                      textTransform: 'uppercase',
                      color: 'var(--text)',
                      textDecoration: 'none',
                      lineHeight: 1.1,
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text)'}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </nav>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
              {user ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <Link to="/orders" onClick={() => setMenuOpen(false)} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'Inter' }}>Orders</Link>
                  <Link to="/wishlist" onClick={() => setMenuOpen(false)} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'Inter' }}>Wishlist</Link>
                  <button onClick={logout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', textAlign: 'left', padding: 0, fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'Inter' }}>Sign Out</button>
                </div>
              ) : (
                <Link to="/login" onClick={() => setMenuOpen(false)} style={{
                  display: 'inline-block', padding: '12px 32px',
                  background: 'var(--red)', color: '#fff',
                  fontFamily: 'Inter', fontSize: '12px',
                  letterSpacing: '0.15em', textTransform: 'uppercase',
                  textDecoration: 'none',
                }}>
                  Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Menu overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setMenuOpen(false)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
              zIndex: 998,
            }}
          />
        )}
      </AnimatePresence>

      <CartDrawer />
    </>
  );
}
