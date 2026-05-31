import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div style={{ paddingTop: '64px', minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ textAlign: 'center', padding: '0 24px' }}
      >
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 'clamp(120px, 20vw, 240px)',
          fontWeight: 900, lineHeight: 1,
          color: 'var(--red)', letterSpacing: '-0.04em',
          userSelect: 'none',
        }}>
          404
        </div>
        <h1 style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 'clamp(28px, 5vw, 48px)',
          fontWeight: 900, textTransform: 'uppercase',
          color: 'var(--text)', letterSpacing: '-0.02em',
          marginTop: '-8px', marginBottom: '16px',
        }}>
          Page Not Found
        </h1>
        <p style={{
          fontFamily: 'Inter', fontSize: '14px',
          color: 'var(--text-muted)', lineHeight: 1.8,
          maxWidth: '400px', margin: '0 auto 32px',
        }}>
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" style={{
            padding: '14px 40px', background: 'var(--red)',
            color: '#fff', fontFamily: 'Inter', fontSize: '12px',
            letterSpacing: '0.2em', textTransform: 'uppercase', textDecoration: 'none',
          }}>
            Go Home
          </Link>
          <Link to="/shop" style={{
            padding: '14px 40px', background: 'none',
            border: '1px solid var(--border)',
            color: 'var(--text)', fontFamily: 'Inter', fontSize: '12px',
            letterSpacing: '0.2em', textTransform: 'uppercase', textDecoration: 'none',
          }}>
            Browse Shop
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
