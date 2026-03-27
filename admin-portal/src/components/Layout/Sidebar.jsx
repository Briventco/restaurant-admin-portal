import React from 'react';
import { NavLink } from 'react-router-dom';
import { NAV_ITEMS, ROLE_LABELS } from '../../auth/roleConfig';
import { useAuth } from '../../auth/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();

  const navItems = NAV_ITEMS.filter((item) => item.roles.includes(user?.role));

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <p className="brand-title">Brivent Admin Portal</p>
        <p className="brand-subtitle">{ROLE_LABELS[user?.role] || 'Workspace'}</p>
      </div>

      <nav className="nav-list">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
