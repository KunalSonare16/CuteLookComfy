import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Section = ({ title, children }) => (
  <div style={{ marginBottom: '40px' }}>
    <h2 style={{ fontFamily: "'Barlow Condensed'", fontSize: '28px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text)', marginBottom: '16px', borderBottom: '2px solid var(--red)', paddingBottom: '8px', display: 'inline-block' }}>{title}</h2>
    <div style={{ fontFamily: 'Inter', fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.9 }}>{children}</div>
  </div>
);

export default function Returns() {
  return (
    <div style={{ paddingTop: '64px', minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 32px 80px' }}>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(48px, 7vw, 80px)', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text)', marginBottom: '8px' }}>
          Returns Policy
        </motion.h1>
        <p style={{ fontFamily: 'Inter', fontSize: '14px', color: 'var(--text-muted)', marginBottom: '48px' }}>Last updated: January 2026</p>

        <Section title="7-Day Returns">
          <p>We offer hassle-free returns within <strong>7 days</strong> of delivery. If you're not completely satisfied with your purchase, we'll make it right.</p>
        </Section>

        <Section title="Eligibility">
          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>Items must be unworn, unwashed, and in original condition with all tags attached.</li>
            <li>Items must be returned in their original packaging.</li>
            <li>Sale items are eligible for exchange or store credit only.</li>
            <li>Intimate wear, swimwear, and accessories are non-returnable for hygiene reasons.</li>
          </ul>
        </Section>

        <Section title="How to Return">
          <ol style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <li>Log in to your account and go to <strong>Your Orders</strong>.</li>
            <li>Select the item(s) you want to return and click "Request Return".</li>
            <li>Choose your reason and preferred resolution (refund/exchange/store credit).</li>
            <li>Pack the item securely and drop it at the nearest courier partner.</li>
            <li>Your refund or exchange will be processed within 5–7 business days of receiving the return.</li>
          </ol>
        </Section>

        <Section title="Refunds">
          <p>Refunds are processed to the original payment method within <strong>5–7 business days</strong> after we receive and inspect the return. You will receive an email confirmation once your refund is processed.</p>
          <p style={{ marginTop: '12px' }}>For COD orders, refunds are issued as store credit or via bank transfer.</p>
        </Section>

        <Section title="Exchanges">
          <p>Want a different size or color? We offer free exchanges on all eligible items. Simply select "Exchange" when initiating your return and choose the replacement item.</p>
        </Section>

        <Section title="Damaged or Wrong Item">
          <p>If you received a damaged or incorrect item, please contact us within <strong>48 hours</strong> of delivery with photos. We'll arrange a free pickup and send a replacement or issue a full refund.</p>
        </Section>

        <div style={{ background: 'var(--surface)', padding: '24px', borderLeft: '3px solid var(--red)' }}>
          <p style={{ fontFamily: 'Inter', fontSize: '13px', color: 'var(--text)', fontWeight: 500, marginBottom: '8px' }}>Need help with a return?</p>
          <p style={{ fontFamily: 'Inter', fontSize: '13px', color: 'var(--text-muted)' }}>
            Reach out to our support team via the <Link to="/contact" style={{ color: 'var(--red)' }}>Contact page</Link> or WhatsApp. We typically respond within 4 hours.
          </p>
        </div>
      </div>
    </div>
  );
}
