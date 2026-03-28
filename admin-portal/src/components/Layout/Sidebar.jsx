import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { ROLES } from '../../auth/roleConfig';
import './sidebar.css';

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
    label: 'WhatsApp Sessions',
    roles: [ROLES.SUPER_ADMIN],
    icon: 'fab fa-whatsapp',
  },
  {
    path: '/outbox',
    label: 'Outbox Monitor',
    roles: [ROLES.SUPER_ADMIN],
    icon: 'fas fa-outdent',
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
    icon: 'fas fa-shopping-cart',
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
    label: 'Menu Management',
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

const Sidebar = () => {
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const userRole = user?.role;

  const navItems = NAV_ITEMS.filter((item) => {
    if (!userRole) return false;
    return item.roles.includes(userRole);
  });

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  console.log('User role:', userRole);
  console.log('Nav items to display:', navItems);

  return (
    <>
      {/* Overlay for mobile when sidebar is open */}
      {!isCollapsed && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}
      
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-logo">
            <i className="fas fa-utensils"></i>
          </div>
          <div className="brand-info">
            <p className="brand-title">Brivent Admin Portal</p>
            <p className="brand-subtitle">{ROLE_LABELS[userRole] || 'Workspace'}</p>
          </div>
          <button className="close-sidebar-btn" onClick={toggleSidebar}>
            <i className={`fas ${isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
          </button>
        </div>

        <nav className="nav-list">
          {navItems.length === 0 && (
            <div style={{ color: '#ffffff', padding: '10px', textAlign: 'center' }}>
              No menu items available
            </div>
          )}
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              title={isCollapsed ? item.label : ''}
            >
              <i className={item.icon}></i>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;