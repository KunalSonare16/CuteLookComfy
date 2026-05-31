import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../../services/api';
import AdminLayout from './AdminLayout';
import toast from 'react-hot-toast';

export default function AdminCategories() {
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', parentId: '' });
  const [saving, setSaving] = useState(false);
  const qc = useQueryClient();

  const { data: categories, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => adminAPI.getCategories(),
    select: d => d.data.data,
  });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, parentId: form.parentId || null };
      if (modal.mode === 'create') {
        await adminAPI.createCategory(payload);
        toast.success('Category created');
      } else {
        await adminAPI.updateCategory(modal.cat.id, payload);
        toast.success('Category updated');
      }
      qc.invalidateQueries({ queryKey: ['admin-categories'] });
      setModal(null);
    } catch {
      toast.error('Could not save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await adminAPI.deleteCategory(id);
      qc.invalidateQueries({ queryKey: ['admin-categories'] });
      toast.success('Deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete');
    }
  };

  const inputStyle = { width: '100%', boxSizing: 'border-box', background: 'none', border: '1px solid var(--border)', padding: '8px 12px', color: 'var(--text)', fontFamily: 'Inter', fontSize: '13px', outline: 'none' };
  const labelStyle = { fontFamily: 'Inter', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' };

  return (
    <AdminLayout title="Categories">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
        <button onClick={() => { setForm({ name: '', description: '', parentId: '' }); setModal({ mode: 'create' }); }}
          style={{ padding: '10px 24px', background: 'var(--red)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          + Add Category
        </button>
      </div>

      {isLoading ? <div style={{ color: 'var(--text-muted)', fontFamily: 'Inter', fontSize: '13px' }}>Loading…</div> : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Name', 'Slug', 'Parent', 'Actions'].map(h => (
                <th key={h} style={{ fontFamily: 'Inter', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categories?.map(cat => (
              <tr key={cat.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px', fontFamily: 'Inter', fontSize: '13px', color: 'var(--text)' }}>{cat.name}</td>
                <td style={{ padding: '12px', fontFamily: 'Inter', fontSize: '12px', color: 'var(--text-muted)' }}>{cat.slug}</td>
                <td style={{ padding: '12px', fontFamily: 'Inter', fontSize: '12px', color: 'var(--text-muted)' }}>{categories?.find(c => c.id === cat.parentId)?.name || '—'}</td>
                <td style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => { setForm({ name: cat.name, description: cat.description || '', parentId: cat.parentId || '' }); setModal({ mode: 'edit', cat }); }}
                      style={{ padding: '6px 12px', background: 'none', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text)', fontFamily: 'Inter', fontSize: '11px' }}>Edit</button>
                    <button onClick={() => handleDelete(cat.id)}
                      style={{ padding: '6px 12px', background: 'none', border: '1px solid var(--red)', cursor: 'pointer', color: 'var(--red)', fontFamily: 'Inter', fontSize: '11px' }}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }} onClick={() => setModal(null)}>
          <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '32px', width: '100%', maxWidth: '440px' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontFamily: "'Barlow Condensed'", fontSize: '24px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text)', marginBottom: '20px' }}>{modal.mode === 'create' ? 'New Category' : 'Edit Category'}</h2>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div><label style={labelStyle}>Name</label><input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
              <div><label style={labelStyle}>Description</label><textarea style={{ ...inputStyle, height: '60px', resize: 'vertical' }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
              <div>
                <label style={labelStyle}>Parent Category</label>
                <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.parentId} onChange={e => setForm(f => ({ ...f, parentId: e.target.value }))}>
                  <option value="">None (Top Level)</option>
                  {categories?.filter(c => c.id !== modal.cat?.id).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
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
