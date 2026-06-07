import { NavLink } from 'react-router-dom';
import useWindowSize from '../../hooks/useWindowSize';

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', exact: true },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/categories', label: 'Categories' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/coupons', label: 'Coupons' },
  { to: '/admin/reviews', label: 'Reviews' },
  { to: '/admin/inventory', label: 'Inventory' },
  { to: '/admin/returns', label: 'Returns' },
  { to: '/admin/settings', label: 'Settings' },
];

export default function AdminLayout({ children, title }) {
  const { isMobile } = useWindowSize();

  return (
    <div style={{ paddingTop: '64px', minHeight: '100vh', display: 'flex', flexDirection: isMobile ? 'column' : 'row' }}>
      {/* Sidebar — vertical on desktop, horizontal scrolling bar on mobile */}
      <aside style={isMobile ? {
        display: 'flex', gap: '4px', overflowX: 'auto', WebkitOverflowScrolling: 'touch',
        borderBottom: '1px solid var(--border)', padding: '10px 12px',
        position: 'sticky', top: '64px', background: 'var(--bg)', zIndex: 5,
      } : {
        width: '220px', flexShrink: 0,
        borderRight: '1px solid var(--border)',
        padding: '24px 0',
        position: 'sticky', top: '64px',
        height: 'calc(100vh - 64px)', overflowY: 'auto',
      }}>
        {!isMobile && (
          <div style={{ padding: '0 20px 16px', fontFamily: 'Inter', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Admin</div>
        )}
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            style={({ isActive }) => (isMobile ? {
              flexShrink: 0, whiteSpace: 'nowrap',
              padding: '8px 14px',
              fontFamily: 'Inter', fontSize: '12px', letterSpacing: '0.05em',
              textDecoration: 'none', borderRadius: '4px',
              background: isActive ? 'var(--red)' : 'var(--surface)',
              color: isActive ? '#fff' : 'var(--text-muted)',
            } : {
              display: 'block', padding: '10px 20px',
              fontFamily: 'Inter', fontSize: '13px', letterSpacing: '0.05em',
              textDecoration: 'none',
              background: isActive ? 'var(--surface)' : 'none',
              color: isActive ? 'var(--red)' : 'var(--text-muted)',
              borderLeft: isActive ? '2px solid var(--red)' : '2px solid transparent',
              transition: 'all 0.15s',
            })}
          >
            {item.label}
          </NavLink>
        ))}
      </aside>

      {/* Main */}
      <main style={{ flex: 1, minWidth: 0, padding: isMobile ? '20px 16px' : '32px', overflowX: 'auto' }}>
        {title && (
          <h1 style={{ fontFamily: "'Barlow Condensed'", fontSize: isMobile ? '32px' : '40px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text)', letterSpacing: '-0.01em', marginBottom: isMobile ? '20px' : '32px' }}>
            {title}
          </h1>
        )}
        {children}
      </main>
    </div>
  );
}
