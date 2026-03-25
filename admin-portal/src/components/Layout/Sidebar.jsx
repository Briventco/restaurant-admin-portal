import React from 'react';
import { NavLink } from 'react-router-dom';
import '../../styles/sidebar.css';

const Sidebar = () => {
  const menuItems = [
    { name: 'Dashboard', path: '/', icon: 'fas fa-tachometer-alt' },
    { name: 'Orders', path: '/orders', icon: 'fas fa-shopping-cart' },
    { name: 'Customers', path: '/customers', icon: 'fas fa-users' },
    { name: 'Settings', path: '/settings', icon: 'fas fa-cog' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('auth');
    window.location.href = '/login';
  };

  return (
    <div className="sidebar">
      <div className="logo">
        <i className="fas fa-message"></i>
        <span>Brivent Admin</span>
      </div>
      <nav className="nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            <i className={item.icon}></i>
            <span>{item.name}</span>
          </NavLink>
        ))}
        <button onClick={handleLogout} className="logout-btn">
          <i className="fas fa-sign-out-alt"></i>
          <span>Logout</span>
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;