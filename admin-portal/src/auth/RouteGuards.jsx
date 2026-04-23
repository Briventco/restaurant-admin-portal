import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  console.log('[portal-debug] ProtectedRoute check', {
    loading,
    isAuthenticated,
  });
  
  // Show loading while checking authentication
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

export const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  console.log('[portal-debug] PublicOnlyRoute check', {
    loading,
    isAuthenticated,
  });
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return !isAuthenticated ? children : <Navigate to="/" />;
};

export const RoleRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  console.log('[portal-debug] RoleRoute check', {
    loading,
    user,
    allowedRoles,
  });
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) return <Navigate to="/login" />;
  
  return allowedRoles.includes(user.role) ? children : <Navigate to="/forbidden" />;
};
