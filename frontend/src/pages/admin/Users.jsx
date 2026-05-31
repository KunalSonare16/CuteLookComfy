import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../../services/api';
import AdminLayout from './AdminLayout';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, search],
    queryFn: () => adminAPI.getUsers({ page, size: 20, search: search || undefined }),
    select: d => d.data.data,
    placeholderData: (prev) => prev,
  });

  const handleBlock = async (id) => {
    try {
      await adminAPI.blockUser(id);
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User status updated');
    } catch { toast.error('Could not update user'); }
  };

  const handleRoleChange = async (id, role) => {
    try {
      await adminAPI.changeRole(id, role);
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Role updated');
    } catch { toast.error('Could not update role'); }
  };

  const users = data?.content || [];

  return (
    <AdminLayout title="Users">
      <input
        value={search}
        onChange={e => { setSearch(e.target.value); setPage(0); }}
        placeholder="Search by name or email…"
        style={{ width: '300px', background: 'none', border: '1px solid var(--border)', padding: '8px 12px', color: 'var(--text)', fontFamily: 'Inter', fontSize: '13px', outline: 'none', marginBottom: '24px' }}
      />

      {isLoading ? <div style={{ color: 'var(--text-muted)', fontFamily: 'Inter', fontSize: '13px' }}>Loading…</div> : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Name', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                <th key={h} style={{ fontFamily: 'Inter', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px', fontFamily: 'Inter', fontSize: '13px', color: 'var(--text)' }}>{u.name}</td>
                <td style={{ padding: '12px', fontFamily: 'Inter', fontSize: '12px', color: 'var(--text-muted)' }}>{u.email}</td>
                <td style={{ padding: '12px' }}>
                  <select
                    value={u.role}
                    onChange={e => handleRoleChange(u.id, e.target.value)}
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '4px 8px', color: 'var(--text)', fontFamily: 'Inter', fontSize: '11px', cursor: 'pointer', outline: 'none' }}
                  >
                    <option value="CUSTOMER">CUSTOMER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </td>
                <td style={{ padding: '12px' }}>
                  <span style={{ padding: '3px 10px', background: u.isBlocked ? '#EF444420' : '#10B98120', color: u.isBlocked ? '#EF4444' : '#10B981', fontFamily: 'Inter', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    {u.isBlocked ? 'Blocked' : 'Active'}
                  </span>
                </td>
                <td style={{ padding: '12px', fontFamily: 'Inter', fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td style={{ padding: '12px' }}>
                  <button onClick={() => handleBlock(u.id)} style={{ padding: '6px 12px', background: 'none', border: `1px solid ${u.isBlocked ? '#10B981' : 'var(--red)'}`, cursor: 'pointer', color: u.isBlocked ? '#10B981' : 'var(--red)', fontFamily: 'Inter', fontSize: '11px' }}>
                    {u.isBlocked ? 'Unblock' : 'Block'}
                  </button>
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
