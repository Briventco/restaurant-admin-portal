import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import './RouteGuards.css';

const MIN_LOAD_TIME = 1000;

const LoadingScreen = () => (
  <div className="auth-loader">
    <div className="auth-loader__spinner" />
  </div>
);

const useMinLoadTime = (loading) => {
  const [showLoader, setShowLoader] = useState(true);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (!loading) {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, MIN_LOAD_TIME - elapsed);
      
      const timer = setTimeout(() => {
        setShowLoader(false);
      }, remaining);
      
      return () => clearTimeout(timer);
    }
  }, [loading, startTime]);

  return showLoader;
};

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const showLoader = useMinLoadTime(loading);
  
  if (loading || showLoader) {
    return <LoadingScreen />;
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

export const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const showLoader = useMinLoadTime(loading);
  
  if (loading || showLoader) {
    return <LoadingScreen />;
  }
  
  if (!isAuthenticated) {
    return children;
  }

  return <Navigate to="/dashboard" replace />;
};

export const RoleRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const showLoader = useMinLoadTime(loading);
  
  if (loading || showLoader) {
    return <LoadingScreen />;
  }
  
  if (!user) return <Navigate to="/login" />;
  
  return allowedRoles.includes(user.role) ? children : <Navigate to="/forbidden" />;
};