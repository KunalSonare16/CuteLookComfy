import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../../services/api';
import AdminLayout from './AdminLayout';
import toast from 'react-hot-toast';

export default function AdminInventory() {
  const [page, setPage] = useState(0);
  const [updating, setUpdating] = useState(null);
  const [editQty, setEditQty] = useState({});
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-inventory', page],
    queryFn: () => adminAPI.getInventory({ page, size: 30 }),
    select: d => d.data.data,
    placeholderData: (prev) => prev,
  });

  const handleUpdate = async (productId) => {
    const qty = parseInt(editQty[productId]);
    if (isNaN(qty) || qty < 0) { toast.error('Invalid quantity'); return; }
    setUpdating(productId);
    try {
      await adminAPI.updateStock(productId, qty);
      qc.invalidateQueries({ queryKey: ['admin-inventory'] });
      setEditQty(e => { const n = { ...e }; delete n[productId]; return n; });
      toast.success('Stock updated');
    } catch { toast.error('Could not update stock'); }
    finally { setUpdating(null); }
  };

  const products = data?.content || [];

  return (
    <AdminLayout title="Inventory">
      {isLoading ? <div style={{ color: 'var(--text-muted)', fontFamily: 'Inter', fontSize: '13px' }}>Loading…</div> : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Product', 'SKU', 'Current Stock', 'Update Stock'].map(h => (
                <th key={h} style={{ fontFamily: 'Inter', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px', fontFamily: 'Inter', fontSize: '13px', color: 'var(--text)' }}>{p.name}</td>
                <td style={{ padding: '12px', fontFamily: 'Inter', fontSize: '12px', color: 'var(--text-muted)' }}>{p.sku}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{ fontFamily: "'Barlow Condensed'", fontSize: '22px', fontWeight: 700, color: p.stockQty <= 5 ? '#EF4444' : p.stockQty <= 20 ? '#F59E0B' : 'var(--text)' }}>
                    {p.stockQty}
                  </span>
                  {p.stockQty === 0 && <span style={{ marginLeft: '8px', fontFamily: 'Inter', fontSize: '10px', color: '#EF4444', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Out of Stock</span>}
                </td>
                <td style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="number"
                      min="0"
                      value={editQty[p.id] ?? ''}
                      onChange={e => setEditQty(q => ({ ...q, [p.id]: e.target.value }))}
                      placeholder={p.stockQty}
                      style={{ width: '80px', background: 'none', border: '1px solid var(--border)', padding: '6px 10px', color: 'var(--text)', fontFamily: 'Inter', fontSize: '13px', outline: 'none' }}
                    />
                    <button
                      onClick={() => handleUpdate(p.id)}
                      disabled={updating === p.id || editQty[p.id] === undefined}
                      style={{ padding: '6px 14px', background: editQty[p.id] !== undefined ? 'var(--red)' : 'var(--surface)', color: editQty[p.id] !== undefined ? '#fff' : 'var(--text-muted)', border: 'none', cursor: 'pointer', fontFamily: 'Inter', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                    >
                      {updating === p.id ? '…' : 'Set'}
                    </button>
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
    </AdminLayout>
  );
}
