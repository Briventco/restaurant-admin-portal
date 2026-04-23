import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { ROLES } from '../../auth/roleConfig';
import SuperAdminDashboardPage from '../superAdmin/SuperAdminDashboardPage';
import RestaurantOverviewPage from '../restaurant/RestaurantOverviewPage';

const DashboardEntryPage = () => {
  const { user } = useAuth();
  console.log('[portal-debug] DashboardEntryPage render', {
    user,
  });

  if (user?.role === ROLES.SUPER_ADMIN) {
    console.log('[portal-debug] DashboardEntryPage choosing super admin dashboard');
    return <SuperAdminDashboardPage />;
  }

  if (
    user?.role === ROLES.RESTAURANT_ADMIN &&
    user?.onboarding?.status &&
    user.onboarding.status !== 'completed'
  ) {
    console.log('[portal-debug] DashboardEntryPage redirecting restaurant admin to onboarding');
    return <Navigate to="/onboarding" replace />;
  }

  console.log('[portal-debug] DashboardEntryPage choosing restaurant dashboard');
  return <RestaurantOverviewPage />;
};

export default DashboardEntryPage;
