
import React from 'react';
import '/header.css';

const Header = () => {
  return (
    <div className="header">
      <div className="header-title">
        <h1>Admin Portal</h1>
      </div>
      <div className="header-user">
        <i className="fas fa-user-circle"></i>
        <span>Admin</span>
      </div>
    </div>
  );
};

export default Header;
