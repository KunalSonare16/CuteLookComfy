import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../../services/api';
import AdminLayout from './AdminLayout';
import toast from 'react-hot-toast';

export default function AdminCoupons() {
  const [page, setPage] = useState(0);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-coupons', page],
    queryFn: () => adminAPI.getCoupons({ page, size: 20 }),
    select: d => d.data.data,
    placeholderData: (prev) => prev,
  });

  const openCreate = () => {
    setForm({ code: '', type: 'PERCENTAGE', value: '', minOrderAmount: '', maxDiscount: '', usageLimit: '', validFrom: '', validUntil: '' });
    setModal({ mode: 'create' });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modal.mode === 'create') {
        await adminAPI.createCoupon(form);
        toast.success('Coupon created');
      } else {
        await adminAPI.updateCoupon(modal.coupon.id, form);
        toast.success('Coupon updated');
      }
      qc.invalidateQueries({ queryKey: ['admin-coupons'] });
      setModal(null);
    } catch { toast.error('Could not save coupon'); }
    finally { setSaving(false); }
  };

  const handleToggle = async (id) => {
    try {
      await adminAPI.toggleCoupon(id);
      qc.invalidateQueries({ queryKey: ['admin-coupons'] });
    } catch {}
  };

  const coupons = data?.content || [];
  const inputStyle = { width: '100%', boxSizing: 'border-box', background: 'none', border: '1px solid var(--border)', padding: '8px 12px', color: 'var(--text)', fontFamily: 'Inter', fontSize: '13px', outline: 'none' };
  const labelStyle = { fontFamily: 'Inter', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' };

  return (
    <AdminLayout title="Coupons">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
        <button onClick={openCreate} style={{ padding: '10px 24px', background: 'var(--red)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>+ Add Coupon</button>
      </div>

      {isLoading ? <div style={{ color: 'var(--text-muted)', fontFamily: 'Inter', fontSize: '13px' }}>Loading…</div> : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Code', 'Type', 'Value', 'Min Order', 'Uses', 'Valid Until', 'Active'].map(h => (
                <th key={h} style={{ fontFamily: 'Inter', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {coupons.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px', fontFamily: "'Barlow Condensed'", fontSize: '18px', fontWeight: 700, color: 'var(--red)', letterSpacing: '0.05em' }}>{c.code}</td>
                <td style={{ padding: '12px', fontFamily: 'Inter', fontSize: '12px', color: 'var(--text-muted)' }}>{c.type}</td>
                <td style={{ padding: '12px', fontFamily: 'Inter', fontSize: '13px', color: 'var(--text)' }}>{c.type === 'PERCENTAGE' ? `${c.value}%` : c.type === 'FREE_SHIPPING' ? 'Free' : `₹${c.value}`}</td>
                <td style={{ padding: '12px', fontFamily: 'Inter', fontSize: '12px', color: 'var(--text-muted)' }}>₹{c.minOrderAmount || 0}</td>
                <td style={{ padding: '12px', fontFamily: 'Inter', fontSize: '12px', color: 'var(--text-muted)' }}>{c.usedCount}/{c.usageLimit || '∞'}</td>
                <td style={{ padding: '12px', fontFamily: 'Inter', fontSize: '12px', color: 'var(--text-muted)' }}>{c.validUntil ? new Date(c.validUntil).toLocaleDateString() : '—'}</td>
                <td style={{ padding: '12px' }}>
                  <button onClick={() => handleToggle(c.id)} style={{ background: c.active ? '#10B98120' : '#EF444420', color: c.active ? '#10B981' : '#EF4444', border: 'none', padding: '4px 10px', cursor: 'pointer', fontFamily: 'Inter', fontSize: '10px', textTransform: 'uppercase' }}>
                    {c.active ? 'Active' : 'Off'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }} onClick={() => setModal(null)}>
          <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '32px', width: '100%', maxWidth: '520px', maxHeight: '80vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontFamily: "'Barlow Condensed'", fontSize: '24px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text)', marginBottom: '20px' }}>New Coupon</h2>
            <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div style={{ gridColumn: '1/-1' }}><label style={labelStyle}>Code</label><input style={{ ...inputStyle, textTransform: 'uppercase' }} value={form.code || ''} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} required /></div>
              <div><label style={labelStyle}>Type</label>
                <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.type || 'PERCENTAGE'} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Fixed Amount (₹)</option>
                  <option value="FREE_SHIPPING">Free Shipping</option>
                </select>
              </div>
              {form.type !== 'FREE_SHIPPING' && <div><label style={labelStyle}>Value</label><input type="number" style={inputStyle} value={form.value || ''} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} required /></div>}
              <div><label style={labelStyle}>Min Order (₹)</label><input type="number" style={inputStyle} value={form.minOrderAmount || ''} onChange={e => setForm(f => ({ ...f, minOrderAmount: e.target.value }))} /></div>
              {form.type === 'PERCENTAGE' && <div><label style={labelStyle}>Max Discount (₹)</label><input type="number" style={inputStyle} value={form.maxDiscount || ''} onChange={e => setForm(f => ({ ...f, maxDiscount: e.target.value }))} /></div>}
              <div><label style={labelStyle}>Usage Limit</label><input type="number" style={inputStyle} value={form.usageLimit || ''} onChange={e => setForm(f => ({ ...f, usageLimit: e.target.value }))} /></div>
              <div><label style={labelStyle}>Valid From</label><input type="date" style={inputStyle} value={form.validFrom || ''} onChange={e => setForm(f => ({ ...f, validFrom: e.target.value }))} /></div>
              <div><label style={labelStyle}>Valid Until</label><input type="date" style={inputStyle} value={form.validUntil || ''} onChange={e => setForm(f => ({ ...f, validUntil: e.target.value }))} /></div>
              <div style={{ gridColumn: '1/-1', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setModal(null)} style={{ padding: '10px 20px', background: 'none', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-muted)', fontFamily: 'Inter', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ padding: '10px 20px', background: 'var(--red)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{saving ? 'Saving…' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
