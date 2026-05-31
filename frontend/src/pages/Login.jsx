import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL !== undefined ? process.env.REACT_APP_API_URL : 'http://localhost:8092';

function PasswordStrength({ password }) {
  if (!password) return null;
  const checks = [password.length >= 8, /[A-Z]/.test(password), /[0-9]/.test(password), /[^A-Za-z0-9]/.test(password)];
  const score = checks.filter(Boolean).length;
  const labels = ['Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['#E8242A', '#f59e0b', '#3b82f6', '#22c55e'];
  return (
    <div style={{ marginTop: '6px' }}>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{ flex: 1, height: '3px', borderRadius: '2px', background: i < score ? colors[score - 1] : 'var(--border)', transition: 'background 0.3s' }} />
        ))}
      </div>
      <span style={{ fontFamily: 'Inter', fontSize: '10px', color: colors[score - 1] || 'var(--text-muted)', letterSpacing: '0.05em' }}>
        {score > 0 ? labels[score - 1] : ''}
      </span>
    </div>
  );
}

export default function Login() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ email: '', password: '', name: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [otpStep, setOtpStep] = useState(false); // signup: email-verification step
  const [otp, setOtp] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  // LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/login', { email: form.email, password: form.password });
      login(data.data.accessToken, data.data.user);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally { setLoading(false); }
  };

  // SIGNUP step 1: send email OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/register/send-otp', { email: form.email });
      setOtpStep(true);
      const dev = data.data?.devCode;
      toast.success(dev ? `Code (dev): ${dev}` : 'Verification code sent to your email');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not send code');
    } finally { setLoading(false); }
  };

  // SIGNUP step 2: verify OTP + create account
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/register', {
        email: form.email, password: form.password, name: form.name, phone: form.phone, otp,
      });
      login(data.data.accessToken, data.data.user);
      toast.success('Account created!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh', paddingTop: '64px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)',
    }}>
      <div style={{ width: '100%', maxWidth: '420px', padding: '0 24px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <Link to="/" style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: '36px', fontWeight: 900,
              letterSpacing: '-0.02em', textTransform: 'uppercase',
              color: 'var(--text)', textDecoration: 'none',
            }}>
              CuteLookComfy
            </Link>
            <div style={{ marginTop: '8px' }}>
              <button
                onClick={() => { setMode('login'); setOtpStep(false); setOtp(''); }}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: 'Inter', fontSize: '13px', letterSpacing: '0.1em',
                  textTransform: 'uppercase', padding: '4px 12px',
                  color: mode === 'login' ? 'var(--text)' : 'var(--text-muted)',
                  borderBottom: mode === 'login' ? '2px solid var(--red)' : '2px solid transparent',
                }}
              >
                Sign In
              </button>
              <button
                onClick={() => { setMode('register'); setOtpStep(false); setOtp(''); }}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: 'Inter', fontSize: '13px', letterSpacing: '0.1em',
                  textTransform: 'uppercase', padding: '4px 12px',
                  color: mode === 'register' ? 'var(--text)' : 'var(--text-muted)',
                  borderBottom: mode === 'register' ? '2px solid var(--red)' : '2px solid transparent',
                }}
              >
                Create Account
              </button>
            </div>
          </div>

          {/* Google OAuth */}
          <a
            href={`${API_URL}/oauth2/authorization/google`}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              padding: '12px', border: '1px solid var(--border)',
              textDecoration: 'none', color: 'var(--text)',
              fontFamily: 'Inter', fontSize: '13px', letterSpacing: '0.05em',
              marginBottom: '24px',
              transition: 'border-color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--text)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </a>

          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            marginBottom: '24px',
          }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            <span style={{ fontFamily: 'Inter', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              or
            </span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          </div>

          {/* Signup OTP step */}
          {mode === 'register' && otpStep ? (
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ fontFamily: 'Inter', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, textAlign: 'center' }}>
                We sent a 6-digit code to <strong style={{ color: 'var(--text)' }}>{form.email}</strong>. Enter it below to verify your email and create your account.
              </p>
              <div>
                <label style={{ fontFamily: 'Inter', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                  Verification Code
                </label>
                <input
                  type="text" inputMode="numeric" maxLength={6} value={otp}
                  onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  required autoFocus placeholder="000000"
                  style={{ width: '100%', boxSizing: 'border-box', background: 'none', border: '1px solid var(--border)', padding: '12px 16px', color: 'var(--text)', fontFamily: 'Inter', fontSize: '20px', letterSpacing: '0.3em', textAlign: 'center', outline: 'none' }}
                  onFocus={e => e.target.style.borderColor = 'var(--text)'} onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
              <button type="submit" disabled={loading} style={{ padding: '14px', background: loading ? 'var(--text-muted)' : 'var(--red)', color: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Inter', fontSize: '12px', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                {loading ? 'Please wait…' : 'Verify & Create Account'}
              </button>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Inter', fontSize: '11px' }}>
                <button type="button" onClick={() => { setOtpStep(false); setOtp(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', textDecoration: 'underline' }}>← Change details</button>
                <button type="button" onClick={handleSendOtp} disabled={loading} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)', textDecoration: 'underline' }}>Resend code</button>
              </div>
            </form>
          ) : (
          <form onSubmit={mode === 'login' ? handleLogin : handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {mode === 'register' && (
              <div>
                <label style={{ fontFamily: 'Inter', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    background: 'none', border: '1px solid var(--border)',
                    padding: '12px 16px', color: 'var(--text)',
                    fontFamily: 'Inter', fontSize: '14px', outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--text)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label style={{ fontFamily: 'Inter', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  required
                  placeholder="10-digit mobile number"
                  pattern="[0-9+\- ]{10,15}"
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    background: 'none', border: '1px solid var(--border)',
                    padding: '12px 16px', color: 'var(--text)',
                    fontFamily: 'Inter', fontSize: '14px', outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--text)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
                <div style={{ fontFamily: 'Inter', fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
                  Used for order updates and delivery.
                </div>
              </div>
            )}

            <div>
              <label style={{ fontFamily: 'Inter', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: 'none', border: '1px solid var(--border)',
                  padding: '12px 16px', color: 'var(--text)',
                  fontFamily: 'Inter', fontSize: '14px', outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--text)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            <div>
              <label style={{ fontFamily: 'Inter', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                Password
              </label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
                minLength={8}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: 'none', border: '1px solid var(--border)',
                  padding: '12px 16px', color: 'var(--text)',
                  fontFamily: 'Inter', fontSize: '14px', outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--text)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
              {mode === 'register' && <PasswordStrength password={form.password} />}
            </div>

            {mode === 'login' && (
              <div style={{ textAlign: 'right', marginTop: '-8px' }}>
                <Link to="/forgot-password" style={{ fontFamily: 'Inter', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.05em', textDecoration: 'none' }}
                  onMouseEnter={e => e.target.style.color = 'var(--red)'}
                  onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
                >
                  Forgot password?
                </Link>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '14px', background: loading ? 'var(--text-muted)' : 'var(--red)',
                color: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'Inter', fontSize: '12px',
                letterSpacing: '0.2em', textTransform: 'uppercase',
                transition: 'background 0.2s',
                marginTop: '8px',
              }}
            >
              {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Send Verification Code'}
            </button>
          </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
