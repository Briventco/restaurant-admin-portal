import React, { useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes, faSearch, faUser, faSignOutAlt, faBars,
} from '@fortawesome/free-solid-svg-icons';
import './TopBar.css';

const TITLE_MAP = {
  '/dashboard': 'Dashboard',
  '/restaurants': 'Restaurants',
  '/sessions': 'WhatsApp Sessions',
  '/central-sender': 'Central Sender',
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
  '/central-sender': 'Shared alert sender connection',
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
      return 'Servra Admin';
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
      <header className={`topbar ${isMobile ? 'topbar--mobile' : ''} ${sidebarCollapsed ? 'topbar--sidebar-collapsed' : ''}`}>
        <div className="topbar__left">
          {isMobile && (
            <button
              type="button"
              onClick={onMenuClick}
              className="topbar__menu-btn"
            >
              <FontAwesomeIcon icon={faBars} />
            </button>
          )}

          <div className="topbar__title-block">
            <h1 className={`topbar__title ${isMobile ? 'topbar__title--mobile' : ''}`}>
              {resolveTitle(location.pathname)}
            </h1>
            {!isMobile && (
              <p className="topbar__subtitle">
                {resolveSubtitle(location.pathname)}
              </p>
            )}
          </div>
        </div>

        {!isMobile && (
          <div className="topbar__right">
            <div className={`topbar__search ${searchFocused ? 'topbar__search--focused' : ''}`}>
              <FontAwesomeIcon icon={faSearch} className="topbar__search-icon" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Search..."
                className="topbar__search-input"
              />
            </div>

            <div className="topbar__user">
              <div className="topbar__avatar">
                {initials}
              </div>
              <div>
                <p className="topbar__user-name">{displayName}</p>
                <p className="topbar__user-role">{roleLabel}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="topbar__logout-btn"
            >
              <FontAwesomeIcon icon={faSignOutAlt} />
              Logout
            </button>
          </div>
        )}

        {isMobile && (
          <div className="topbar__mobile-actions">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="topbar__user-toggle-btn"
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
            className="topbar__mobile-overlay"
          />
          <div className="topbar__mobile-menu">
            <div className="topbar__mobile-user-card">
              <div className="topbar__mobile-avatar">
                {initials}
              </div>
              <div>
                <p className="topbar__mobile-user-name">{displayName}</p>
                <p className="topbar__mobile-user-role">{roleLabel}</p>
                {user?.email && <p className="topbar__mobile-user-email">{user.email}</p>}
              </div>
            </div>

            <div className="topbar__mobile-search">
              <FontAwesomeIcon icon={faSearch} className="topbar__search-icon" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="topbar__search-input"
              />
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="topbar__mobile-logout-btn"
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
