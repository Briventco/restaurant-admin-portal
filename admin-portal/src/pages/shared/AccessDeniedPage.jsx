import React from 'react';
import { Link } from 'react-router-dom';

const AccessDeniedPage = () => {
  return (
    <div className="card empty-state">
      <p className="empty-state-title">Access denied</p>
      <p className="empty-state-description">Your role does not have permission to access this page.</p>
      <Link to="/" className="button">Go to allowed area</Link>
    </div>
  );
};

export default AccessDeniedPage;