import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { DEFAULT_ROUTE_BY_ROLE, ROLE_LABELS } from '../../auth/roleConfig';
import SearchInput from '../ui/SearchInput';

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

const resolveTitle = (pathname) => {
  if (pathname.startsWith('/restaurants/')) {
    return 'Restaurant Detail';
  }
  if (pathname.startsWith('/orders/')) {
    return 'Order Detail';
  }

  return TITLE_MAP[pathname] || 'Admin Portal';
};

const Topbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, availableRoles, switchRole } = useAuth();
  const [search, setSearch] = useState('');

  const initials = user?.email ? user.email.charAt(0).toUpperCase() : 'U';

  const handleRoleChange = (nextRole) => {
    switchRole(nextRole);
    navigate(DEFAULT_ROUTE_BY_ROLE[nextRole], { replace: true });
  };

  return (
    <header className="topbar">
      <div className="topbar-main">
        <h1>{resolveTitle(location.pathname)}</h1>
        <p className="muted-text">Role-based workspace for WhatsApp ordering operations</p>
      </div>

      <div className="topbar-controls">
        <SearchInput
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search restaurants, orders, customers..."
          className="topbar-search"
        />

        <button type="button" className="button button-outline">Quick Action</button>

        <div className="role-select-block">
          <label htmlFor="role-switch" className="input-label">Role</label>
          <select
            id="role-switch"
            value={user?.role || ''}
            onChange={(event) => handleRoleChange(event.target.value)}
            className="input"
          >
            {availableRoles.map((role) => (
              <option key={role} value={role}>
                {ROLE_LABELS[role]}
              </option>
            ))}
          </select>
        </div>

        <div className="profile-chip">
          <span className="profile-avatar">{initials}</span>
          <div>
            <p className="profile-email">{user?.email}</p>
            <p className="muted-text">{ROLE_LABELS[user?.role]}</p>
          </div>
        </div>

        <button type="button" className="button button-ghost" onClick={logout}>Logout</button>
      </div>
    </header>
  );
};

export default Topbar;
