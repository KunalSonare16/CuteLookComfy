import { motion } from 'framer-motion';
import { useState } from 'react';

const tables = {
  tops: {
    headers: ['Size', 'Chest (inches)', 'Waist (inches)', 'Length (inches)'],
    rows: [
      ['XS', '32–34', '26–28', '25'],
      ['S', '34–36', '28–30', '26'],
      ['M', '36–38', '30–32', '27'],
      ['L', '38–40', '32–34', '28'],
      ['XL', '40–42', '34–36', '29'],
      ['XXL', '42–44', '36–38', '30'],
    ],
  },
  bottoms: {
    headers: ['Size', 'Waist (inches)', 'Hip (inches)', 'Inseam (inches)'],
    rows: [
      ['XS / 26', '26–27', '34–35', '29'],
      ['S / 28', '28–29', '36–37', '30'],
      ['M / 30', '30–31', '38–39', '30'],
      ['L / 32', '32–33', '40–41', '31'],
      ['XL / 34', '34–35', '42–43', '31'],
      ['XXL / 36', '36–37', '44–45', '32'],
    ],
  },
  'kids footwear': {
    headers: ['Length (cm)', 'Age (years)', 'IND/UK Size', 'Euro Size'],
    rows: [
      ['12.4', '1 to 2', '5', '23'],
      ['13.3', '2 to 3', '6', '24'],
      ['14.2', '2 to 3', '7', '25'],
      ['15.1', '2 to 3', '8', '26'],
      ['16.0', '3 to 4', '9', '27'],
      ['16.9', '3 to 4', '10', '28'],
      ['17.8', '4 to 5', '11', '29'],
      ['18.7', '4 to 5', '12', '30'],
      ['19.6', '5 to 6', '13', '31'],
      ['20.5', '7 to 8', '1', '32'],
    ],
  },
  'child footwear': {
    headers: ['Length (cm)', 'Age (years)', 'IND/UK Size', 'Euro Size'],
    rows: [
      ['21.3', '8 to 9', '2', '35'],
      ['22.1', '9 to 10', '3', '36'],
      ['22.9', '10 to 11', '4', '37'],
      ['23.8', '11 to 12', '5', '38'],
    ],
  },
};

export default function SizeGuide() {
  const [activeTab, setActiveTab] = useState('tops');

  return (
    <div style={{ paddingTop: '64px', minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 32px 80px' }}>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(48px, 7vw, 80px)', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text)', marginBottom: '12px' }}>
          Size Guide
        </motion.h1>
        <p style={{ fontFamily: 'Inter', fontSize: '14px', color: 'var(--text-muted)', marginBottom: '48px', lineHeight: 1.7 }}>
          All measurements are in inches. If you're between sizes, we recommend sizing up for a more comfortable fit. When in doubt, reach out — we're happy to help you find your perfect size.
        </p>

        {/* How to measure */}
        <div style={{ background: 'var(--surface)', padding: '24px', marginBottom: '40px', borderLeft: '3px solid var(--red)' }}>
          <h3 style={{ fontFamily: "'Barlow Condensed'", fontSize: '20px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text)', marginBottom: '12px' }}>How to Measure</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            {[
              { label: 'Chest', desc: 'Measure around the fullest part of your chest, keeping the tape horizontal.' },
              { label: 'Waist', desc: 'Measure around your natural waistline, about 1 inch above your belly button.' },
              { label: 'Hip', desc: 'Measure around the fullest part of your hips, about 8 inches below your waist.' },
              { label: 'Inseam', desc: 'Measure from your crotch to the bottom of your ankle.' },
            ].map(m => (
              <div key={m.label}>
                <div style={{ fontFamily: 'Inter', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--red)', marginBottom: '4px' }}>{m.label}</div>
                <div style={{ fontFamily: 'Inter', fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6 }}>{m.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0', marginBottom: '24px', borderBottom: '1px solid var(--border)' }}>
          {['tops', 'bottoms', 'kids footwear', 'child footwear'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: '10px 24px', background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'Inter', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase',
              color: activeTab === tab ? 'var(--text)' : 'var(--text-muted)',
              borderBottom: activeTab === tab ? '2px solid var(--red)' : '2px solid transparent',
              marginBottom: '-1px',
            }}>
              {tab}
            </button>
          ))}
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {tables[activeTab].headers.map(h => (
                  <th key={h} style={{ fontFamily: 'Inter', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tables[activeTab].rows.map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {row.map((cell, j) => (
                    <td key={j} style={{ fontFamily: 'Inter', fontSize: '13px', color: j === 0 ? 'var(--text)' : 'var(--text-muted)', padding: '14px 16px', fontWeight: j === 0 ? 600 : 400 }}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p style={{ fontFamily: 'Inter', fontSize: '12px', color: 'var(--text-muted)', marginTop: '24px', lineHeight: 1.6 }}>
          * Measurements may vary slightly by style. Each product page includes specific fit notes where applicable.
        </p>
      </div>
    </div>
  );
}
