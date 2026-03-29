import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { ROLES } from '../../auth/roleConfig';

const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: 'Super Admin',
  [ROLES.RESTAURANT_ADMIN]: 'Restaurant Admin',
  [ROLES.RESTAURANT_STAFF]: 'Staff',
};

const NAV_ITEMS = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    roles: [ROLES.SUPER_ADMIN, ROLES.RESTAURANT_ADMIN, ROLES.RESTAURANT_STAFF],
    icon: 'fas fa-tachometer-alt',
  },
  {
    path: '/restaurants',
    label: 'Restaurants',
    roles: [ROLES.SUPER_ADMIN],
    icon: 'fas fa-store',
  },
  {
    path: '/sessions',
    label: 'WA Sessions',
    roles: [ROLES.SUPER_ADMIN],
    icon: 'fab fa-whatsapp',
  },
  {
    path: '/outbox',
    label: 'Outbox Monitor',
    roles: [ROLES.SUPER_ADMIN],
    icon: 'fas fa-paper-plane',
  },
  {
    path: '/overview',
    label: 'Overview',
    roles: [ROLES.RESTAURANT_ADMIN, ROLES.RESTAURANT_STAFF],
    icon: 'fas fa-chart-line',
  },
  {
    path: '/orders',
    label: 'Orders',
    roles: [ROLES.RESTAURANT_ADMIN, ROLES.RESTAURANT_STAFF],
    icon: 'fas fa-shopping-bag',
  },
  {
    path: '/payments',
    label: 'Payments',
    roles: [ROLES.RESTAURANT_ADMIN, ROLES.RESTAURANT_STAFF],
    icon: 'fas fa-credit-card',
  },
  {
    path: '/whatsapp',
    label: 'WhatsApp',
    roles: [ROLES.RESTAURANT_ADMIN, ROLES.RESTAURANT_STAFF],
    icon: 'fab fa-whatsapp',
  },
  {
    path: '/menu',
    label: 'Menu',
    roles: [ROLES.RESTAURANT_ADMIN],
    icon: 'fas fa-utensils',
  },
  {
    path: '/delivery',
    label: 'Delivery Zones',
    roles: [ROLES.RESTAURANT_ADMIN],
    icon: 'fas fa-truck',
  },
  {
    path: '/settings',
    label: 'Settings',
    roles: [ROLES.RESTAURANT_ADMIN],
    icon: 'fas fa-cog',
  },
];

const Sidebar = ({ isCollapsed, onToggle, isMobile }) => {
  const { user } = useAuth();
  const userRole = user?.role;

  const navItems = NAV_ITEMS.filter(
    (item) => userRole && item.roles.includes(userRole)
  );

  const sidebarStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100vh',
    width: isCollapsed ? '70px' : '240px',
    backgroundColor: '#0a0a0a',
    borderRight: '1px solid #1e1e1e',
    display: 'flex',
    flexDirection: 'column',
    transition: 'width 0.3s ease',
    zIndex: 150,
    overflowX: 'hidden',
    transform: isMobile && isCollapsed ? 'translateX(-100%)' : 'translateX(0)',
  };

  return (
    <aside style={sidebarStyle}>
      {/* Brand */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '20px 16px',
        borderBottom: '1px solid #1e1e1e',
        minHeight: '64px',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 0 12px rgba(34,197,94,0.3)',
        }}>
          <i className="fas fa-bolt" style={{ color: '#fff', fontSize: '16px' }} />
        </div>
        {!isCollapsed && (
          <div>
            <p style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.3px' }}>
              Brivent
            </p>
            <p style={{ margin: 0, fontSize: '11px', color: '#555', letterSpacing: '0.3px' }}>
              {ROLE_LABELS[userRole] || 'Workspace'}
            </p>
          </div>
        )}
      </div>

      {/* Toggle button */}
      <button
        onClick={onToggle}
        style={{
          background: 'none',
          border: 'none',
          color: '#555',
          cursor: 'pointer',
          padding: '8px',
          margin: '12px auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '8px',
          transition: 'color 0.2s, background 0.2s',
          width: '36px',
          height: '36px',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = '#fff';
          e.currentTarget.style.background = '#1a1a1a';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = '#555';
          e.currentTarget.style.background = 'none';
        }}
        title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <i className={`fas ${isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`} style={{ fontSize: '12px' }} />
      </button>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: '0 10px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            title={isCollapsed ? item.label : ''}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 12px',
              borderRadius: '8px',
              textDecoration: 'none',
              color: isActive ? '#ffffff' : '#666666',
              backgroundColor: isActive ? '#1a1a1a' : 'transparent',
              fontWeight: isActive ? 600 : 400,
              fontSize: '13.5px',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              borderLeft: isActive ? '2px solid #22c55e' : '2px solid transparent',
            })}
            onMouseEnter={(e) => {
              if (!e.currentTarget.classList.contains('active')) {
                e.currentTarget.style.color = '#cccccc';
                e.currentTarget.style.backgroundColor = '#111111';
              }
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.classList.contains('active')) {
                e.currentTarget.style.color = '#666666';
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <i
              className={item.icon}
              style={{
                fontSize: '14px',
                width: '18px',
                textAlign: 'center',
                flexShrink: 0,
              }}
            />
            {!isCollapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom user block */}
      {!isCollapsed && user && (
        <div style={{
          padding: '16px',
          borderTop: '1px solid #1e1e1e',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: '#1e1e1e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 700,
            fontSize: '13px',
            flexShrink: 0,
          }}>
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.email?.split('@')[0] || user?.email}
            </p>
            <p style={{ margin: 0, fontSize: '11px', color: '#555' }}>
              {ROLE_LABELS[userRole] || 'User'}
            </p>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;