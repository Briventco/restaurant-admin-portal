import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { DEFAULT_ROUTE_BY_ROLE } from '../../auth/roleConfig';

const RoleHomeRedirect = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user?.role) {
        navigate('/login', { replace: true });
      } else {
        navigate(DEFAULT_ROUTE_BY_ROLE[user.role], { replace: true });
      }
    }
  }, [user, loading, navigate]);

  return loading ? <div>Loading...</div> : null;
};

export default RoleHomeRedirect;