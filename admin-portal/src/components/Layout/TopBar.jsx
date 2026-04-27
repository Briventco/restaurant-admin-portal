import React, { useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes, faSearch, faUser, faSignOutAlt, faBars,
} from '@fortawesome/free-solid-svg-icons';

const TITLE_MAP = {
  '/dashboard': 'Dashboard',
  '/restaurants': 'Restaurants',
  '/sessions': 'WhatsApp Sessions',
  '/outbox': 'Outbox Monitor',
  '/overview': 'Restaurant Overview',
  '/orders': 'Orders',
  '/menu': 'Menu Management',
  '/delivery': 'Delivery Zones',
  '/payments': 'Payments',
  '/whatsapp': 'WhatsApp Status',
  '/settings': 'Settings',
  '/forbidden': 'Access Denied',
};

const SUBTITLE_MAP = {
  '/dashboard': 'Your workspace at a glance',
  '/restaurants': 'Manage all registered restaurants',
  '/sessions': 'Active WhatsApp session connections',
  '/outbox': 'Monitor outgoing message queue',
  '/overview': 'Daily operational pulse',
  '/orders': 'Track and manage incoming orders',
  '/menu': 'Edit menu items and categories',
  '/delivery': 'Configure delivery coverage areas',
  '/payments': 'Payment records and collections',
  '/whatsapp': 'WhatsApp connection health',
  '/settings': 'Restaurant configuration',
};

const getRoleLabel = (role) => {
  switch (role) {
    case 'super_admin':
      return 'Brivent Admin';
    case 'restaurant_admin':
      return 'Restaurant Admin';
    case 'restaurant_staff':
      return 'Restaurant Staff';
    default:
      return 'User';
  }
};

const resolveTitle = (pathname) => {
  if (pathname.startsWith('/restaurants/')) return 'Restaurant Detail';
  if (pathname.startsWith('/orders/')) return 'Order Detail';
  return TITLE_MAP[pathname] || 'Admin Portal';
};

const resolveSubtitle = (pathname) => {
  if (pathname.startsWith('/restaurants/')) return 'Detailed restaurant profile';
  if (pathname.startsWith('/orders/')) return 'Full order breakdown';
  return SUBTITLE_MAP[pathname] || '';
};

const TopBar = ({ onMenuClick, sidebarCollapsed, isMobile }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [search, setSearch] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const initials = user?.name ? user.name.charAt(0).toUpperCase() : 
                   user?.email ? user.email.charAt(0).toUpperCase() : 'U';
  const userRole = user?.role || 'restaurant_staff';
  const roleLabel = getRoleLabel(userRole);
  const displayName = user?.name || (user?.email ? user.email.split('@')[0] : 'User');

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login', { replace: true });
  }, [logout, navigate]);

  return (
    <>
      <header style={{
        backgroundColor: '#0a0a0a',
        borderBottom: '1px solid #1e1e1e',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        position: 'fixed',
        top: 0,
        right: 0,
        left: isMobile ? 0 : (sidebarCollapsed ? '70px' : '240px'),
        zIndex: 100,
        height: '64px',
        transition: 'left 0.3s ease',
      }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
          {isMobile && (
            <button
              type="button"
              onClick={onMenuClick}
              style={{
                background: 'none',
                border: 'none',
                color: '#aaa',
                cursor: 'pointer',
                padding: '6px',
                display: 'flex',
                alignItems: 'center',
                borderRadius: '6px',
                flexShrink: 0,
              }}
            >
              <FontAwesomeIcon icon={faBars} />
            </button>
          )}

          <div style={{ minWidth: 0 }}>
            <h1 style={{
              margin: 0,
              fontSize: isMobile ? '15px' : '17px',
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: '-0.3px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {resolveTitle(location.pathname)}
            </h1>
            {!isMobile && (
              <p style={{ margin: 0, fontSize: '11px', color: '#555' }}>
                {resolveSubtitle(location.pathname)}
              </p>
            )}
          </div>
        </div>

        {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#111',
              border: `1px solid ${searchFocused ? '#333' : '#1e1e1e'}`,
              borderRadius: '8px',
              padding: '7px 12px',
              transition: 'border-color 0.2s',
              width: '240px',
            }}>
              <FontAwesomeIcon icon={faSearch} style={{ color: '#444', fontSize: '12px' }} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Search..."
                style={{
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  color: '#fff',
                  fontSize: '13px',
                  width: '100%',
                }}
              />
            </div>

            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '9px',
              padding: '5px 12px 5px 6px',
              backgroundColor: '#111',
              borderRadius: '8px',
              border: '1px solid #1e1e1e',
            }}>
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 700,
                fontSize: '13px',
                flexShrink: 0,
              }}>
                {initials}
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: '#fff', lineHeight: 1.3 }}>
                  {displayName}
                </p>
                <p style={{ margin: 0, fontSize: '10px', color: '#555', lineHeight: 1.3 }}>
                  {roleLabel}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                padding: '8px 12px',
                backgroundColor: 'transparent',
                border: '1px solid #1e1e1e',
                borderRadius: '8px',
                color: '#666',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#ef4444';
                e.currentTarget.style.borderColor = '#ef4444';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#666';
                e.currentTarget.style.borderColor = '#1e1e1e';
              }}
            >
              <FontAwesomeIcon icon={faSignOutAlt} />
              Logout
            </button>
          </div>
        )}

        {isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              style={{
                background: '#111',
                border: '1px solid #1e1e1e',
                color: '#aaa',
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FontAwesomeIcon icon={isMobileMenuOpen ? faTimes : faUser} />
            </button>
          </div>
        )}
      </header>

      {isMobile && isMobileMenuOpen && (
        <>
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              position: 'fixed', inset: 0, top: '64px',
              backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 98,
            }}
          />
          <div style={{
            position: 'fixed',
            top: '64px',
            right: 0,
            width: '280px',
            height: 'calc(100vh - 64px)',
            backgroundColor: '#0a0a0a',
            borderLeft: '1px solid #1e1e1e',
            zIndex: 99,
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            overflowY: 'auto',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '12px', backgroundColor: '#111',
              borderRadius: '10px', border: '1px solid #1e1e1e',
            }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 700, fontSize: '16px',
              }}>
                {initials}
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#fff' }}>
                  {displayName}
                </p>
                <p style={{ margin: 0, fontSize: '11px', color: '#555' }}>{roleLabel}</p>
                {user?.email && <p style={{ margin: 0, fontSize: '10px', color: '#444' }}>{user.email}</p>}
              </div>
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              backgroundColor: '#111', border: '1px solid #1e1e1e',
              borderRadius: '8px', padding: '10px 12px',
            }}>
              <FontAwesomeIcon icon={faSearch} style={{ color: '#444', fontSize: '12px' }} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                style={{
                  background: 'none', border: 'none', outline: 'none',
                  color: '#fff', fontSize: '13px', width: '100%',
                }}
              />
            </div>

            <button
              type="button"
              onClick={handleLogout}
              style={{
                width: '100%', padding: '12px',
                backgroundColor: 'transparent',
                border: '1px solid #ef4444',
                borderRadius: '8px', color: '#ef4444',
                fontSize: '13px', cursor: 'pointer',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '8px',
                marginTop: 'auto',
              }}
            >
              <FontAwesomeIcon icon={faSignOutAlt} />
              Logout
            </button>
          </div>
        </>
      )}
    </>
  );
};

export default TopBar;
