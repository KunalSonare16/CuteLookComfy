import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../../services/api';
import AdminLayout from './AdminLayout';
import toast from 'react-hot-toast';

export default function AdminProducts() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // null | { mode: 'create'|'edit', product? }
  const [form, setForm] = useState({});
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [saving, setSaving] = useState(false);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', page, search],
    queryFn: () => adminAPI.getProducts({ page, size: 20, search: search || undefined }),
    select: d => d.data.data,
    placeholderData: (prev) => prev,
  });

  const { data: categories } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => adminAPI.getCategories(),
    select: d => d.data.data,
  });

  const openCreate = () => {
    setForm({ name: '', description: '', sellingPrice: '', comparePrice: '', stockQty: '', sku: '', categoryId: '', sizes: '' });
    setImageFiles([]);
    setImagePreviews([]);
    setModal({ mode: 'create' });
  };

  const openEdit = (product) => {
    setForm({
      name: product.name || '',
      description: product.description || '',
      sellingPrice: product.sellingPrice || '',
      comparePrice: product.comparePrice || '',
      stockQty: product.stockQty || '',
      sku: product.sku || '',
      categoryId: product.categoryId || '',
      sizes: product.sizes || '',
    });
    setImageFiles([]);
    setImagePreviews([]);
    setModal({ mode: 'edit', product });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);
    setImagePreviews(files.map(f => URL.createObjectURL(f)));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        sellingPrice: parseFloat(form.sellingPrice),
        comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : undefined,
        stockQty: parseInt(form.stockQty) || 0,
        sku: form.sku || undefined,
        sizes: form.sizes ? form.sizes.split(',').map(s => s.trim()).filter(Boolean).join(',') : undefined,
        categoryId: form.categoryId ? parseInt(form.categoryId) : null,
        isActive: true,
      };
      if (modal.mode === 'create') {
        await adminAPI.createProduct(payload, imageFiles);
        toast.success('Product created');
      } else {
        await adminAPI.updateProduct(modal.product.id, payload);
        if (imageFiles.length > 0) {
          const fd = new FormData();
          imageFiles.forEach(f => fd.append('files', f));
          await adminAPI.uploadProductImages(modal.product.id, fd);
        }
        toast.success('Product updated');
      }
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      setModal(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not save product');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      await adminAPI.toggleProduct(id);
      qc.invalidateQueries({ queryKey: ['admin-products'] });
    } catch {}
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await adminAPI.deleteProduct(id);
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product deleted');
    } catch {
      toast.error('Could not delete');
    }
  };

  const products = data?.content || [];

  const inputStyle = { width: '100%', boxSizing: 'border-box', background: 'none', border: '1px solid var(--border)', padding: '8px 12px', color: 'var(--text)', fontFamily: 'Inter', fontSize: '13px', outline: 'none' };
  const labelStyle = { fontFamily: 'Inter', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' };

  return (
    <AdminLayout title="Products">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', gap: '12px', flexWrap: 'wrap' }}>
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0); }}
          placeholder="Search products…"
          style={{ ...inputStyle, width: '300px' }}
        />
        <button onClick={openCreate} style={{ padding: '10px 24px', background: 'var(--red)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          + Add Product
        </button>
      </div>

      {isLoading ? <div style={{ color: 'var(--text-muted)', fontFamily: 'Inter', fontSize: '13px' }}>Loading…</div> : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Product', 'SKU', 'Price', 'Stock', 'Active', 'Actions'].map(h => (
                <th key={h} style={{ fontFamily: 'Inter', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px', fontFamily: 'Inter', fontSize: '13px', color: 'var(--text)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {p.images?.[0]?.imageUrl && <img src={p.images[0].imageUrl} alt={p.name} style={{ width: '36px', height: '48px', objectFit: 'cover', flexShrink: 0 }} />}
                    <span>{p.name}</span>
                  </div>
                </td>
                <td style={{ padding: '12px', fontFamily: 'Inter', fontSize: '12px', color: 'var(--text-muted)' }}>{p.sku}</td>
                <td style={{ padding: '12px', fontFamily: "'Barlow Condensed'", fontSize: '18px', fontWeight: 700, color: 'var(--red)' }}>₹{p.sellingPrice?.toLocaleString()}</td>
                <td style={{ padding: '12px', fontFamily: 'Inter', fontSize: '13px', color: p.stockQty <= 5 ? '#E8242A' : 'var(--text)' }}>{p.stockQty}</td>
                <td style={{ padding: '12px' }}>
                  <button onClick={() => handleToggle(p.id)} title="Click to toggle" style={{ background: p.active ? '#10B98120' : '#EF444420', color: p.active ? '#10B981' : '#EF4444', border: 'none', padding: '4px 10px', cursor: 'pointer', fontFamily: 'Inter', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    {p.active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => openEdit(p)} style={{ padding: '6px 12px', background: 'none', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text)', fontFamily: 'Inter', fontSize: '11px' }}>Edit</button>
                    <button onClick={() => handleDelete(p.id)} style={{ padding: '6px 12px', background: 'none', border: '1px solid var(--red)', cursor: 'pointer', color: 'var(--red)', fontFamily: 'Inter', fontSize: '11px' }}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {data?.totalPages > 1 && (
        <div style={{ display: 'flex', gap: '8px', marginTop: '24px' }}>
          {Array.from({ length: data.totalPages }, (_, i) => (
            <button key={i} onClick={() => setPage(i)} style={{ width: '36px', height: '36px', background: page === i ? 'var(--red)' : 'none', border: `1px solid ${page === i ? 'var(--red)' : 'var(--border)'}`, color: page === i ? '#fff' : 'var(--text)', cursor: 'pointer', fontFamily: 'Inter', fontSize: '13px' }}>{i + 1}</button>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }} onClick={() => setModal(null)}>
          <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '32px', width: '100%', maxWidth: '560px', maxHeight: '80vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontFamily: "'Barlow Condensed'", fontSize: '28px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text)', marginBottom: '24px' }}>
              {modal.mode === 'create' ? 'New Product' : 'Edit Product'}
            </h2>
            <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={labelStyle}>Name</label>
                <input style={inputStyle} value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={labelStyle}>Description</label>
                <textarea style={{ ...inputStyle, height: '80px', resize: 'vertical' }} value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>Selling Price (₹)</label>
                <input type="number" style={inputStyle} value={form.sellingPrice || ''} onChange={e => setForm(f => ({ ...f, sellingPrice: e.target.value }))} required />
              </div>
              <div>
                <label style={labelStyle}>Compare Price (₹)</label>
                <input type="number" style={inputStyle} value={form.comparePrice || ''} onChange={e => setForm(f => ({ ...f, comparePrice: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>Stock Quantity</label>
                <input type="number" style={inputStyle} value={form.stockQty || ''} onChange={e => setForm(f => ({ ...f, stockQty: e.target.value }))} required />
              </div>
              <div>
                <label style={labelStyle}>SKU</label>
                <input style={inputStyle} value={form.sku || ''} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>Category</label>
                <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.categoryId || ''} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}>
                  <option value="">None</option>
                  {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={labelStyle}>Sizes (comma separated)</label>
                <input style={inputStyle} value={form.sizes || ''} placeholder="e.g. 1-2 yrs, 2-3 yrs, 3-4 yrs, 4-5 yrs"
                  onChange={e => setForm(f => ({ ...f, sizes: e.target.value }))} />
                <p style={{ fontFamily: 'Inter', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  For kids, use age ranges like <strong>4-5 yrs, 5-6 yrs</strong>. For footwear use UK sizes (5, 6, 7).
                  Leave blank if this product has no sizes. Customers pick from these on the product page.
                </p>
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={labelStyle}>Product Images</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ ...inputStyle, padding: '6px 12px', cursor: 'pointer' }}
                />
                {imagePreviews.length > 0 && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                    {imagePreviews.map((src, i) => (
                      <img key={i} src={src} alt="" style={{ width: '60px', height: '80px', objectFit: 'cover', border: '1px solid var(--border)' }} />
                    ))}
                  </div>
                )}
              </div>
              <div style={{ gridColumn: '1/-1', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setModal(null)} style={{ padding: '10px 24px', background: 'none', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-muted)', fontFamily: 'Inter', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ padding: '10px 24px', background: 'var(--red)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{saving ? 'Saving…' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
