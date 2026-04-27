import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { DEFAULT_ROUTE_BY_ROLE } from '../../auth/roleConfig';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';

const SIDEBAR_WIDTH = 232;

/* ── Page title resolver ─────────────────────────────────────── */
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

/* ── Role labels ─────────────────────────────────────────────── */
const roles = [
  { id: 'super_admin',      label: 'Super Admin'      },
  { id: 'restaurant_admin', label: 'Restaurant Admin' },
  { id: 'restaurant_staff', label: 'Restaurant Staff' },
];

/* ── AppShell ────────────────────────────────────────────────── */
const AppShell = () => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { user, logout, switchRole } = useAuth();

  const [isMobile, setIsMobile]         = useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [selectedRole, setSelectedRole] = useState(user?.role || 'restaurant_staff');
  const [search, setSearch]             = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const { section, title } = resolveTitle(location.pathname);
  const initials = user?.email ? user.email.charAt(0).toUpperCase() : 'U';

  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setSidebarOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleRoleChange = (e) => {
    const next = e.target.value;
    setSelectedRole(next);
    if (switchRole) {
      switchRole(next);
      const route = DEFAULT_ROUTE_BY_ROLE?.[next];
      if (route && route !== location.pathname) navigate(route, { replace: true });
    }
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#111111',
      fontFamily: "'Inter', 'DM Sans', system-ui, sans-serif",
      color: '#ffffff',
    }}>

      {/* ── Sidebar ── */}
      <Sidebar
        isMobile={isMobile}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* ── Main column ── */}
      <div style={{
        flex: 1,
        marginLeft: isMobile ? 0 : `${SIDEBAR_WIDTH}px`,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: '#111111',
      }}>

        {/* ── Top bar ── */}
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
          {/* Left: hamburger (mobile) */}
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

          {/* Right: search + role switcher + user pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto' }}>

            {/* Search */}
            {!isMobile && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                backgroundColor: '#1a1a1a',
                border: `1px solid ${searchFocused ? '#333' : '#222'}`,
                borderRadius: '8px',
                padding: '7px 12px',
                width: '220px',
                transition: 'border-color 0.2s',
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholder="Search..."
                  style={{
                    background: 'none', border: 'none', outline: 'none',
                    color: '#fff', fontSize: '13px', width: '100%',
                  }}
                />
              </div>
            )}

            {/* Role switcher */}
            {!isMobile && (
              <select
                value={selectedRole}
                onChange={handleRoleChange}
                style={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #222',
                  color: '#999',
                  padding: '7px 10px',
                  fontSize: '12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>{r.label}</option>
                ))}
              </select>
            )}

            {/* User pill */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '5px 10px 5px 6px',
              backgroundColor: '#1a1a1a',
              border: '1px solid #222',
              borderRadius: '8px',
              cursor: 'pointer',
            }}>
              <div style={{
                width: '26px', height: '26px',
                borderRadius: '50%',
                backgroundColor: '#2d2d2d',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 700, fontSize: '11px',
                flexShrink: 0,
              }}>
                {initials}
              </div>
              {!isMobile && (
                <div>
                  <p style={{ margin: 0, fontSize: '12px', fontWeight: 500, color: '#fff', lineHeight: 1.2 }}>
                    {user?.email?.split('@')[0] || 'User'}
                  </p>
                  <p style={{ margin: 0, fontSize: '10px', color: '#555', lineHeight: 1.2 }}>
                    {roles.find((r) => r.id === selectedRole)?.label}
                  </p>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── Page header ── */}
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

        {/* ── Page content ── */}
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