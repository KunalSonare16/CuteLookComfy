import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authAPI } from '../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
    } catch {
      // Intentionally show success regardless — prevents email enumeration
    } finally {
      setLoading(false);
      setSent(true);
    }
  };

  return (
    <div style={{ minHeight: '100vh', paddingTop: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ width: '100%', maxWidth: '420px', padding: '0 24px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <Link to="/" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '36px', fontWeight: 900, letterSpacing: '-0.02em', textTransform: 'uppercase', color: 'var(--text)', textDecoration: 'none' }}>
              CuteLookComfy
            </Link>
          </div>

          {sent ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>✉️</div>
              <h2 style={{ fontFamily: "'Barlow Condensed'", fontSize: '28px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text)', marginBottom: '12px' }}>Check your inbox</h2>
              <p style={{ fontFamily: 'Inter', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '24px' }}>
                If an account exists for <strong>{email}</strong>, we've sent a password reset link. Check your spam folder if you don't see it.
              </p>
              <Link to="/login" style={{ fontFamily: 'Inter', fontSize: '12px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--red)', textDecoration: 'none' }}>
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <h2 style={{ fontFamily: "'Barlow Condensed'", fontSize: '28px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text)', marginBottom: '8px', textAlign: 'center' }}>Reset Password</h2>
              <p style={{ fontFamily: 'Inter', fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '32px', lineHeight: 1.6 }}>
                Enter your email and we'll send you a reset link.
              </p>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontFamily: 'Inter', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Email</label>
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)} required
                    style={{ width: '100%', boxSizing: 'border-box', background: 'none', border: '1px solid var(--border)', padding: '12px 16px', color: 'var(--text)', fontFamily: 'Inter', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s' }}
                    onFocus={e => e.target.style.borderColor = 'var(--text)'} onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
                <button type="submit" disabled={loading} style={{ padding: '14px', background: loading ? 'var(--text-muted)' : 'var(--red)', color: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Inter', fontSize: '12px', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                  {loading ? 'Sending…' : 'Send Reset Link'}
                </button>
              </form>
              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <Link to="/login" style={{ fontFamily: 'Inter', fontSize: '12px', color: 'var(--text-muted)', letterSpacing: '0.05em', textDecoration: 'none' }}>
                  ← Back to Sign In
                </Link>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
