import { Link } from 'react-router-dom';
import { useState } from 'react';
import { newsletterAPI } from '../services/api';
import toast from 'react-hot-toast';

const socialLinks = [
  { label: 'Instagram', href: 'https://instagram.com', icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' },
  { label: 'Twitter/X', href: 'https://twitter.com', icon: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.261 5.638 5.902-5.638zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
  { label: 'WhatsApp', href: 'https://wa.me/', icon: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z' },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    try {
      await newsletterAPI.subscribe(email);
      toast.success('You\'re on the list');
      setEmail('');
    } catch {
      toast.error('Could not subscribe');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer style={{
      background: '#111111',
      color: '#EDE8E3',
      marginTop: '80px',
    }}>
      {/* Top strip */}
      <div style={{
        borderBottom: '1px solid rgba(237,232,227,0.1)',
        overflow: 'hidden',
        padding: '16px 0',
      }}>
        <div style={{
          display: 'flex', gap: '48px',
          animation: 'marqueeScroll 20s linear infinite',
          whiteSpace: 'nowrap',
        }}>
          {Array(8).fill(0).map((_, i) => (
            <span key={i} style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: '13px', fontWeight: 700,
              letterSpacing: '0.3em', textTransform: 'uppercase',
              color: 'rgba(237,232,227,0.3)',
            }}>
              Flat ₹50 Shipping &nbsp;—&nbsp; New Arrivals Every Week &nbsp;—&nbsp; Premium Quality Fashion
            </span>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '64px 32px 40px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '48px',
          marginBottom: '64px',
        }}>
          {/* Brand */}
          <div>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: '36px', fontWeight: 900,
              letterSpacing: '-0.02em', textTransform: 'uppercase',
              marginBottom: '16px',
            }}>
              CuteLookComfy
            </div>
            <p style={{
              fontFamily: 'Inter', fontSize: '13px',
              lineHeight: 1.7, color: 'rgba(237,232,227,0.5)',
              maxWidth: '240px',
            }}>
              Premium fashion for the bold. Designed for those who wear their confidence.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 style={{
              fontFamily: 'Inter', fontSize: '10px',
              letterSpacing: '0.25em', textTransform: 'uppercase',
              marginBottom: '20px', color: 'rgba(237,232,227,0.4)',
            }}>
              Shop
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: 'Shop All', to: '/shop' },
                { label: 'New Arrivals', to: '/shop?sort=newest' },
                { label: 'Kids', to: '/shop/kids' },
                { label: 'Sale', to: '/shop?sale=true' },
              ].map(item => (
                <Link
                  key={item.label}
                  to={item.to}
                  style={{
                    color: 'rgba(237,232,227,0.6)', textDecoration: 'none',
                    fontFamily: 'Inter', fontSize: '13px',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => e.target.style.color = '#EDE8E3'}
                  onMouseLeave={e => e.target.style.color = 'rgba(237,232,227,0.6)'}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Help */}
          <div>
            <h4 style={{
              fontFamily: 'Inter', fontSize: '10px',
              letterSpacing: '0.25em', textTransform: 'uppercase',
              marginBottom: '20px', color: 'rgba(237,232,227,0.4)',
            }}>
              Help
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: 'Track Order', to: '/track' },
                { label: 'Returns Policy', to: '/returns' },
                { label: 'Size Guide', to: '/size-guide' },
                { label: 'Contact Us', to: '/contact' },
                { label: 'About Us', to: '/about' },
              ].map(item => (
                <Link
                  key={item.label}
                  to={item.to}
                  style={{
                    color: 'rgba(237,232,227,0.6)', textDecoration: 'none',
                    fontFamily: 'Inter', fontSize: '13px',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => e.target.style.color = '#EDE8E3'}
                  onMouseLeave={e => e.target.style.color = 'rgba(237,232,227,0.6)'}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4 style={{
              fontFamily: 'Inter', fontSize: '10px',
              letterSpacing: '0.25em', textTransform: 'uppercase',
              marginBottom: '20px', color: 'rgba(237,232,227,0.4)',
            }}>
              Stay Updated
            </h4>
            <p style={{
              fontFamily: 'Inter', fontSize: '12px',
              color: 'rgba(237,232,227,0.5)', marginBottom: '16px',
              lineHeight: 1.6,
            }}>
              New drops, exclusive offers and style inspiration.
            </p>
            <form onSubmit={handleSubscribe}>
              <div style={{ display: 'flex', borderBottom: '1px solid rgba(237,232,227,0.3)' }}>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  style={{
                    flex: 1, background: 'none', border: 'none', outline: 'none',
                    padding: '10px 0', color: '#EDE8E3',
                    fontFamily: 'Inter', fontSize: '13px',
                    '::placeholder': { color: 'rgba(237,232,227,0.3)' },
                  }}
                />
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#E8242A', fontFamily: 'Inter', fontSize: '11px',
                    letterSpacing: '0.15em', textTransform: 'uppercase', padding: '10px 0 10px 12px',
                  }}
                >
                  {submitting ? '…' : '→'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Social */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
          {socialLinks.map(s => (
            <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
              aria-label={s.label}
              style={{ color: 'rgba(237,232,227,0.5)', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#EDE8E3'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(237,232,227,0.5)'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d={s.icon} />
              </svg>
            </a>
          ))}
        </div>

        {/* Bottom */}
        <div style={{
          borderTop: '1px solid rgba(237,232,227,0.1)',
          paddingTop: '24px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: '12px',
        }}>
          <span style={{
            fontFamily: 'Inter', fontSize: '11px',
            color: 'rgba(237,232,227,0.3)', letterSpacing: '0.05em',
          }}>
            © {new Date().getFullYear()} CuteLookComfy. All rights reserved.
          </span>
          <div style={{ display: 'flex', gap: '24px' }}>
            {[
              { label: 'Privacy', to: '/privacy' },
              { label: 'Terms', to: '/terms' },
              { label: 'Cookies', to: '/privacy' },
            ].map(item => (
              <Link
                key={item.label}
                to={item.to}
                style={{
                  color: 'rgba(237,232,227,0.3)', textDecoration: 'none',
                  fontFamily: 'Inter', fontSize: '11px', letterSpacing: '0.05em',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => e.target.style.color = 'rgba(237,232,227,0.7)'}
                onMouseLeave={e => e.target.style.color = 'rgba(237,232,227,0.3)'}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes marqueeScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </footer>
  );
}
