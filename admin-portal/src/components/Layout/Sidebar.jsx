import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { ROLES } from '../../auth/roleConfig';

const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: 'Brivent Admin',
  [ROLES.RESTAURANT_ADMIN]: 'Restaurant Admin',
  [ROLES.RESTAURANT_STAFF]: 'Restaurant Staff',
};

const NAV_ITEMS = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    roles: [ROLES.SUPER_ADMIN, ROLES.RESTAURANT_ADMIN, ROLES.RESTAURANT_STAFF],
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    path: '/restaurants',
    label: 'Restaurants',
    roles: [ROLES.SUPER_ADMIN],
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    path: '/sessions',
    label: 'WA Sessions',
    roles: [ROLES.SUPER_ADMIN],
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
  {
    path: '/outbox',
    label: 'Outbox',
    roles: [ROLES.SUPER_ADMIN],
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
        <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
      </svg>
    ),
  },
  {
    path: '/health-monitor',
    label: 'Health',
    roles: [ROLES.SUPER_ADMIN],
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
      </svg>
    ),
  },
  {
    path: '/overview',
    label: 'Overview',
    roles: [ROLES.RESTAURANT_ADMIN, ROLES.RESTAURANT_STAFF],
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  },
  {
    path: '/onboarding',
    label: 'Onboarding',
    roles: [ROLES.RESTAURANT_ADMIN],
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    ),
  },
  {
    path: '/orders',
    label: 'Orders',
    roles: [ROLES.RESTAURANT_ADMIN, ROLES.RESTAURANT_STAFF],
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 0 1-8 0"/>
      </svg>
    ),
  },
  {
    path: '/payments',
    label: 'Payments',
    roles: [ROLES.RESTAURANT_ADMIN, ROLES.RESTAURANT_STAFF],
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
  },
  {
    path: '/whatsapp',
    label: 'WhatsApp',
    roles: [ROLES.RESTAURANT_ADMIN, ROLES.RESTAURANT_STAFF],
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 0 2 2z"/>
      </svg>
    ),
  },
  {
    path: '/menu',
    label: 'Menu',
    roles: [ROLES.RESTAURANT_ADMIN],
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
        <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
      </svg>
    ),
  },
  {
    path: '/delivery',
    label: 'Delivery Zones',
    roles: [ROLES.RESTAURANT_ADMIN],
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
        <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
  },
  {
    path: '/subscription',
    label: 'Subscription',
    roles: [ROLES.RESTAURANT_ADMIN],
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      </svg>
    ),
  },
  {
    path: '/earnings',
    label: 'Earnings',
    roles: [ROLES.RESTAURANT_ADMIN],
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
  },
];

const BOTTOM_ITEMS = [
  {
    path: '/profile',
    label: 'Profile',
    roles: [ROLES.RESTAURANT_ADMIN, ROLES.RESTAURANT_STAFF],
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
  {
    path: '/settings',
    label: 'Settings',
    roles: [ROLES.RESTAURANT_ADMIN],
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    ),
  },
];

const Sidebar = ({ isMobile, isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const userRole = user?.role;

  const navItems = NAV_ITEMS.filter(
    (item) => userRole && item.roles.includes(userRole)
  );
  const bottomItems = BOTTOM_ITEMS.filter(
    (item) => userRole && item.roles.includes(userRole)
  );

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const initials = user?.name ? user.name.charAt(0).toUpperCase() : 
                   user?.email ? user.email.charAt(0).toUpperCase() : 'U';
  const displayName = user?.name || (user?.email ? user.email.split('@')[0] : 'User');

  const navLinkStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '9px 14px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '13.5px',
    fontWeight: isActive ? 500 : 400,
    color: isActive ? '#ffffff' : '#6b6b6b',
    backgroundColor: isActive ? '#1c1c1c' : 'transparent',
    transition: 'all 0.15s',
    cursor: 'pointer',
  });

  return (
    <>
      {isMobile && isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            zIndex: 149,
          }}
        />
      )}

      <aside style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '232px',
        height: '100vh',
        backgroundColor: '#0b0b0b',
        borderRight: '1px solid #1c1c1c',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 150,
        transform: isMobile && !isOpen ? 'translateX(-100%)' : 'translateX(0)',
        transition: 'transform 0.25s ease',
        overflowY: 'auto',
        overflowX: 'hidden',
      }}>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '18px 20px 14px',
          borderBottom: '1px solid #1c1c1c',
        }}>
          <div style={{
            width: '32px', height: '32px',
            borderRadius: '8px',
            backgroundColor: '#1c1c1c',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
          </div>
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.2px' }}>
            Brivent
          </span>
        </div>

        <nav style={{ flex: 1, padding: '12px 12px 0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                style={navLinkStyle}
                onClick={isMobile ? onClose : undefined}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.classList.contains('active')) {
                    e.currentTarget.style.color = '#cccccc';
                    e.currentTarget.style.backgroundColor = '#141414';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.classList.contains('active')) {
                    e.currentTarget.style.color = '#6b6b6b';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        <div style={{ padding: '8px 12px', borderTop: '1px solid #1c1c1c', marginTop: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {bottomItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                style={navLinkStyle}
                onClick={isMobile ? onClose : undefined}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.classList.contains('active')) {
                    e.currentTarget.style.color = '#cccccc';
                    e.currentTarget.style.backgroundColor = '#141414';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.classList.contains('active')) {
                    e.currentTarget.style.color = '#6b6b6b';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>

        <div style={{
          padding: '12px 14px',
          borderTop: '1px solid #1c1c1c',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <div style={{
            width: '34px', height: '34px',
            borderRadius: '50%',
            backgroundColor: '#2a2a2a',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: '13px',
            flexShrink: 0,
          }}>
            {initials}
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 500, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {displayName}
            </p>
            <p style={{ margin: 0, fontSize: '11px', color: '#555' }}>
              {ROLE_LABELS[userRole] || 'User'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            style={{
              background: 'none', border: 'none',
              color: '#444', cursor: 'pointer', padding: '4px',
              display: 'flex', alignItems: 'center',
              borderRadius: '4px', transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#444'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
