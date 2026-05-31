import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../../services/api';
import AdminLayout from './AdminLayout';
import toast from 'react-hot-toast';

const RETURN_STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'];

export default function AdminReturns() {
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState('');
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-returns', page, status],
    queryFn: () => adminAPI.getReturns({ page, size: 20, status: status || undefined }),
    select: d => d.data.data,
    placeholderData: (prev) => prev,
  });

  const handleStatus = async (id, newStatus) => {
    try {
      await adminAPI.updateReturnStatus(id, newStatus);
      qc.invalidateQueries({ queryKey: ['admin-returns'] });
      toast.success('Return status updated');
    } catch { toast.error('Could not update'); }
  };

  const returns = data?.content || [];
  const STATUS_COLOR = { PENDING: '#F59E0B', APPROVED: '#3B82F6', REJECTED: '#EF4444', COMPLETED: '#10B981' };

  return (
    <AdminLayout title="Returns">
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button onClick={() => setStatus('')} style={{ padding: '8px 16px', background: !status ? 'var(--black)' : 'none', color: !status ? 'var(--bg)' : 'var(--text)', border: '1px solid var(--border)', cursor: 'pointer', fontFamily: 'Inter', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>All</button>
        {RETURN_STATUSES.map(s => (
          <button key={s} onClick={() => { setStatus(s); setPage(0); }} style={{ padding: '8px 16px', background: status === s ? 'var(--black)' : 'none', color: status === s ? 'var(--bg)' : 'var(--text)', border: '1px solid var(--border)', cursor: 'pointer', fontFamily: 'Inter', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s}</button>
        ))}
      </div>

      {isLoading ? <div style={{ color: 'var(--text-muted)', fontFamily: 'Inter', fontSize: '13px' }}>Loading…</div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {returns.map(r => (
            <div key={r.id} style={{ border: '1px solid var(--border)', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontFamily: "'Barlow Condensed'", fontSize: '18px', fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase' }}>Return #{r.id?.slice(0, 8)}</span>
                    <span style={{ padding: '3px 10px', background: `${STATUS_COLOR[r.status]}20`, color: STATUS_COLOR[r.status], fontFamily: 'Inter', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{r.status}</span>
                  </div>
                  <div style={{ fontFamily: 'Inter', fontSize: '12px', color: 'var(--text-muted)' }}>Order #{r.orderNumber} — {r.userEmail}</div>
                  <div style={{ fontFamily: 'Inter', fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Requested: {new Date(r.createdAt).toLocaleDateString()}</div>
                  <p style={{ fontFamily: 'Inter', fontSize: '13px', color: 'var(--text)', marginTop: '8px', lineHeight: 1.5 }}><strong>Reason:</strong> {r.reason}</p>
                </div>
                {r.status === 'PENDING' && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleStatus(r.id, 'APPROVED')} style={{ padding: '8px 16px', background: '#3B82F6', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Approve</button>
                    <button onClick={() => handleStatus(r.id, 'REJECTED')} style={{ padding: '8px 16px', background: 'var(--red)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Reject</button>
                  </div>
                )}
                {r.status === 'APPROVED' && (
                  <button onClick={() => handleStatus(r.id, 'COMPLETED')} style={{ padding: '8px 16px', background: '#10B981', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Mark Complete</button>
                )}
              </div>
            </div>
          ))}
          {returns.length === 0 && <div style={{ color: 'var(--text-muted)', fontFamily: 'Inter', fontSize: '13px', padding: '40px 0', textAlign: 'center' }}>No return requests.</div>}
        </div>
      )}
    </AdminLayout>
  );
}
