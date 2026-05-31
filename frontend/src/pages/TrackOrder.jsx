import { useState } from 'react';
import { motion } from 'framer-motion';
import { orderAPI } from '../services/api';

const STATUS_STEPS = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
const STATUS_COLOR = { PENDING: '#F59E0B', CONFIRMED: '#3B82F6', PROCESSING: '#8B5CF6', SHIPPED: '#06B6D4', DELIVERED: '#10B981', CANCELLED: '#EF4444' };

export default function TrackOrder() {
  const [form, setForm] = useState({ orderId: '', email: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const { data } = await orderAPI.track(form.orderId, form.email);
      setResult(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Order not found. Check your order ID and email.');
    } finally {
      setLoading(false);
    }
  };

  const currentStep = result ? STATUS_STEPS.indexOf(result.status) : -1;

  return (
    <div style={{ paddingTop: '64px', minHeight: '100vh' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '60px 32px 80px' }}>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ fontFamily: "'Barlow Condensed'", fontSize: 'clamp(48px, 7vw, 80px)', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: '16px' }}>
          Track Your Order
        </motion.h1>
        <p style={{ fontFamily: 'Inter', fontSize: '14px', color: 'var(--text-muted)', marginBottom: '40px' }}>
          Enter your order ID and email to get the latest status.
        </p>

        <form onSubmit={handleTrack} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
          <div>
            <label style={{ fontFamily: 'Inter', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Order ID</label>
            <input
              value={form.orderId}
              onChange={e => setForm(f => ({ ...f, orderId: e.target.value }))}
              placeholder="e.g. ORD-20241201-0001"
              required
              style={{ width: '100%', boxSizing: 'border-box', background: 'none', border: '1px solid var(--border)', padding: '12px 16px', color: 'var(--text)', fontFamily: 'Inter', fontSize: '14px', outline: 'none' }}
              onFocus={e => e.target.style.borderColor = 'var(--text)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
          <div>
            <label style={{ fontFamily: 'Inter', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Email Address</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="you@email.com"
              required
              style={{ width: '100%', boxSizing: 'border-box', background: 'none', border: '1px solid var(--border)', padding: '12px 16px', color: 'var(--text)', fontFamily: 'Inter', fontSize: '14px', outline: 'none' }}
              onFocus={e => e.target.style.borderColor = 'var(--text)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
          <button type="submit" disabled={loading} style={{ padding: '14px', background: loading ? 'var(--text-muted)' : 'var(--red)', color: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Inter', fontSize: '12px', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            {loading ? 'Tracking…' : 'Track Order'}
          </button>
        </form>

        {error && (
          <div style={{ padding: '16px', background: '#E8242A20', border: '1px solid #E8242A40', color: '#E8242A', fontFamily: 'Inter', fontSize: '13px', marginBottom: '24px' }}>
            {error}
          </div>
        )}

        {result && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ padding: '24px', border: '1px solid var(--border)', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div>
                  <div style={{ fontFamily: 'Inter', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>Order</div>
                  <div style={{ fontFamily: "'Barlow Condensed'", fontSize: '22px', fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase' }}>#{(result.id || '').slice(0, 8).toUpperCase()}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'Inter', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>Status</div>
                  <div style={{ fontFamily: "'Barlow Condensed'", fontSize: '22px', fontWeight: 700, color: STATUS_COLOR[result.status] || 'var(--text)', textTransform: 'uppercase' }}>{result.status}</div>
                </div>
              </div>

              {result.status !== 'CANCELLED' && (
                <div style={{ position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '14px', left: '0', right: '0', height: '2px', background: 'var(--border)' }} />
                    <div style={{ position: 'absolute', top: '14px', left: '0', height: '2px', background: 'var(--red)', transition: 'width 0.5s', width: currentStep >= 0 ? `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` : '0' }} />
                    {STATUS_STEPS.map((step, i) => (
                      <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', position: 'relative', zIndex: 1 }}>
                        <div style={{
                          width: '28px', height: '28px', borderRadius: '50%',
                          background: i <= currentStep ? 'var(--red)' : 'var(--bg)',
                          border: `2px solid ${i <= currentStep ? 'var(--red)' : 'var(--border)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {i <= currentStep && <span style={{ color: '#fff', fontSize: '12px' }}>✓</span>}
                        </div>
                        <span style={{ fontFamily: 'Inter', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: i <= currentStep ? 'var(--text)' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          {step}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.trackingNumber && (
                <div style={{ marginTop: '24px', padding: '12px 16px', background: 'var(--surface)' }}>
                  <span style={{ fontFamily: 'Inter', fontSize: '12px', color: 'var(--text-muted)' }}>Tracking Number: </span>
                  <span style={{ fontFamily: 'Inter', fontSize: '12px', fontWeight: 500, color: 'var(--text)' }}>{result.trackingNumber}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
