import { motion } from 'framer-motion';

const Section = ({ title, children }) => (
  <div style={{ marginBottom: '40px' }}>
    <h2 style={{ fontFamily: "'Barlow Condensed'", fontSize: '26px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text)', marginBottom: '14px' }}>{title}</h2>
    <div style={{ fontFamily: 'Inter', fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.9 }}>{children}</div>
  </div>
);

export default function Privacy() {
  return (
    <div style={{ paddingTop: '64px', minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 32px 80px' }}>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(48px, 7vw, 80px)', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text)', marginBottom: '8px' }}>
          Privacy Policy
        </motion.h1>
        <p style={{ fontFamily: 'Inter', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '48px' }}>Last updated: January 2026</p>

        <Section title="Information We Collect">
          <p>We collect information you provide directly to us, including your name, email address, phone number, shipping address, and payment details when you make a purchase or create an account.</p>
          <p style={{ marginTop: '12px' }}>We also automatically collect certain information when you visit our site, including your IP address, browser type, and browsing behavior via cookies.</p>
        </Section>

        <Section title="How We Use Your Information">
          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>To process and fulfill your orders</li>
            <li>To send order confirmations and shipping updates</li>
            <li>To respond to your customer service requests</li>
            <li>To send marketing communications (with your consent)</li>
            <li>To improve our website and services</li>
            <li>To detect and prevent fraud</li>
          </ul>
        </Section>

        <Section title="Information Sharing">
          <p>We do not sell or rent your personal information to third parties. We may share your information with:</p>
          <ul style={{ paddingLeft: '20px', marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>Shipping partners to deliver your orders</li>
            <li>Payment processors to handle transactions securely</li>
            <li>Analytics providers to improve our services (anonymized)</li>
          </ul>
        </Section>

        <Section title="Cookies">
          <p>We use cookies to remember your preferences, keep you signed in, and analyze site traffic. You can control cookies through your browser settings. Disabling cookies may affect the functionality of our site.</p>
        </Section>

        <Section title="Data Security">
          <p>We implement industry-standard security measures including SSL encryption, secure payment processing, and regular security audits to protect your personal information.</p>
        </Section>

        <Section title="Your Rights">
          <p>You have the right to access, correct, or delete your personal information. You may also opt out of marketing emails at any time by clicking "Unsubscribe" in any email or contacting us directly.</p>
        </Section>

        <Section title="Contact">
          <p>If you have questions about this Privacy Policy, please contact us at <strong>privacy@cutelookcomfy.com</strong>.</p>
        </Section>
      </div>
    </div>
  );
}
