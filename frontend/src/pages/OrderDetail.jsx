import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { orderAPI, productAPI } from '../services/api';
import toast from 'react-hot-toast';

function ItemReview({ productId }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  if (done) return <span style={{ fontFamily: 'Inter', fontSize: '11px', color: '#10B981', letterSpacing: '0.05em', textTransform: 'uppercase' }}>✓ Review submitted</span>;

  const submit = async () => {
    if (!rating) { toast.error('Select a rating'); return; }
    setBusy(true);
    try {
      await productAPI.createReview(productId, { rating, comment });
      setDone(true);
      toast.success('Review submitted! It will appear after approval.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit review');
    } finally { setBusy(false); }
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} style={{ marginTop: '8px', background: 'none', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text)', fontFamily: 'Inter', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '6px 12px' }}>
        ✎ Write a Review
      </button>
    );
  }
  return (
    <div style={{ marginTop: '10px', padding: '12px', border: '1px solid var(--border)', background: 'var(--surface)' }}>
      <div style={{ display: 'flex', gap: '3px', marginBottom: '8px' }}>
        {[1,2,3,4,5].map(s => (
          <button key={s} type="button" onClick={() => setRating(s)} onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: s <= (hover || rating) ? '#E8242A' : 'var(--border)', padding: 0, lineHeight: 1 }}>★</button>
        ))}
      </div>
      <textarea value={comment} onChange={e => setComment(e.target.value)} rows={2} placeholder="Share your experience…"
        style={{ width: '100%', boxSizing: 'border-box', background: 'var(--bg)', border: '1px solid var(--border)', padding: '8px 10px', color: 'var(--text)', fontFamily: 'Inter', fontSize: '13px', outline: 'none', resize: 'vertical' }} />
      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
        <button onClick={submit} disabled={busy} style={{ padding: '7px 16px', background: 'var(--red)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{busy ? '…' : 'Submit'}</button>
        <button onClick={() => setOpen(false)} style={{ padding: '7px 16px', background: 'none', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-muted)', fontFamily: 'Inter', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Cancel</button>
      </div>
    </div>
  );
}

const STATUS_COLOR = {
  PENDING: '#F59E0B', CONFIRMED: '#3B82F6', PROCESSING: '#8B5CF6',
  SHIPPED: '#06B6D4', DELIVERED: '#10B981', CANCELLED: '#EF4444', REFUNDED: '#6B7280',
};

export default function OrderDetail() {
  const { id } = useParams();
  const [cancelling, setCancelling] = useState(false);
  const [returnForm, setReturnForm] = useState({ open: false, reason: '', items: [] });

  const { data: order, refetch, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderAPI.getById(id),
    select: d => d.data.data,
  });

  const { data: ret } = useQuery({
    queryKey: ['order-return', id],
    queryFn: () => orderAPI.getReturn(id),
    select: d => d.data.data,
    enabled: order?.status === 'DELIVERED',
    retry: false,
  });

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      await orderAPI.cancel(id);
      toast.success('Order cancelled');
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const handleDownloadInvoice = async () => {
    try {
      const res = await orderAPI.getInvoice(id);
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${order.id?.slice(0, 8)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Could not download invoice');
    }
  };

  const handleReturn = async (e) => {
    e.preventDefault();
    try {
      await orderAPI.createReturn(id, { reason: returnForm.reason, items: returnForm.items });
      toast.success('Return request submitted');
      setReturnForm({ open: false, reason: '', items: [] });
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit return');
    }
  };

  if (isLoading) return <div style={{ paddingTop: '64px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontFamily: "'Barlow Condensed'", fontSize: '24px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Loading…</span></div>;
  if (!order) return null;

  const addr = order.shippingAddress || {};
  const canCancel = ['PENDING', 'CONFIRMED'].includes(order.status);
  const canReturn = order.status === 'DELIVERED' && !ret;

  return (
    <div style={{ paddingTop: '64px', minHeight: '100vh' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 32px 80px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ fontFamily: "'Barlow Condensed'", fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text)', margin: 0 }}>
            Order #{order.id?.slice(0, 8).toUpperCase()}
          </motion.h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            {order.status === 'DELIVERED' && (
              <button onClick={handleDownloadInvoice} style={{ padding: '10px 20px', background: 'none', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text)', fontFamily: 'Inter', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Invoice PDF
              </button>
            )}
            {canCancel && (
              <button onClick={handleCancel} disabled={cancelling} style={{ padding: '10px 20px', background: 'none', border: '1px solid var(--red)', cursor: 'pointer', color: 'var(--red)', fontFamily: 'Inter', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {cancelling ? '…' : 'Cancel Order'}
              </button>
            )}
          </div>
        </div>

        {/* Status */}
        <div style={{ padding: '20px 24px', border: `1px solid ${STATUS_COLOR[order.status]}40`, background: `${STATUS_COLOR[order.status]}10`, marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: 'Inter', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>Status</div>
            <div style={{ fontFamily: "'Barlow Condensed'", fontSize: '22px', fontWeight: 700, textTransform: 'uppercase', color: STATUS_COLOR[order.status] }}>{order.status}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'Inter', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>Ordered</div>
            <div style={{ fontFamily: 'Inter', fontSize: '14px', color: 'var(--text)' }}>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '32px' }}>
          {/* Shipping */}
          <div style={{ border: '1px solid var(--border)', padding: '20px' }}>
            <h3 style={{ fontFamily: "'Barlow Condensed'", fontSize: '16px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text)', marginBottom: '12px' }}>Delivery Address</h3>
            <div style={{ fontFamily: 'Inter', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
              <div style={{ color: 'var(--text)', fontWeight: 500 }}>{addr.name}</div>
              <div>{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</div>
              <div>{addr.city}, {addr.state} {addr.pincode}</div>
              <div>{addr.phone}</div>
            </div>
          </div>

          {/* Payment */}
          <div style={{ border: '1px solid var(--border)', padding: '20px' }}>
            <h3 style={{ fontFamily: "'Barlow Condensed'", fontSize: '16px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text)', marginBottom: '12px' }}>Payment</h3>
            <div style={{ fontFamily: 'Inter', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Method</span><span style={{ color: 'var(--text)' }}>{order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Razorpay'}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Status</span><span style={{ color: order.payment?.status === 'CAPTURED' ? '#10B981' : 'var(--text)' }}>{order.paymentMethod === 'COD' ? 'Pay on delivery' : (order.payment?.status || 'Pending')}</span></div>
              {order.trackingNumber && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Tracking</span><span style={{ color: 'var(--text)' }}>{order.trackingNumber}</span></div>}
            </div>
          </div>
        </div>

        {/* Items */}
        <div style={{ border: '1px solid var(--border)', marginBottom: '32px' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ fontFamily: "'Barlow Condensed'", fontSize: '18px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text)', margin: 0 }}>
              Items ({order.items?.length})
            </h3>
          </div>
          {order.items?.map(item => (
            <div key={item.id} style={{ display: 'flex', gap: '16px', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
              <img src={item.productImage || '/placeholder.jpg'} alt={item.productName} style={{ width: '60px', height: '80px', objectFit: 'cover', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Barlow Condensed'", fontSize: '17px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text)' }}>{item.productName}</div>
                {item.size && <div style={{ fontFamily: 'Inter', fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Size: {item.size}</div>}
                {item.variantLabel && <div style={{ fontFamily: 'Inter', fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{item.variantLabel}</div>}
                <div style={{ fontFamily: 'Inter', fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Qty: {item.qty}</div>
                {order.status !== 'CANCELLED' && <ItemReview productId={item.productId} />}
              </div>
              <div style={{ fontFamily: "'Barlow Condensed'", fontSize: '18px', fontWeight: 700, color: 'var(--text)' }}>₹{(item.totalPrice ?? (item.unitPrice || 0) * (item.qty || 1)).toLocaleString()}</div>
            </div>
          ))}
          <div style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontFamily: 'Inter', fontSize: '13px', color: 'var(--text-muted)' }}>Subtotal</span><span style={{ fontFamily: 'Inter', fontSize: '13px', color: 'var(--text)' }}>₹{order.subtotal?.toLocaleString()}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontFamily: 'Inter', fontSize: '13px', color: 'var(--text-muted)' }}>Shipping</span><span style={{ fontFamily: 'Inter', fontSize: '13px', color: 'var(--text)' }}>{order.shippingCharge === 0 ? 'Free' : `₹${order.shippingCharge?.toLocaleString()}`}</span></div>
              {order.discountAmount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontFamily: 'Inter', fontSize: '13px', color: 'var(--text-muted)' }}>Discount</span><span style={{ fontFamily: 'Inter', fontSize: '13px', color: 'var(--red)' }}>−₹{order.discountAmount?.toLocaleString()}</span></div>}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontFamily: 'Inter', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text)' }}>Total</span>
                <span style={{ fontFamily: "'Barlow Condensed'", fontSize: '26px', fontWeight: 700, color: 'var(--text)' }}>₹{order.totalAmount?.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Return */}
        {canReturn && !returnForm.open && (
          <button onClick={() => setReturnForm(f => ({ ...f, open: true }))} style={{ padding: '12px 24px', background: 'none', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text)', fontFamily: 'Inter', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            Request Return
          </button>
        )}

        {returnForm.open && (
          <form onSubmit={handleReturn} style={{ border: '1px solid var(--border)', padding: '24px' }}>
            <h3 style={{ fontFamily: "'Barlow Condensed'", fontSize: '18px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text)', marginBottom: '16px' }}>Return Request</h3>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontFamily: 'Inter', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Reason for Return</label>
              <textarea
                required
                value={returnForm.reason}
                onChange={e => setReturnForm(f => ({ ...f, reason: e.target.value }))}
                rows={3}
                style={{ width: '100%', boxSizing: 'border-box', background: 'none', border: '1px solid var(--border)', padding: '10px 12px', color: 'var(--text)', fontFamily: 'Inter', fontSize: '14px', outline: 'none', resize: 'vertical' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" style={{ padding: '12px 24px', background: 'var(--red)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Submit Return</button>
              <button type="button" onClick={() => setReturnForm({ open: false, reason: '', items: [] })} style={{ padding: '12px 24px', background: 'none', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-muted)', fontFamily: 'Inter', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Cancel</button>
            </div>
          </form>
        )}

        {ret && (
          <div style={{ padding: '16px 20px', border: '1px solid var(--border)', background: 'var(--surface)' }}>
            <div style={{ fontFamily: "'Barlow Condensed'", fontSize: '16px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text)' }}>Return Request: <span style={{ color: STATUS_COLOR[ret.status] || 'var(--text)' }}>{ret.status}</span></div>
            <div style={{ fontFamily: 'Inter', fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>Reason: {ret.reason}</div>
          </div>
        )}
      </div>
    </div>
  );
}
