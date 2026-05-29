import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { ROLES } from './roleConfig';
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

/**
 * RoleRoute — guards by role AND by restaurant verification status.
 *
 * Restaurant admins/staff whose restaurant is "pending" are redirected to
 * /verification-pending. If "rejected", they go to /verification-rejected.
 * Super admins are never redirected by verification.
 *
 * Pass skipVerification={true} for routes that should work regardless of
 * verification status (e.g. the verification holding pages themselves).
 */
export const RoleRoute = ({ children, allowedRoles, skipVerification = false }) => {
  const { user, loading } = useAuth();
  const showLoader = useMinLoadTime(loading);

  if (loading || showLoader) {
    return <LoadingScreen />;
  }

  if (!user) return <Navigate to="/login" />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/forbidden" />;

  // Verification gate — super admins bypass it entirely
  if (!skipVerification && user.role !== ROLES.SUPER_ADMIN) {
    const status = user.verificationStatus;
    if (status === 'pending') {
      return <Navigate to="/verification-pending" replace />;
    }
    if (status === 'rejected') {
      return <Navigate to="/verification-rejected" replace />;
    }
  }

  return <>{children}</>;
};
