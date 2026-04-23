import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { DEFAULT_ROUTE_BY_ROLE } from '../../auth/roleConfig';

const RoleHomeRedirect = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const hasRedirected = useRef(false);

  useEffect(() => {
    console.log('[portal-debug] RoleHomeRedirect effect fired', {
      loading,
      user,
      hasRedirected: hasRedirected.current,
    });
    // Only redirect once, when loading is complete
    if (!loading && !hasRedirected.current) {
      hasRedirected.current = true;
      
      if (!user?.role) {
        console.log('[portal-debug] RoleHomeRedirect sending user to /login');
        navigate('/login', { replace: true });
      } else {
        const redirectPath =
          user.role === 'restaurant_admin' && user?.onboarding?.status !== 'completed'
            ? '/onboarding'
            : DEFAULT_ROUTE_BY_ROLE[user.role];
        console.log('[portal-debug] RoleHomeRedirect redirecting by role', {
          role: user.role,
          redirectPath,
        });
        navigate(redirectPath, { replace: true });
      }
    }
  }, [loading, navigate, user?.role]); // Only depend on role, not entire user object

  // Show loading while auth is initializing
  if (loading) {
    return <div>Loading...</div>;
  }

  // After redirect, return null to stop rendering
  return null;
};

export default RoleHomeRedirect;
