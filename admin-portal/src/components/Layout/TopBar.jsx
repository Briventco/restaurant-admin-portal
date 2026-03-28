import React, { useState, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { DEFAULT_ROUTE_BY_ROLE, ROLE_LABELS } from '../../auth/roleConfig';
import SearchInput from '../ui/SearchInput';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSearch, faUser, faChevronDown, faSignOutAlt, faBolt } from '@fortawesome/free-solid-svg-icons';

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

const roles = [
  { id: 'super_admin', label: 'Super Admin' },
  { id: 'restaurant_admin', label: 'Restaurant Admin' },
  { id: 'restaurant_staff', label: 'Restaurant Staff' },
];

const resolveTitle = (pathname) => {
  if (pathname.startsWith('/restaurants/')) return 'Restaurant Detail';
  if (pathname.startsWith('/orders/')) return 'Order Detail';
  return TITLE_MAP[pathname] || 'Admin Portal';
};

const TopBar = ({ onMenuClick, sidebarCollapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, switchRole } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState(user?.role || 'restaurant_staff');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const initials = user?.email ? user.email.charAt(0).toUpperCase() : 'U';

  const handleRoleChange = useCallback((e) => {
    const nextRole = e.target.value;
    setSelectedRole(nextRole);
    if (switchRole) {
      switchRole(nextRole);
      const defaultRoute = DEFAULT_ROUTE_BY_ROLE[nextRole];
      if (defaultRoute && defaultRoute !== location.pathname) {
        navigate(defaultRoute, { replace: true });
      }
    }
    setIsMobileMenuOpen(false);
  }, [switchRole, navigate, location.pathname]);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login', { replace: true });
  }, [logout, navigate]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  return (
    <>
      <header style={{
        backgroundColor: '#000000',
        borderBottom: '1px solid #333333',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        position: 'fixed',
        top: 0,
        right: 0,
        left: isMobile ? 0 : (sidebarCollapsed ? '70px' : '240px'),
        zIndex: 200,
        height: '64px',
        transition: 'left 0.3s ease',
      }}>
        {/* Left Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <h1 style={{ 
              margin: 0, 
              fontSize: isMobile ? '16px' : '18px', 
              fontWeight: 600, 
              color: '#ffffff',
              whiteSpace: 'nowrap',
            }}>
              {resolveTitle(location.pathname)}
            </h1>
            {!isMobile && (
              <p style={{ margin: 0, fontSize: '11px', color: '#888888' }}>
                Role-based workspace for WhatsApp ordering operations
              </p>
            )}
          </div>
        </div>

        {/* Desktop Actions */}
        {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <SearchInput
              value={search}
              onChange={handleSearch}
              placeholder="Search restaurants, orders, customers..."
              style={{ minWidth: '260px' }}
            />

            <button
              type="button"
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: 500,
                borderRadius: '6px',
                cursor: 'pointer',
                backgroundColor: '#1a1a1a',
                border: '1px solid #333333',
                color: '#ffffff',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#2a2a2a';
                e.currentTarget.style.borderColor = '#444444';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#1a1a1a';
                e.currentTarget.style.borderColor = '#333333';
              }}
            >
              <FontAwesomeIcon icon={faBolt} size="sm" />
              Quick Action
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <label
                htmlFor="role-switch"
                style={{ fontSize: '11px', fontWeight: 500, color: '#888888', textTransform: 'uppercase', letterSpacing: '0.5px' }}
              >
                {/* Role */}
              </label>
              <select
                id="role-switch"
                value={selectedRole}
                onChange={handleRoleChange}
                style={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333333',
                  color: '#ffffff',
                  padding: '6px 12px',
                  fontSize: '13px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '4px 12px 4px 8px',
              backgroundColor: '#1a1a1a',
              borderRadius: '8px',
              border: '1px solid #333333',
            }}>
              <span style={{
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#333333',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '14px',
                borderRadius: '50%',
                flexShrink: 0,
              }}>
                {initials}
              </span>
              <div>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 500, color: '#ffffff' }}>
                  {user?.email?.split('@')[0] || user?.email}
                </p>
                <p style={{ margin: 0, fontSize: '11px', color: '#888888' }}>
                  {roles.find(r => r.id === selectedRole)?.label}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: 500,
                borderRadius: '6px',
                cursor: 'pointer',
                backgroundColor: 'transparent',
                border: 'none',
                color: '#ffffff',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1a1a1a'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <FontAwesomeIcon icon={faSignOutAlt} />
              Logout
            </button>
          </div>
        )}

        {/* Mobile Actions */}
        {isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              onClick={() => {}}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                fontSize: '18px',
                cursor: 'pointer',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
              }}
            >
              <FontAwesomeIcon icon={faSearch} />
            </button>
            
            <button
              type="button"
              onClick={toggleMobileMenu}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                fontSize: '20px',
                cursor: 'pointer',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
              }}
            >
              <FontAwesomeIcon icon={isMobileMenuOpen ? faTimes : faUser} />
            </button>
          </div>
        )}
      </header>

      {/* Mobile Menu Overlay */}
      {isMobile && isMobileMenuOpen && (
        <>
          <div 
            style={{
              position: 'fixed',
              top: '64px',
              right: 0,
              bottom: 0,
              left: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 199,
              animation: 'fadeIn 0.3s ease',
            }}
            onClick={toggleMobileMenu}
          />
          <div 
            style={{
              position: 'fixed',
              top: '64px',
              right: 0,
              width: '300px',
              height: 'calc(100vh - 64px)',
              backgroundColor: '#0a0a0a',
              borderLeft: '1px solid #333333',
              zIndex: 200,
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              animation: 'slideInRight 0.3s ease',
              overflowY: 'auto',
            }}
          >
            {/* User Info */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              backgroundColor: '#1a1a1a',
              borderRadius: '12px',
              marginBottom: '8px',
            }}>
              <span style={{
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#333333',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '18px',
                borderRadius: '50%',
              }}>
                {initials}
              </span>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#ffffff' }}>
                  {user?.email?.split('@')[0] || user?.email}
                </p>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#888888' }}>
                  {user?.email}
                </p>
              </div>
            </div>

            {/* Search */}
            <div style={{ marginBottom: '8px' }}>
              <SearchInput
                value={search}
                onChange={handleSearch}
                placeholder="Search..."
                style={{ width: '100%' }}
              />
            </div>

            {/* Role Selector */}
            <div style={{ marginBottom: '8px' }}>
              <label style={{ fontSize: '12px', color: '#888888', marginBottom: '6px', display: 'block' }}>
                Select Role
              </label>
              <select
                value={selectedRole}
                onChange={handleRoleChange}
                style={{
                  width: '100%',
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333333',
                  color: '#ffffff',
                  padding: '10px 12px',
                  fontSize: '14px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Action Button */}
            <button
              type="button"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '14px',
                fontWeight: 500,
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: '#1a1a1a',
                border: '1px solid #333333',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginBottom: '8px',
              }}
            >
              <FontAwesomeIcon icon={faBolt} />
              Quick Action
            </button>

            {/* Logout Button */}
            <button
              type="button"
              onClick={handleLogout}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '14px',
                fontWeight: 500,
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: '#1a1a1a',
                border: '1px solid #ef4444',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: 'auto',
              }}
            >
              <FontAwesomeIcon icon={faSignOutAlt} />
              Logout
            </button>
          </div>
        </>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
};

export default TopBar;