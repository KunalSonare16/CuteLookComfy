import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

function strengthScore(pw) {
  if (!pw) return 0;
  return [pw.length >= 8, /[A-Z]/.test(pw), /[0-9]/.test(pw), /[^A-Za-z0-9]/.test(pw)].filter(Boolean).length;
}

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const score = strengthScore(password);
  const colors = ['#E8242A', '#f59e0b', '#3b82f6', '#22c55e'];
  const labels = ['Weak', 'Fair', 'Good', 'Strong'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    if (password !== confirm) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await authAPI.resetPassword(token, password);
      setDone(true);
      toast.success('Password reset! You can now sign in.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'This reset link is invalid or has expired');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', boxSizing: 'border-box', background: 'none',
    border: '1px solid var(--border)', padding: '12px 16px',
    color: 'var(--text)', fontFamily: 'Inter', fontSize: '14px', outline: 'none',
    transition: 'border-color 0.2s',
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

          {!token ? (
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: 'Inter', fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '20px' }}>
                This reset link is invalid or missing. Please request a new one.
              </p>
              <Link to="/forgot-password" style={{ fontFamily: 'Inter', fontSize: '12px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--red)', textDecoration: 'none' }}>
                Request New Link
              </Link>
            </div>
          ) : done ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>✓</div>
              <h2 style={{ fontFamily: "'Barlow Condensed'", fontSize: '28px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text)', marginBottom: '12px' }}>Password Reset</h2>
              <p style={{ fontFamily: 'Inter', fontSize: '13px', color: 'var(--text-muted)' }}>Redirecting you to sign in…</p>
            </div>
          ) : (
            <>
              <h2 style={{ fontFamily: "'Barlow Condensed'", fontSize: '28px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text)', marginBottom: '8px', textAlign: 'center' }}>Choose a New Password</h2>
              <p style={{ fontFamily: 'Inter', fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '32px' }}>Enter and confirm your new password.</p>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontFamily: 'Inter', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>New Password</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8}
                    style={inputStyle} onFocus={e => e.target.style.borderColor = 'var(--text)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                  {password && (
                    <div style={{ marginTop: '6px' }}>
                      <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                        {[0,1,2,3].map(i => <div key={i} style={{ flex: 1, height: '3px', borderRadius: '2px', background: i < score ? colors[score-1] : 'var(--border)' }} />)}
                      </div>
                      <span style={{ fontFamily: 'Inter', fontSize: '10px', color: colors[score-1] || 'var(--text-muted)' }}>{score > 0 ? labels[score-1] : ''}</span>
                    </div>
                  )}
                </div>
                <div>
                  <label style={{ fontFamily: 'Inter', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Confirm Password</label>
                  <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required
                    style={inputStyle} onFocus={e => e.target.style.borderColor = 'var(--text)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                </div>
                <button type="submit" disabled={loading} style={{ padding: '14px', background: loading ? 'var(--text-muted)' : 'var(--red)', color: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Inter', fontSize: '12px', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                  {loading ? 'Resetting…' : 'Reset Password'}
                </button>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
