import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { orderAPI } from '../services/api';

export default function OrderSuccess() {
  const { id } = useParams();

  const { data: order } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderAPI.getById(id),
    select: d => d.data.data,
    enabled: !!id,
  });

  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 5);
  const formattedDelivery = deliveryDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div style={{ paddingTop: '64px', minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '60px 24px 80px', textAlign: 'center' }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          style={{ width: '80px', height: '80px', background: '#22c55e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '36px' }}>
          ✓
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(36px, 6vw, 56px)', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: '12px' }}>
          Order Confirmed!
        </motion.h1>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          style={{ fontFamily: 'Inter', fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '32px' }}>
          Thank you for your purchase! Your order has been placed and will be processed shortly.
          {order?.orderNumber && <><br />Order number: <strong style={{ color: 'var(--text)' }}>#{order.orderNumber}</strong></>}
        </motion.p>

        {/* Estimated Delivery */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '20px', marginBottom: '24px' }}>
          <div style={{ fontFamily: 'Inter', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
            Estimated Delivery
          </div>
          <div style={{ fontFamily: "'Barlow Condensed'", fontSize: '24px', fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase' }}>
            {formattedDelivery}
          </div>
          <div style={{ fontFamily: 'Inter', fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>3–7 business days</div>
        </motion.div>

        {/* What's next */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          style={{ textAlign: 'left', marginBottom: '32px' }}>
          <h3 style={{ fontFamily: "'Barlow Condensed'", fontSize: '18px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text)', marginBottom: '16px' }}>What's Next</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { step: '1', text: 'You will receive an order confirmation email shortly.' },
              { step: '2', text: 'Once dispatched, you\'ll get a tracking number via email.' },
              { step: '3', text: 'Track your order anytime from Your Orders page.' },
            ].map(s => (
              <div key={s.step} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ width: '24px', height: '24px', background: 'var(--red)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: 'Inter', fontSize: '11px', fontWeight: 700, color: '#fff' }}>{s.step}</div>
                <p style={{ fontFamily: 'Inter', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>{s.text}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {id && (
            <Link to={`/orders/${id}`} style={{ padding: '14px 32px', background: 'var(--red)', color: '#fff', fontFamily: 'Inter', fontSize: '12px', letterSpacing: '0.2em', textTransform: 'uppercase', textDecoration: 'none' }}>
              View Order
            </Link>
          )}
          <Link to="/shop" style={{ padding: '14px 32px', background: 'none', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'Inter', fontSize: '12px', letterSpacing: '0.2em', textTransform: 'uppercase', textDecoration: 'none' }}>
            Continue Shopping
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
