import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { orderAPI } from '../services/api';

const STATUS_COLOR = {
  PENDING: '#F59E0B',
  CONFIRMED: '#3B82F6',
  PROCESSING: '#8B5CF6',
  SHIPPED: '#06B6D4',
  DELIVERED: '#10B981',
  CANCELLED: '#EF4444',
  REFUNDED: '#6B7280',
};

export default function Orders() {
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ['orders', page],
    queryFn: () => orderAPI.getAll({ page, size: 10 }),
    select: d => d.data.data,
    placeholderData: (prev) => prev,
  });

  const orders = data?.content || [];

  return (
    <div style={{ paddingTop: '64px', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 32px 80px' }}>
        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 'clamp(40px, 6vw, 64px)', fontWeight: 900,
            textTransform: 'uppercase', color: 'var(--text)',
            letterSpacing: '-0.02em', marginBottom: '40px',
          }}
        >
          Your Orders
        </motion.h1>

        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[1,2,3].map(i => <div key={i} style={{ height: '100px', background: 'var(--surface)', animation: 'pulse 1.5s ease-in-out infinite' }} />)}
          </div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ fontFamily: "'Barlow Condensed'", fontSize: '32px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text)' }}>No orders yet</p>
            <Link to="/shop" style={{ display: 'inline-block', marginTop: '20px', padding: '12px 32px', background: 'var(--red)', color: '#fff', textDecoration: 'none', fontFamily: 'Inter', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Start Shopping</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {orders.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Link
                  to={`/orders/${order.id}`}
                  style={{
                    display: 'grid', gridTemplateColumns: '1fr auto',
                    gap: '16px', padding: '24px',
                    border: '1px solid var(--border)', textDecoration: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--text)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <span style={{ fontFamily: "'Barlow Condensed'", fontSize: '18px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text)' }}>
                        #{order.id?.slice(0, 8).toUpperCase()}
                      </span>
                      <span style={{
                        padding: '3px 10px',
                        background: STATUS_COLOR[order.status] + '20',
                        color: STATUS_COLOR[order.status],
                        fontFamily: 'Inter', fontSize: '10px',
                        letterSpacing: '0.1em', textTransform: 'uppercase',
                      }}>
                        {order.status}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '24px' }}>
                      <span style={{ fontFamily: 'Inter', fontSize: '13px', color: 'var(--text-muted)' }}>
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span style={{ fontFamily: 'Inter', fontSize: '13px', color: 'var(--text-muted)' }}>
                        {order.itemCount} item{order.itemCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px', alignItems: 'center' }}>
                      {order.firstItemImage && (
                        <img src={order.firstItemImage} alt={order.firstItemName}
                          style={{ width: '40px', height: '52px', objectFit: 'cover' }} />
                      )}
                      <span style={{ fontFamily: 'Inter', fontSize: '13px', color: 'var(--text-muted)' }}>
                        {order.firstItemName}{order.itemCount > 1 ? ` +${order.itemCount - 1} more` : ''}
                      </span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: "'Barlow Condensed'", fontSize: '24px', fontWeight: 700, color: 'var(--text)' }}>
                      ₹{order.totalAmount?.toLocaleString()}
                    </span>
                    <span style={{ fontFamily: 'Inter', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>View →</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {data?.totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '40px' }}>
            {Array.from({ length: data.totalPages }, (_, i) => (
              <button key={i} onClick={() => setPage(i)} style={{
                width: '36px', height: '36px',
                background: page === i ? 'var(--red)' : 'none',
                border: `1px solid ${page === i ? 'var(--red)' : 'var(--border)'}`,
                color: page === i ? '#fff' : 'var(--text)',
                cursor: 'pointer', fontFamily: 'Inter', fontSize: '13px',
              }}>{i + 1}</button>
            ))}
          </div>
        )}
      </div>

      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
    </div>
  );
}
