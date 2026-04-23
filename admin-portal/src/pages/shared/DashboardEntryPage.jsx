import React from 'react';
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

  console.log('[portal-debug] DashboardEntryPage choosing restaurant dashboard');
  return <RestaurantOverviewPage />;
};

export default DashboardEntryPage;
