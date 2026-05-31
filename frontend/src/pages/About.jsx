import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div style={{ paddingTop: '64px', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Hero */}
      <div style={{ background: '#111111', color: '#EDE8E3', padding: '80px 32px', textAlign: 'center' }}>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(56px, 10vw, 120px)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.03em', lineHeight: 0.9, margin: 0 }}>
          About Us
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          style={{ fontFamily: 'Inter', fontSize: '16px', color: 'rgba(237,232,227,0.6)', marginTop: '24px', maxWidth: '500px', margin: '24px auto 0', lineHeight: 1.8 }}>
          Premium fashion for the bold. Designed for those who wear their confidence.
        </motion.p>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '80px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', marginBottom: '80px' }}>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <h2 style={{ fontFamily: "'Barlow Condensed'", fontSize: '40px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text)', marginBottom: '16px' }}>Our Story</h2>
            <p style={{ fontFamily: 'Inter', fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.8 }}>
              CuteLookComfy was born from a simple belief: you shouldn't have to choose between looking great and feeling comfortable. We design fashion that moves with you — bold enough to turn heads, comfortable enough for everyday wear.
            </p>
            <p style={{ fontFamily: 'Inter', fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.8, marginTop: '16px' }}>
              Founded in India, we blend contemporary global trends with the vibrancy of Indian fashion culture. Every piece is thoughtfully crafted to celebrate individuality.
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <h2 style={{ fontFamily: "'Barlow Condensed'", fontSize: '40px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text)', marginBottom: '16px' }}>Our Mission</h2>
            <p style={{ fontFamily: 'Inter', fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.8 }}>
              To make premium fashion accessible to everyone who dares to express themselves. We believe confidence is the best outfit you can wear — we just help you accessorize it.
            </p>
            <p style={{ fontFamily: 'Inter', fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.8, marginTop: '16px' }}>
              New collections drop weekly, keeping you at the forefront of style without the premium price tag.
            </p>
          </motion.div>
        </div>

        {/* Values */}
        <h2 style={{ fontFamily: "'Barlow Condensed'", fontSize: '48px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text)', marginBottom: '40px', textAlign: 'center' }}>What We Stand For</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px', marginBottom: '80px' }}>
          {[
            { icon: '✦', title: 'Quality First', desc: 'Every fabric, every stitch is chosen with care. We never compromise on quality.' },
            { icon: '♻', title: 'Conscious Fashion', desc: 'We are committed to responsible sourcing and reducing our environmental footprint.' },
            { icon: '❤', title: 'Community', desc: 'You are not just a customer — you are part of the CuteLookComfy family.' },
          ].map(v => (
            <div key={v.title} style={{ textAlign: 'center', padding: '32px 24px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '32px', marginBottom: '16px', color: 'var(--red)' }}>{v.icon}</div>
              <h3 style={{ fontFamily: "'Barlow Condensed'", fontSize: '22px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text)', marginBottom: '10px' }}>{v.title}</h3>
              <p style={{ fontFamily: 'Inter', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7 }}>{v.desc}</p>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center' }}>
          <Link to="/shop" style={{ display: 'inline-block', padding: '16px 48px', background: 'var(--red)', color: '#fff', fontFamily: 'Inter', fontSize: '12px', letterSpacing: '0.2em', textTransform: 'uppercase', textDecoration: 'none' }}>
            Shop the Collection
          </Link>
        </div>
      </div>
    </div>
  );
}
