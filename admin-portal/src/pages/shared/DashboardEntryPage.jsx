import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { ROLES } from '../../auth/roleConfig';
import SuperAdminDashboardPage from '../superAdmin/SuperAdminDashboardPage';
import RestaurantOverviewPage from '../restaurant/RestaurantOverviewPage';

const DashboardEntryPage = () => {
  const { user } = useAuth();

  if (user?.role === ROLES.SUPER_ADMIN) {
    return <SuperAdminDashboardPage />;
  }

  if (
    user?.role === ROLES.RESTAURANT_ADMIN &&
    user?.onboarding?.status &&
    user.onboarding.status !== 'completed'
  ) {
    return <Navigate to="/onboarding" replace />;
  }

  return <RestaurantOverviewPage />;
};

export default DashboardEntryPage;
