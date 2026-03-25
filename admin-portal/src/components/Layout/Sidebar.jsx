import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../../styles/sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();
  
  const menuItems = [
    { name: 'Dashboard', path: '/', icon: 'fas fa-tachometer-alt' },
    { name: 'Orders', path: '/orders', icon: 'fas fa-shopping-cart' },
    { name: 'Customers', path: '/customers', icon: 'fas fa-users' },
    { name: 'Settings', path: '/settings', icon: 'fas fa-cog' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('auth');
    localStorage.removeItem('session');
    localStorage.removeItem('userEmail');
    navigate('/login');
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
      </nav>
      <div className="logout-wrapper">
        <button onClick={handleLogout} className="logout-btn">
          <i className="fas fa-sign-out-alt"></i>