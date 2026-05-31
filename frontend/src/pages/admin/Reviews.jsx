import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../../services/api';
import AdminLayout from './AdminLayout';
import toast from 'react-hot-toast';

export default function AdminReviews() {
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState('PENDING');
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-reviews', page, status],
    queryFn: () => adminAPI.getReviews({ page, size: 20, status }),
    select: d => d.data.data,
    placeholderData: (prev) => prev,
  });

  const handleApprove = async (id) => {
    try { await adminAPI.approveReview(id); qc.invalidateQueries({ queryKey: ['admin-reviews'] }); toast.success('Approved'); }
    catch { toast.error('Failed'); }
  };

  const handleReject = async (id) => {
    try { await adminAPI.rejectReview(id); qc.invalidateQueries({ queryKey: ['admin-reviews'] }); toast.success('Rejected'); }
    catch { toast.error('Failed'); }
  };

  const reviews = data?.content || [];

  return (
    <AdminLayout title="Reviews">
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {['PENDING', 'APPROVED', 'REJECTED'].map(s => (
          <button key={s} onClick={() => { setStatus(s); setPage(0); }} style={{ padding: '8px 16px', background: status === s ? 'var(--black)' : 'none', color: status === s ? 'var(--bg)' : 'var(--text)', border: '1px solid var(--border)', cursor: 'pointer', fontFamily: 'Inter', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{s}</button>
        ))}
      </div>

      {isLoading ? <div style={{ color: 'var(--text-muted)', fontFamily: 'Inter', fontSize: '13px' }}>Loading…</div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {reviews.map(r => (
            <div key={r.id} style={{ border: '1px solid var(--border)', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div>
                  <div style={{ fontFamily: "'Barlow Condensed'", fontSize: '18px', fontWeight: 600, color: 'var(--text)', textTransform: 'uppercase' }}>{r.productName}</div>
                  <div style={{ fontFamily: 'Inter', fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>by {r.userName} — {new Date(r.createdAt).toLocaleDateString()}</div>
                  <div style={{ display: 'flex', gap: '2px', marginTop: '6px' }}>
                    {[1,2,3,4,5].map(s => <span key={s} style={{ color: s <= r.rating ? '#E8242A' : 'var(--border)', fontSize: '14px' }}>★</span>)}
                  </div>
                </div>
                {status === 'PENDING' && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleApprove(r.id)} style={{ padding: '8px 16px', background: '#10B981', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Approve</button>
                    <button onClick={() => handleReject(r.id)} style={{ padding: '8px 16px', background: 'var(--red)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Reject</button>
                  </div>
                )}
              </div>
              <p style={{ fontFamily: 'Inter', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>{r.comment}</p>
            </div>
          ))}
          {reviews.length === 0 && <div style={{ color: 'var(--text-muted)', fontFamily: 'Inter', fontSize: '13px', padding: '40px 0', textAlign: 'center' }}>No reviews in this status.</div>}
        </div>
      )}
    </AdminLayout>
  );
}
