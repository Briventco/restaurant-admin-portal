import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import Sidebar from './Sidebar';
import './AppShell.css';

const SIDEBAR_WIDTH = 232;

const TITLE_MAP = {
  '/dashboard':    { section: 'HOME',       title: 'Dashboard'         },
  '/restaurants':  { section: 'MANAGEMENT', title: 'All Restaurants'   },
  '/sessions':     { section: 'SYSTEM',     title: 'WhatsApp Sessions' },
  '/outbox':       { section: 'SYSTEM',     title: 'Outbox Monitor'    },
  '/overview':     { section: 'RESTAURANT', title: 'Overview'          },
  '/orders':       { section: 'RESTAURANT', title: 'All Orders'        },
  '/payments':     { section: 'RESTAURANT', title: 'Payments'          },
  '/whatsapp':     { section: 'RESTAURANT', title: 'WhatsApp Status'   },
  '/menu':         { section: 'RESTAURANT', title: 'Menu Management'   },
  '/delivery':     { section: 'RESTAURANT', title: 'Delivery Zones'    },
  '/subscription': { section: 'ACCOUNT',    title: 'Subscription'      },
  '/earnings':     { section: 'ACCOUNT',    title: 'Earnings'          },
  '/profile':      { section: 'ACCOUNT',    title: 'Profile'           },
  '/settings':     { section: 'ACCOUNT',    title: 'Settings'          },
  '/help':         { section: 'SUPPORT',    title: 'Help & Support'    },
};

const resolveTitle = (pathname) => {
  if (pathname.startsWith('/restaurants/')) return { section: 'MANAGEMENT', title: 'Restaurant Detail' };
  if (pathname.startsWith('/orders/'))      return { section: 'RESTAURANT', title: 'Order Detail'      };
  return TITLE_MAP[pathname] || { section: '', title: 'Servra' };
};

const getRoleLabel = (role) => {
  const map = {
    super_admin:      'Super Admin',
    restaurant_admin: 'Restaurant Admin',
    restaurant_staff: 'Staff',
  };
  return map[role] || 'User';
};

const AppShell = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [isMobile, setIsMobile]           = useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen]     = useState(false);
  const [searchOpen, setSearchOpen]       = useState(false);
  const [search, setSearch]               = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [userMenuOpen, setUserMenuOpen]   = useState(false);
  const userMenuRef = useRef(null);
  const searchInputRef = useRef(null);

  const { section, title } = resolveTitle(location.pathname);
  const userRole    = user?.role || 'restaurant_staff';
  const roleLabel   = getRoleLabel(userRole);
  const displayName = user?.name || (user?.email ? user.email.split('@')[0] : 'User');
  const initials    = displayName.charAt(0).toUpperCase();

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
    setUserMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="app-shell">

      <Sidebar
        isMobile={isMobile}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {isMobile && sidebarOpen && (
        <div className="app-shell__overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <div
        className="app-shell__content"
        style={{ marginLeft: isMobile ? 0 : `${SIDEBAR_WIDTH}px` }}
      >
        <header className="app-shell__header">

          <div className="app-shell__header-left">
            {isMobile && (
              <button
                className="app-shell__icon-btn"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open menu"
              >
                <MenuIcon />
              </button>
            )}
            {isMobile && (
              <span className="app-shell__mobile-brand">Servra</span>
            )}
          </div>

          <div className="app-shell__header-right">

            {!isMobile && (
              <div className={`app-shell__search ${searchFocused ? 'focused' : ''}`}>
                <SearchIcon />
                <input
                  ref={searchInputRef}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholder="Search restaurants, orders..."
                  className="app-shell__search-input"
                />
                {search && (
                  <button className="app-shell__search-clear" onClick={() => setSearch('')}>
                    <ClearIcon />
                  </button>
                )}
              </div>
            )}

            {isMobile && (
              <button
                className="app-shell__icon-btn"
                onClick={() => setSearchOpen((s) => !s)}
                aria-label="Search"
              >
                <SearchIcon />
              </button>
            )}

            <div className="app-shell__user-wrap" ref={userMenuRef}>
              <button
                className="app-shell__user-btn"
                onClick={() => setUserMenuOpen((o) => !o)}
                aria-label="User menu"
              >
                <div className="app-shell__avatar">{initials}</div>
                {!isMobile && (
                  <>
                    <div className="app-shell__user-info">
                      <span className="app-shell__user-name">{displayName}</span>
                      <span className="app-shell__user-role">{roleLabel}</span>
                    </div>
                    <ChevronIcon open={userMenuOpen} />
                  </>
                )}
              </button>

              {userMenuOpen && (
                <div className="app-shell__user-menu">
                  <div className="app-shell__user-menu-header">
                    <div className="app-shell__avatar app-shell__avatar--lg">{initials}</div>
                    <div>
                      <p className="app-shell__user-menu-name">{displayName}</p>
                      <p className="app-shell__user-menu-email">{user?.email || roleLabel}</p>
                    </div>
                  </div>
                  <div className="app-shell__user-menu-divider" />
                  <button className="app-shell__user-menu-item" onClick={() => { navigate('/profile'); setUserMenuOpen(false); }}>
                    <ProfileIcon /> Profile
                  </button>
                  <button className="app-shell__user-menu-item" onClick={() => { navigate('/settings'); setUserMenuOpen(false); }}>
                    <SettingsIcon /> Settings
                  </button>
                  <div className="app-shell__user-menu-divider" />
                  <button className="app-shell__user-menu-item app-shell__user-menu-item--danger" onClick={handleLogout}>
                    <LogoutIcon /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {isMobile && searchOpen && (
          <div className="app-shell__mobile-search">
            <SearchIcon />
            <input
              ref={searchInputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search restaurants, orders..."
              className="app-shell__search-input"
              autoFocus
            />
            <button className="app-shell__icon-btn" onClick={() => { setSearchOpen(false); setSearch(''); }}>
              <ClearIcon />
            </button>
          </div>
        )}

        <div className="app-shell__page-header">
          {section && <p className="app-shell__section-label">{section}</p>}
          <h1 className="app-shell__page-title">{title}</h1>
        </div>

        <main className="app-shell__main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const MenuIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const ClearIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ChevronIcon = ({ open }) => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const ProfileIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const LogoutIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

export default AppShell;