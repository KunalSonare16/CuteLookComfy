import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { adminAPI } from '../../services/api';
import AdminLayout from './AdminLayout';

function StatCard({ label, value, sub, color = 'var(--red)', i = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.06 }}
      style={{ padding: '24px', border: '1px solid var(--border)' }}
    >
      <div style={{ fontFamily: 'Inter', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '10px' }}>{label}</div>
      <div style={{ fontFamily: "'Barlow Condensed'", fontSize: '40px', fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontFamily: 'Inter', fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>{sub}</div>}
    </motion.div>
  );
}

export default function Dashboard() {
  const fresh = { staleTime: 0, refetchOnMount: 'always' };
  const { data: stats } = useQuery({ queryKey: ['admin-stats'], queryFn: () => adminAPI.getStats(), select: d => d.data.data, ...fresh });
  const { data: revenue } = useQuery({ queryKey: ['admin-revenue', 30], queryFn: () => adminAPI.getRevenue(30), select: d => d.data.data, ...fresh });
  const { data: byStatus } = useQuery({ queryKey: ['admin-orders-status'], queryFn: () => adminAPI.getOrdersByStatus(), select: d => d.data.data, ...fresh });
  const { data: topProducts } = useQuery({ queryKey: ['admin-top-products'], queryFn: () => adminAPI.getTopProducts(5), select: d => d.data.data, ...fresh });

  const fmtCurrency = v => v !== undefined ? `₹${Number(v).toLocaleString()}` : '—';
  const fmtNum = v => v !== undefined ? Number(v).toLocaleString() : '—';

  return (
    <AdminLayout title="Dashboard">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <StatCard label="Total Revenue" value={fmtCurrency(stats?.totalRevenue)} sub="All time" i={0} />
        <StatCard label="Total Orders" value={fmtNum(stats?.totalOrders)} sub="All time" color="var(--text)" i={1} />
        <StatCard label="Total Customers" value={fmtNum(stats?.totalCustomers)} sub="Registered" color="var(--text)" i={2} />
        <StatCard label="Total Products" value={fmtNum(stats?.totalProducts)} sub="Active" color="var(--text)" i={3} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Revenue last 30 days */}
        <div style={{ border: '1px solid var(--border)', padding: '24px' }}>
          <h3 style={{ fontFamily: "'Barlow Condensed'", fontSize: '20px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text)', marginBottom: '20px' }}>Revenue (30 Days)</h3>
          {revenue?.length ? (
            <div>
              <div style={{ fontFamily: "'Barlow Condensed'", fontSize: '36px', fontWeight: 900, color: 'var(--red)', marginBottom: '12px' }}>
                {fmtCurrency(revenue.reduce((s, r) => s + (r.revenue || 0), 0))}
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '80px' }}>
                {revenue.slice(-14).map((r, i) => {
                  const max = Math.max(...revenue.map(x => x.revenue || 0), 1);
                  const h = Math.max(4, ((r.revenue || 0) / max) * 80);
                  return <div key={i} style={{ flex: 1, height: `${h}px`, background: 'var(--red)', opacity: 0.6 + (i / revenue.length) * 0.4, transition: 'height 0.3s' }} title={`₹${r.revenue}`} />;
                })}
              </div>
            </div>
          ) : <div style={{ color: 'var(--text-muted)', fontFamily: 'Inter', fontSize: '13px' }}>No data</div>}
        </div>

        {/* Orders by status */}
        <div style={{ border: '1px solid var(--border)', padding: '24px' }}>
          <h3 style={{ fontFamily: "'Barlow Condensed'", fontSize: '20px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text)', marginBottom: '20px' }}>Orders by Status</h3>
          {byStatus ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {Object.entries(byStatus).map(([status, count]) => (
                <div key={status} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'Inter', fontSize: '12px', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{status}</span>
                  <span style={{ fontFamily: "'Barlow Condensed'", fontSize: '20px', fontWeight: 700, color: 'var(--text)' }}>{count}</span>
                </div>
              ))}
            </div>
          ) : <div style={{ color: 'var(--text-muted)', fontFamily: 'Inter', fontSize: '13px' }}>No data</div>}
        </div>

        {/* Top products */}
        <div style={{ border: '1px solid var(--border)', padding: '24px', gridColumn: '1/-1' }}>
          <h3 style={{ fontFamily: "'Barlow Condensed'", fontSize: '20px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text)', marginBottom: '20px' }}>Top Products</h3>
          {topProducts?.length ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Product', 'Sales', 'Revenue'].map(h => (
                    <th key={h} style={{ fontFamily: 'Inter', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', textAlign: 'left', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p, i) => (
                  <tr key={i}>
                    <td style={{ padding: '12px 0', borderBottom: '1px solid var(--border)', fontFamily: 'Inter', fontSize: '13px', color: 'var(--text)' }}>{p.productName}</td>
                    <td style={{ padding: '12px 0', borderBottom: '1px solid var(--border)', fontFamily: 'Inter', fontSize: '13px', color: 'var(--text)' }}>{p.totalSold}</td>
                    <td style={{ padding: '12px 0', borderBottom: '1px solid var(--border)', fontFamily: "'Barlow Condensed'", fontSize: '18px', fontWeight: 700, color: 'var(--red)' }}>₹{Number(p.totalRevenue).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <div style={{ color: 'var(--text-muted)', fontFamily: 'Inter', fontSize: '13px' }}>No data</div>}
        </div>
      </div>
    </AdminLayout>
  );
}
