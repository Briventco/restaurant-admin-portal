import React from 'react';
import { Navigate } from 'react-router-dom';
import { DEFAULT_ROUTE_BY_ROLE, hasRoleAccess } from './roleConfig';
import { useAuth } from './AuthContext';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated && user?.role) {
    return <Navigate to={DEFAULT_ROUTE_BY_ROLE[user.role]} replace />;
  }

  return children;
};

export const RoleRoute = ({ allowedRoles, children }) => {
  const { user } = useAuth();

  if (!user || !hasRoleAccess(user.role, allowedRoles)) {
    return <Navigate to="/forbidden" replace />;
  }

  return children;
};
