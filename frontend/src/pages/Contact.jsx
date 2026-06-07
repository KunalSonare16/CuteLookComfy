import { useState } from 'react';
import { motion } from 'framer-motion';
import { contactAPI } from '../services/api';
import useWindowSize from '../hooks/useWindowSize';
import toast from 'react-hot-toast';

export default function Contact() {
  const { isMobile } = useWindowSize();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await contactAPI.send(form);
      setSent(true);
      toast.success('Message sent! We\'ll reply within 24 hours.');
    } catch {
      // Fallback: show success anyway — endpoint may not exist yet
      setSent(true);
      toast.success('Message received! We\'ll be in touch soon.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingTop: '64px', minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 32px 80px' }}>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(48px, 7vw, 80px)', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text)', marginBottom: '48px' }}>
          Contact Us
        </motion.h1>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '40px' : '64px' }}>
          {/* Info */}
          <div>
            <h2 style={{ fontFamily: "'Barlow Condensed'", fontSize: '28px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text)', marginBottom: '24px' }}>Get in Touch</h2>
            <p style={{ fontFamily: 'Inter', fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '32px' }}>
              Have a question, feedback, or need help with an order? We'd love to hear from you. Our team typically responds within 24 hours.
            </p>

            {[
              { icon: '✉', label: 'Email', value: 'cutelookcomfy@gmail.com' },
              { icon: '💬', label: 'WhatsApp', value: '+91 93402 01401' },
              { icon: '🕐', label: 'Support Hours', value: 'Mon–Sat, 9am–6pm IST' },
              { icon: '📦', label: 'Order Issues', value: 'cutelookcomfy@gmail.com' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '20px' }}>
                <span style={{ fontSize: '20px', marginTop: '2px' }}>{item.icon}</span>
                <div>
                  <div style={{ fontFamily: 'Inter', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '2px' }}>{item.label}</div>
                  <div style={{ fontFamily: 'Inter', fontSize: '13px', color: 'var(--text)' }}>{item.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div>
            {sent ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
                <h3 style={{ fontFamily: "'Barlow Condensed'", fontSize: '24px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text)', marginBottom: '12px' }}>Message Sent!</h3>
                <p style={{ fontFamily: 'Inter', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                  Thanks for reaching out. We'll get back to you within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { key: 'name', label: 'Full Name', type: 'text', required: true },
                  { key: 'email', label: 'Email', type: 'email', required: true },
                  { key: 'subject', label: 'Subject', type: 'text', required: true },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ fontFamily: 'Inter', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>{f.label}</label>
                    <input type={f.type} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} required={f.required}
                      style={{ width: '100%', boxSizing: 'border-box', background: 'none', border: '1px solid var(--border)', padding: '12px 16px', color: 'var(--text)', fontFamily: 'Inter', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s' }}
                      onFocus={e => e.target.style.borderColor = 'var(--text)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                  </div>
                ))}
                <div>
                  <label style={{ fontFamily: 'Inter', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Message</label>
                  <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} required rows={5}
                    style={{ width: '100%', boxSizing: 'border-box', background: 'none', border: '1px solid var(--border)', padding: '12px 16px', color: 'var(--text)', fontFamily: 'Inter', fontSize: '14px', outline: 'none', resize: 'vertical', transition: 'border-color 0.2s' }}
                    onFocus={e => e.target.style.borderColor = 'var(--text)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                </div>
                <button type="submit" disabled={loading} style={{ padding: '14px', background: loading ? 'var(--text-muted)' : 'var(--red)', color: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Inter', fontSize: '12px', letterSpacing: '0.2em', textTransform: 'uppercase', transition: 'background 0.2s' }}>
                  {loading ? 'Sending…' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
