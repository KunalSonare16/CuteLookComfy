import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useWindowSize from '../hooks/useWindowSize';
import { STATES, STATES_CITIES } from '../data/indiaStatesCities';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderAPI, paymentAPI, userAPI } from '../services/api';
import toast from 'react-hot-toast';

const RAZORPAY_KEY = process.env.REACT_APP_RAZORPAY_KEY_ID;

const inputStyle = {
  width: '100%', boxSizing: 'border-box',
  background: 'none', border: '1px solid var(--border)',
  padding: '10px 12px', color: 'var(--text)',
  fontFamily: 'Inter', fontSize: '14px', outline: 'none',
  transition: 'border-color 0.2s',
};

const labelStyle = { fontFamily: 'Inter', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' };

const PAYMENT_METHODS = [
  { id: 'razorpay', label: 'Pay Online', desc: 'UPI, Cards, Net Banking, Wallets', icon: '💳' },
  { id: 'cod', label: 'Cash on Delivery', desc: 'Pay when your order arrives', icon: '💵' },
];

export default function Checkout() {
  const { cart, fetchCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isMobile } = useWindowSize();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [addingAddress, setAddingAddress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [placing, setPlacing] = useState(false);
  const [guestEmail, setGuestEmail] = useState('');
  const [citySelect, setCitySelect] = useState('');
  const [newAddr, setNewAddr] = useState({
    name: user?.name || '', phone: '', line1: '', line2: '',
    city: '', state: '', pincode: '', country: 'India',
  });

  // Must be signed in to place an order. Guests can build a cart but not checkout.
  useEffect(() => {
    if (!user) navigate('/login', { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    if (!user) { setAddingAddress(true); return; }
    userAPI.getAddresses().then(r => {
      const addrs = r.data.data;
      setAddresses(addrs);
      const def = addrs.find(a => a.isDefault);
      if (def) setSelectedAddress(def.id);
      else if (addrs.length === 0) setAddingAddress(true);
    }).catch(() => {});
  }, [user]);

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!user) { setSelectedAddress('guest'); return; }
    try {
      const { data } = await userAPI.addAddress(newAddr);
      const updated = [...addresses, data.data];
      setAddresses(updated);
      setSelectedAddress(data.data.id);
      setAddingAddress(false);
      setNewAddr({ name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', country: 'India' });
    } catch {
      toast.error('Could not save address');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress && !(!user && newAddr.line1)) {
      toast.error('Please enter a delivery address');
      return;
    }
    if (!user && !guestEmail) { toast.error('Please enter your email'); return; }
    setPlacing(true);

    try {
      if (paymentMethod === 'cod') {
        const { data: codData } = await orderAPI.create({ addressId: selectedAddress, paymentMethod: 'COD', guestEmail: guestEmail || undefined, guestAddress: !user ? newAddr : undefined });
        await fetchCart();
        toast.success('Order placed! Pay on delivery.');
        navigate(`/order-success/${codData.data?.id || ''}`);
        return;
      }

      const { data } = await orderAPI.create({ addressId: selectedAddress, guestEmail: guestEmail || undefined, guestAddress: !user ? newAddr : undefined });
      const order = data.data;
      const { data: payData } = await paymentAPI.initiate(order.id);
      const { razorpayOrderId, amount, currency } = payData.data;

      const options = {
        key: RAZORPAY_KEY,
        amount,
        currency,
        name: 'CuteLookComfy',
        description: `Order ${order.orderNumber}`,
        order_id: razorpayOrderId,
        handler: async (response) => {
          try {
            await paymentAPI.verify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              orderId: order.id,
            });
            await fetchCart();
            toast.success('Order placed successfully!');
            navigate(`/order-success/${order.id}`);
          } catch {
            toast.error('Payment verification failed. Contact support.');
          }
        },
        prefill: { name: user?.name || newAddr.name, email: user?.email || guestEmail },
        theme: { color: '#E8242A' },
        modal: { ondismiss: () => setPlacing(false) },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not place order');
      setPlacing(false);
    }
  };

  const canProceed = user ? !!selectedAddress : (newAddr.line1 && newAddr.city && newAddr.pincode && guestEmail);

  return (
    <div style={{ paddingTop: '64px', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 32px 80px' }}>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(40px, 6vw, 64px)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em', color: 'var(--text)', marginBottom: '24px' }}>
          Checkout
        </motion.h1>

        {/* Progress Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginBottom: '40px', overflowX: 'auto' }}>
          {(() => {
            const contactDone = !user ? !!guestEmail : true;
            const addressDone = !!selectedAddress || (!user && !!newAddr.line1);
            const paymentDone = addressDone && !!paymentMethod;
            return [
              { label: 'Contact', done: contactDone },
              { label: 'Address', done: addressDone },
              { label: 'Payment', done: paymentDone },
              { label: 'Confirm', done: placing },
            ];
          })().map((step, i, arr) => (
            <div key={step.label} style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flex: 1 }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: step.done ? 'var(--red)' : 'var(--surface)', border: `2px solid ${step.done ? 'var(--red)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.3s' }}>
                  {step.done ? <span style={{ color: '#fff', fontSize: '12px', fontWeight: 700 }}>✓</span> : <span style={{ fontFamily: 'Inter', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>{i + 1}</span>}
                </div>
                <span style={{ fontFamily: 'Inter', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: step.done ? 'var(--red)' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>{step.label}</span>
              </div>
              {i < arr.length - 1 && <div style={{ height: '2px', flex: 1, background: step.done ? 'var(--red)' : 'var(--border)', transition: 'background 0.3s', marginBottom: '20px' }} />}
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 340px', gap: isMobile ? '24px' : '48px' }}>
          <div>
            {/* Guest notice */}
            {!user && (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ fontFamily: 'Inter', fontSize: '13px', color: 'var(--text)', fontWeight: 500 }}>Checking out as guest</div>
                  <div style={{ fontFamily: 'Inter', fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Create an account to track orders and save addresses</div>
                </div>
                <Link to="/login" style={{ fontFamily: 'Inter', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--red)', textDecoration: 'none' }}>Sign In →</Link>
              </div>
            )}

            {/* Guest email */}
            {!user && (
              <section style={{ marginBottom: '32px' }}>
                <h2 style={{ fontFamily: "'Barlow Condensed'", fontSize: '22px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text)', marginBottom: '16px' }}>Contact</h2>
                <div>
                  <label style={{ fontFamily: 'Inter', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Email Address</label>
                  <input type="email" value={guestEmail} onChange={e => setGuestEmail(e.target.value)} placeholder="your@email.com" required
                    style={inputStyle} onFocus={e => e.target.style.borderColor = 'var(--text)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                </div>
              </section>
            )}

            {/* Delivery */}
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{ fontFamily: "'Barlow Condensed'", fontSize: '22px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text)', marginBottom: '20px' }}>
                Delivery Address
              </h2>

              {user && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                  {addresses.map(addr => (
                    <label key={addr.id} style={{ display: 'flex', gap: '12px', padding: '16px', border: `1px solid ${selectedAddress === addr.id ? 'var(--red)' : 'var(--border)'}`, cursor: 'pointer' }}>
                      <input type="radio" name="address" checked={selectedAddress === addr.id} onChange={() => { setSelectedAddress(addr.id); setAddingAddress(false); }} style={{ accentColor: '#E8242A', marginTop: '2px' }} />
                      <div>
                        <div style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 500, color: 'var(--text)' }}>
                          {addr.name} — {addr.phone}
                          {addr.isDefault && <span style={{ marginLeft: '8px', fontSize: '10px', color: 'var(--red)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Default</span>}
                        </div>
                        <div style={{ fontFamily: 'Inter', fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                          {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}, {addr.city}, {addr.state} {addr.pincode}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {!addingAddress && user ? (
                <button onClick={() => setAddingAddress(true)} style={{ background: 'none', border: '1px dashed var(--border)', padding: '12px 20px', cursor: 'pointer', color: 'var(--text-muted)', fontFamily: 'Inter', fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', width: '100%' }}>
                  + Add New Address
                </button>
              ) : (
                <form onSubmit={handleSaveAddress} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {/* Full Name */}
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={labelStyle}>Full Name</label>
                    <input style={inputStyle} value={newAddr.name} required
                      onChange={e => setNewAddr(a => ({ ...a, name: e.target.value }))}
                      onFocus={e => e.target.style.borderColor = 'var(--text)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                  </div>
                  {/* Phone */}
                  <div>
                    <label style={labelStyle}>Phone</label>
                    <input style={inputStyle} type="tel" value={newAddr.phone} required
                      pattern="[6-9][0-9]{9}" title="Enter a valid 10-digit Indian mobile number" maxLength={10}
                      placeholder="10-digit mobile"
                      onChange={e => setNewAddr(a => ({ ...a, phone: e.target.value.replace(/[^0-9]/g, '') }))}
                      onFocus={e => e.target.style.borderColor = 'var(--text)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                  </div>
                  {/* Pincode */}
                  <div>
                    <label style={labelStyle}>Pincode</label>
                    <input style={inputStyle} value={newAddr.pincode} required
                      pattern="[1-9][0-9]{5}" title="Enter a valid 6-digit pincode" maxLength={6}
                      placeholder="6-digit"
                      onChange={e => setNewAddr(a => ({ ...a, pincode: e.target.value.replace(/[^0-9]/g, '') }))}
                      onFocus={e => e.target.style.borderColor = 'var(--text)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                  </div>
                  {/* Line 1 */}
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={labelStyle}>Address Line 1</label>
                    <input style={inputStyle} value={newAddr.line1} required
                      onChange={e => setNewAddr(a => ({ ...a, line1: e.target.value }))}
                      onFocus={e => e.target.style.borderColor = 'var(--text)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                  </div>
                  {/* Line 2 */}
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={labelStyle}>Address Line 2 (Optional)</label>
                    <input style={inputStyle} value={newAddr.line2}
                      onChange={e => setNewAddr(a => ({ ...a, line2: e.target.value }))}
                      onFocus={e => e.target.style.borderColor = 'var(--text)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                  </div>
                  {/* State (dropdown) */}
                  <div>
                    <label style={labelStyle}>State</label>
                    <select style={{ ...inputStyle, cursor: 'pointer' }} value={newAddr.state} required
                      onChange={e => { setNewAddr(a => ({ ...a, state: e.target.value, city: '' })); setCitySelect(''); }}>
                      <option value="">Select state</option>
                      {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  {/* City (dependent dropdown) */}
                  <div>
                    <label style={labelStyle}>City</label>
                    <select style={{ ...inputStyle, cursor: newAddr.state ? 'pointer' : 'not-allowed' }} value={citySelect} required
                      disabled={!newAddr.state}
                      onChange={e => { const v = e.target.value; setCitySelect(v); setNewAddr(a => ({ ...a, city: v === 'Other' ? '' : v })); }}>
                      <option value="">{newAddr.state ? 'Select city' : 'Select state first'}</option>
                      {(STATES_CITIES[newAddr.state] || []).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {citySelect === 'Other' && (
                      <input style={{ ...inputStyle, marginTop: '8px' }} value={newAddr.city} required placeholder="Enter your city"
                        onChange={e => setNewAddr(a => ({ ...a, city: e.target.value }))}
                        onFocus={e => e.target.style.borderColor = 'var(--text)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                    )}
                  </div>
                  <div style={{ gridColumn: '1/-1', display: 'flex', gap: '12px' }}>
                    <button type="submit" style={{ padding: '12px 24px', background: 'var(--black)', color: 'var(--bg)', border: 'none', cursor: 'pointer', fontFamily: 'Inter', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                      {user ? 'Save Address' : 'Use This Address'}
                    </button>
                    {user && addresses.length > 0 && (
                      <button type="button" onClick={() => setAddingAddress(false)} style={{ padding: '12px 24px', background: 'none', color: 'var(--text-muted)', border: '1px solid var(--border)', cursor: 'pointer', fontFamily: 'Inter', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Cancel</button>
                    )}
                  </div>
                </form>
              )}
            </section>

            {/* Payment Method */}
            <section>
              <h2 style={{ fontFamily: "'Barlow Condensed'", fontSize: '22px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text)', marginBottom: '16px' }}>
                Payment Method
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {PAYMENT_METHODS.map(m => (
                  <label key={m.id} style={{ display: 'flex', gap: '14px', padding: '16px', border: `1px solid ${paymentMethod === m.id ? 'var(--red)' : 'var(--border)'}`, cursor: 'pointer', transition: 'border-color 0.2s' }}>
                    <input type="radio" name="payment" value={m.id} checked={paymentMethod === m.id} onChange={() => setPaymentMethod(m.id)} style={{ accentColor: '#E8242A', marginTop: '2px' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '20px' }}>{m.icon}</span>
                      <div>
                        <div style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 500, color: 'var(--text)' }}>{m.label}</div>
                        <div style={{ fontFamily: 'Inter', fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{m.desc}</div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </section>
          </div>

          {/* Order Summary */}
          <div style={{ position: 'sticky', top: '80px', alignSelf: 'start' }}>
            <div style={{ border: '1px solid var(--border)', padding: '24px' }}>
              <h2 style={{ fontFamily: "'Barlow Condensed'", fontSize: '20px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text)', marginBottom: '20px' }}>
                Order ({cart?.items?.length || 0} items)
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                {cart?.items?.map(item => (
                  <div key={item.productId} style={{ display: 'flex', gap: '12px' }}>
                    <img src={item.productImage || '/placeholder.jpg'} alt={item.productName} style={{ width: '52px', height: '68px', objectFit: 'cover', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Barlow Condensed'", fontSize: '15px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text)' }}>{item.productName}</div>
                      {item.variantLabel && <div style={{ fontFamily: 'Inter', fontSize: '11px', color: 'var(--text-muted)' }}>{item.variantLabel}</div>}
                      <div style={{ fontFamily: 'Inter', fontSize: '12px', color: 'var(--text-muted)' }}>Qty: {item.qty}</div>
                    </div>
                    <div style={{ fontFamily: "'Barlow Condensed'", fontSize: '16px', fontWeight: 600, color: 'var(--text)' }}>
                      ₹{((item.unitPrice || 0) * (item.qty || 1)).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'Inter', fontSize: '13px', color: 'var(--text-muted)' }}>Subtotal</span>
                  <span style={{ fontFamily: 'Inter', fontSize: '13px', color: 'var(--text)' }}>₹{cart?.subtotal?.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'Inter', fontSize: '13px', color: 'var(--text-muted)' }}>Shipping</span>
                  <span style={{ fontFamily: 'Inter', fontSize: '13px', color: cart?.shippingCharge === 0 ? 'var(--red)' : 'var(--text)' }}>
                    {cart?.shippingCharge == null ? 'Calculated at checkout' : cart.shippingCharge === 0 ? 'Free' : `₹${cart.shippingCharge.toLocaleString()}`}
                  </span>
                </div>
                {cart?.discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: 'Inter', fontSize: '13px', color: 'var(--text-muted)' }}>Discount</span>
                    <span style={{ fontFamily: 'Inter', fontSize: '13px', color: 'var(--red)' }}>−₹{cart?.discountAmount?.toLocaleString()}</span>
                  </div>
                )}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontFamily: 'Inter', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text)' }}>Total</span>
                  <span style={{ fontFamily: "'Barlow Condensed'", fontSize: '28px', fontWeight: 700, color: 'var(--text)' }}>
                    ₹{(cart?.total || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={placing || !canProceed}
                style={{ width: '100%', marginTop: '20px', padding: '16px', background: placing || !canProceed ? 'var(--text-muted)' : 'var(--red)', color: '#fff', border: 'none', cursor: placing || !canProceed ? 'not-allowed' : 'pointer', fontFamily: 'Inter', fontSize: '12px', letterSpacing: '0.2em', textTransform: 'uppercase', transition: 'background 0.2s' }}
              >
                {placing ? 'Processing…' : paymentMethod === 'cod' ? 'Place Order (COD)' : 'Pay with Razorpay'}
              </button>

              <p style={{ textAlign: 'center', marginTop: '12px', fontFamily: 'Inter', fontSize: '11px', color: 'var(--text-muted)' }}>
                {paymentMethod === 'cod' ? '🔒 Order confirmed on placement' : '🔒 Secured by Razorpay'}
              </p>

              {/* Estimated Delivery */}
              <div style={{ marginTop: '16px', padding: '12px', background: 'var(--surface)', borderLeft: '2px solid var(--red)' }}>
                <div style={{ fontFamily: 'Inter', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>Estimated Delivery</div>
                <div style={{ fontFamily: 'Inter', fontSize: '13px', color: 'var(--text)', fontWeight: 500 }}>
                  {(() => {
                    const d = new Date();
                    d.setDate(d.getDate() + (paymentMethod === 'cod' ? 7 : 5));
                    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                  })()}
                </div>
                <div style={{ fontFamily: 'Inter', fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>3–7 business days</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
