import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';

const SIDEBAR_WIDTH = 232;

const TITLE_MAP = {
  '/dashboard':    { section: 'HOME',         title: 'Dashboard'          },
  '/restaurants':  { section: 'MANAGEMENT',   title: 'All Restaurants'    },
  '/sessions':     { section: 'SYSTEM',       title: 'WhatsApp Sessions'  },
  '/outbox':       { section: 'SYSTEM',       title: 'Outbox Monitor'     },
  '/overview':     { section: 'RESTAURANT',   title: 'Overview'           },
  '/orders':       { section: 'RESTAURANT',   title: 'All Orders'         },
  '/payments':     { section: 'RESTAURANT',   title: 'Payments'           },
  '/whatsapp':     { section: 'RESTAURANT',   title: 'WhatsApp Status'    },
  '/menu':         { section: 'RESTAURANT',   title: 'Menu Management'    },
  '/delivery':     { section: 'RESTAURANT',   title: 'Delivery Zones'     },
  '/subscription': { section: 'ACCOUNT',      title: 'Subscription'       },
  '/earnings':     { section: 'ACCOUNT',      title: 'Earnings'           },
  '/profile':      { section: 'ACCOUNT',      title: 'Profile'            },
  '/settings':     { section: 'ACCOUNT',      title: 'Settings'           },
  '/help':         { section: 'SUPPORT',      title: 'Help & Support'     },
};

const resolveTitle = (pathname) => {
  if (pathname.startsWith('/restaurants/')) return { section: 'MANAGEMENT', title: 'Restaurant Detail' };
  if (pathname.startsWith('/orders/'))      return { section: 'RESTAURANT', title: 'Order Detail'       };
  return TITLE_MAP[pathname] || { section: '', title: 'Brivent' };
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

const AppShell = () => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { user, logout } = useAuth();

  const [isMobile, setIsMobile]         = useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [search, setSearch]             = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const { section, title } = resolveTitle(location.pathname);
  const initials = user?.name ? user.name.charAt(0).toUpperCase() : 
                   user?.email ? user.email.charAt(0).toUpperCase() : 'U';
  const userRole = user?.role || 'restaurant_staff';
  const roleLabel = getRoleLabel(userRole);
  const displayName = user?.name || (user?.email ? user.email.split('@')[0] : 'User');

  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setSidebarOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#111111',
      fontFamily: "'Inter', 'DM Sans', system-ui, sans-serif",
      color: '#ffffff',
    }}>

      <Sidebar
        isMobile={isMobile}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div style={{
        flex: 1,
        marginLeft: isMobile ? 0 : `${SIDEBAR_WIDTH}px`,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: '#111111',
      }}>

        <header style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 28px',
          height: '56px',
          backgroundColor: '#111111',
          borderBottom: '1px solid #1c1c1c',
          gap: '16px',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(true)}
                style={{
                  background: 'none', border: 'none', color: '#888',
                  cursor: 'pointer', padding: '4px', display: 'flex',
                  alignItems: 'center', borderRadius: '6px',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: 'auto', flex: 1, maxWidth: '600px' }}>

            {!isMobile && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                backgroundColor: '#1a1a1a',
                border: `1px solid ${searchFocused ? '#444' : '#2a2a2a'}`,
                borderRadius: '10px',
                padding: '8px 16px',
                flex: 1,
                transition: 'all 0.2s',
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholder="Search restaurants, orders, customers, menu items..."
                  style={{
                    background: 'none',
                    border: 'none',
                    outline: 'none',
                    color: '#fff',
                    fontSize: '14px',
                    width: '100%',
                  }}
                />
              </div>
            )}

            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '5px 12px 5px 8px',
              backgroundColor: '#1a1a1a',
              border: '1px solid #2a2a2a',
              borderRadius: '10px',
            }}>
              <div style={{
                width: '30px', height: '30px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 700, fontSize: '12px',
                flexShrink: 0,
              }}>
                {initials}
              </div>
              {!isMobile && (
                <div>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 500, color: '#fff', lineHeight: 1.3 }}>
                    {displayName}
                  </p>
                  <p style={{ margin: 0, fontSize: '10px', color: '#666', lineHeight: 1.3 }}>
                    {roleLabel}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              style={{
                background: 'none',
                border: '1px solid #2a2a2a',
                color: '#999',
                padding: '8px 14px',
                fontSize: '13px',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#ef4444';
                e.currentTarget.style.borderColor = '#ef4444';
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#999';
                e.currentTarget.style.borderColor = '#2a2a2a';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              Logout
            </button>
          </div>
        </header>

        <div style={{
          padding: '28px 28px 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '16px',
        }}>
          <div>
            {section && (
              <p style={{
                margin: '0 0 4px',
                fontSize: '11px',
                fontWeight: 500,
                color: '#555',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}>
                {section}
              </p>
            )}
            <h1 style={{
              margin: 0,
              fontSize: '26px',
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: '-0.5px',
              lineHeight: 1.15,
            }}>
              {title}
            </h1>
          </div>
        </div>

        <main style={{
          flex: 1,
          padding: '24px 28px 32px',
          overflowY: 'auto',
        }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppShell;
