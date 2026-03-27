import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { DEFAULT_ROUTE_BY_ROLE } from '../../auth/roleConfig';

const RoleHomeRedirect = () => {
  const { user } = useAuth();

  if (!user?.role) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={DEFAULT_ROUTE_BY_ROLE[user.role]} replace />;
};

export default RoleHomeRedirect;
