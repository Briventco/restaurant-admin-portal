import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import './layout.css';

const Layout = () => {
  const [selectedRole, setSelectedRole] = useState('restaurant_staff');
  const [searchQuery, setSearchQuery] = useState('');

  const roles = [
    { id: 'super_admin', label: 'Super Admin' },
    { id: 'restaurant_admin', label: 'Restaurant Admin' },
    { id: 'restaurant_staff', label: 'Restaurant Staff' },
  ];

  const getRoleLabel = () => {
    const role = roles.find(r => r.id === selectedRole);
    return role ? role.label : 'Restaurant Staff';
  };

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
  };

  const handleLogout = () => {
    localStorage.removeItem('auth');
    localStorage.removeItem('session');
    localStorage.removeItem('userEmail');
    window.location.href = '/login';
  };

  return (
    <div className="layout">
      {/* Left Sidebar - Navigation */}
      <div className="sidebar-left">
        <div className="logo">
          <i className="fas fa-message"></i>
          <span>Brivent Admin</span>
        </div>
        <nav className="nav">
          <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <i className="fas fa-tachometer-alt"></i>
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/orders" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <i className="fas fa-shopping-cart"></i>
            <span>Orders</span>
          </NavLink>
          <NavLink to="/customers" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <i className="fas fa-users"></i>
            <span>Customers</span>
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <i className="fas fa-cog"></i>
            <span>Settings</span>
          </NavLink>
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="content-header">
          <h1>Brivent Admin Portal</h1>
          <p>{getRoleLabel()}</p>
        </div>
        <div className="content">
          <Outlet context={{ selectedRole }} />
        </div>
      </div>

      {/* Right Sidebar - Search, Role, Logout */}
      <div className="sidebar-right">
        {/* Search Bar */}
        <div className="sidebar-search">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search restaurants, orders, customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Quick Action Button */}
        <button className="quick-action-btn">
          <i className="fas fa-bolt"></i>
          {/* Quick Action */}
        </button>

        {/* Role Dropdown */}
        <select 
          value={selectedRole} 
          onChange={handleRoleChange}
          className="role-select"
        >
          {roles.map(role => (
            <option key={role.id} value={role.id}>{role.label}</option>
          ))}
        </select>

        {/* User Role Display */}
        <div className="sidebar-user">
          <i className="fas fa-user-circle"></i>
          <span>{getRoleLabel()}</span>
        </div>

        {/* Logout Button */}
        <button onClick={handleLogout} className="sidebar-logout">
          <i className="fas fa-sign-out-alt"></i>
          <span>logout</span>
        </button>
      </div>
    </div>
  );
};

export default Layout;