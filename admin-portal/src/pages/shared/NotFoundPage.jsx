import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="card empty-state">
      <p className="empty-state-title">Page not found</p>
      <p className="empty-state-description">This route does not exist in the admin portal.</p>
      <Link to="/" className="button">Back to home</Link>
    </div>
  );
};

export default NotFoundPage;