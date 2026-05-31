import { motion } from 'framer-motion';

const Section = ({ title, children }) => (
  <div style={{ marginBottom: '40px' }}>
    <h2 style={{ fontFamily: "'Barlow Condensed'", fontSize: '26px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text)', marginBottom: '14px' }}>{title}</h2>
    <div style={{ fontFamily: 'Inter', fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.9 }}>{children}</div>
  </div>
);

export default function Terms() {
  return (
    <div style={{ paddingTop: '64px', minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 32px 80px' }}>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(48px, 7vw, 80px)', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text)', marginBottom: '8px' }}>
          Terms of Service
        </motion.h1>
        <p style={{ fontFamily: 'Inter', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '48px' }}>Last updated: January 2026</p>

        <Section title="Acceptance of Terms">
          <p>By accessing and using CuteLookComfy, you accept and agree to be bound by these Terms of Service. If you do not agree, please do not use our services.</p>
        </Section>

        <Section title="Use of the Website">
          <p>You may use our website for lawful purposes only. You agree not to:</p>
          <ul style={{ paddingLeft: '20px', marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>Use the site for any fraudulent or unlawful purpose</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Reproduce, duplicate, or resell any part of our service without permission</li>
            <li>Transmit harmful, offensive, or disruptive content</li>
          </ul>
        </Section>

        <Section title="Orders and Payment">
          <p>All orders are subject to availability and confirmation. Prices are listed in Indian Rupees (₹) and include applicable taxes. We reserve the right to refuse or cancel orders in case of pricing errors or suspected fraud.</p>
          <p style={{ marginTop: '12px' }}>Payment is required at the time of order. We accept major credit/debit cards, UPI, net banking, and select wallets via our payment gateway.</p>
        </Section>

        <Section title="Shipping and Delivery">
          <p>We aim to dispatch orders within 1–2 business days. Estimated delivery is 3–7 business days depending on your location. A flat ₹50 shipping charge applies to all orders. We are not responsible for delays caused by courier partners or customs.</p>
        </Section>

        <Section title="Intellectual Property">
          <p>All content on this website, including text, images, logos, and designs, is the property of CuteLookComfy and is protected by copyright law. You may not reproduce or distribute any content without our prior written consent.</p>
        </Section>

        <Section title="Limitation of Liability">
          <p>CuteLookComfy shall not be liable for any indirect, incidental, or consequential damages arising from your use of our website or products. Our total liability shall not exceed the amount paid for the specific product in question.</p>
        </Section>

        <Section title="Governing Law">
          <p>These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Mumbai, Maharashtra.</p>
        </Section>

        <Section title="Contact">
          <p>For questions about these Terms, please contact us at <strong>legal@cutelookcomfy.com</strong>.</p>
        </Section>
      </div>
    </div>
  );
}
