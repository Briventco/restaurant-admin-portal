import React from 'react';
import { useAuth } from '../../auth/AuthContext';
import { ROLES } from '../../auth/roleConfig';
import SuperAdminDashboardPage from '../superAdmin/SuperAdminDashboardPage';
import RestaurantOverviewPage from '../restaurant/RestaurantOverviewPage';

const DashboardEntryPage = () => {
  const { user } = useAuth();

  if (user?.role === ROLES.SUPER_ADMIN) {
    return <SuperAdminDashboardPage />;
  }

  return <RestaurantOverviewPage />;
};

export default DashboardEntryPage;
